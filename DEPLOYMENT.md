# Deployment Guide — Docker on AWS (EC2) with CI/CD

Deploy the ISO CRM (React frontend + Node backend) as Docker images on a single AWS
EC2 instance, with a GitHub Actions pipeline that auto-deploys on merge to your live branch.

---

## Stack summary

| Part         | Tech                         | Where it lives           |
|--------------|------------------------------|--------------------------|
| Frontend     | React (Create React App)     | nginx Docker container   |
| Backend      | Node / Express (port 5000)   | Node Docker container    |
| Database     | MongoDB Atlas                | External (unchanged)     |
| File uploads | Cloudinary                   | External (unchanged)     |
| Registry     | AWS ECR                      | AWS                      |
| Compute      | AWS EC2 + docker-compose     | AWS                      |
| CI/CD        | GitHub Actions               | GitHub                   |

Backend env vars required: `MONGODB_URI`, `JWT_SECRET`, `AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`, `GMAIL_USER`, `GMAIL_PASS`,
`CLIENT_URL`. (File uploads now go to AWS S3 — see "App-specific gotchas".)

---

## Target architecture

```
You merge a PR → live branch
        │
        ▼
GitHub Actions (CI/CD)
   1. build backend image + frontend(nginx) image
   2. push both to AWS ECR
   3. SSH into EC2 → docker compose pull → up -d
        │
        ▼
EC2 VM (Ubuntu, Docker)
   ├─ frontend container (nginx)  :80/:443  ──┐ serves React build
   └─ backend container (node)    :5000       │ nginx proxies /api/* → backend:5000
                                              │
                          MongoDB Atlas + Cloudinary (stay external, unchanged)
```

Because nginx proxies `/api` to the backend, the frontend and backend share **one
origin** — this removes CORS issues and the build-time API-URL problem.

---

## Phase 1 — Containerize locally (build & test on your PC first)

Add the following 6 files.

### 1. `backend/Dockerfile`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### 2. `backend/.dockerignore`
```
node_modules
.env
uploads
npm-debug.log
```

### 3. `frontend/Dockerfile` (multi-stage: build with Node, serve with nginx)
```dockerfile
# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- serve stage ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
```

### 4. `frontend/nginx.conf`
```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # React Router: send all unknown routes to index.html
    location / {
        try_files $uri /index.html;
    }

    # Forward API + uploads to the backend container (service name "backend")
    location /api/ {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /uploads/ {
        proxy_pass http://backend:5000;
    }
}
```

### 5. `frontend/.dockerignore`
```
node_modules
build
.env
```

### 6. `docker-compose.yml` (project root) — used both locally and on EC2
```yaml
services:
  backend:
    image: ${ECR_REGISTRY}/iso-crm-backend:latest   # local test: replace with  build: ./backend
    restart: always
    env_file: ./backend/.env
    expose:
      - "5000"

  frontend:
    image: ${ECR_REGISTRY}/iso-crm-frontend:latest   # local test: replace with  build: ./frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Required code fix
`frontend/src/pages/Login.js` (~line 150) hardcodes
`https://iso-crm-new-8.onrender.com/api/health`. Change it to the relative path
`/api/health` so it works through nginx in any environment. Other API calls already
use relative `/api/...` paths and need no change.

### Test locally
Temporarily swap the `image:` lines in `docker-compose.yml` for `build:` lines, then:
```bash
docker compose up --build
# open http://localhost  → app should work end-to-end
```

---

## Phase 2 — AWS one-time setup

### 1. Create two ECR repositories
```bash
aws ecr create-repository --repository-name iso-crm-backend
aws ecr create-repository --repository-name iso-crm-frontend
```

### 2. Launch an EC2 instance
- AMI: **Ubuntu 22.04**
- Type: **t3.small** (t3.micro works but is tight for `npm run build`)
- Security group inbound: **22** (SSH, your IP only), **80** (HTTP, anywhere), **443** (HTTPS, anywhere)
- Create/download a key pair (`.pem`)
- Allocate an **Elastic IP** and associate it (so the IP survives reboots)

### 3. Install Docker on EC2 (SSH in, then run)
```bash
sudo apt update && sudo apt install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu          # re-login after this
# compose plugin:
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

### 4. Let EC2 pull from ECR
Attach an **IAM role** to the instance with the `AmazonEC2ContainerRegistryReadOnly`
policy. (Cleaner than storing AWS keys on the box.)

### 5. Put secrets + compose file on the server
- Create `~/app/backend/.env` on EC2 with your real values (`MONGODB_URI`, `JWT_SECRET`,
  `CLOUDINARY_*`, `GMAIL_*`, `CLIENT_URL`). **Never bake secrets into images.**
- Copy `docker-compose.yml` to `~/app/`.

### 6. MongoDB Atlas network access
Atlas → Network Access → add the EC2 Elastic IP (or keep `0.0.0.0/0` if already open,
though tightening to the EC2 IP is better).

---

## Phase 3 — First manual deploy (verify before automating)

From your PC:
```bash
# authenticate Docker to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <acct>.dkr.ecr.<region>.amazonaws.com

# build, tag, push both
docker build -t <ecr>/iso-crm-backend:latest ./backend && docker push <ecr>/iso-crm-backend:latest
docker build -t <ecr>/iso-crm-frontend:latest ./frontend && docker push <ecr>/iso-crm-frontend:latest
```

On EC2:
```bash
cd ~/app
export ECR_REGISTRY=<acct>.dkr.ecr.<region>.amazonaws.com
aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
docker compose pull && docker compose up -d
```

Visit `http://<EC2-public-IP>` — that's the live site. ✅

---

## Phase 4 — CI/CD pipeline (merge to live branch → auto-deploy)

Add `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS
on:
  push:
    branches: [ master ]      # set to whichever branch is your "live" branch

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - uses: aws-actions/amazon-ecr-login@v2
        id: ecr

      - name: Build & push images
        env:
          REG: ${{ steps.ecr.outputs.registry }}
        run: |
          docker build -t $REG/iso-crm-backend:latest ./backend
          docker build -t $REG/iso-crm-frontend:latest ./frontend
          docker push $REG/iso-crm-backend:latest
          docker push $REG/iso-crm-frontend:latest

      - name: Deploy on EC2 over SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/app
            export ECR_REGISTRY=${{ steps.ecr.outputs.registry }}
            aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
            docker compose pull
            docker compose up -d
            docker image prune -f
```

### GitHub repo secrets to add
Settings → Secrets and variables → Actions:

| Secret                  | Value                              |
|-------------------------|------------------------------------|
| `AWS_ACCESS_KEY_ID`     | IAM user access key                |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key                |
| `AWS_REGION`            | e.g. `ap-south-1`                  |
| `EC2_HOST`              | EC2 Elastic/public IP              |
| `EC2_SSH_KEY`           | full contents of your `.pem` file  |

> **Branch note:** the repo's default branch is `master`. Point the workflow trigger at
> whichever branch you merge into for "live."

After this: **merge → site updates automatically in ~2–3 min.**

---

## Phase 5 — HTTPS + domain (recommended before real use)

- Use an **Elastic IP** (already allocated in Phase 2) and point your domain's **A record** at it.
- For TLS, easiest options: swap frontend nginx for **Caddy** (auto Let's Encrypt), or add
  **certbot** to nginx.
- Set `CLIENT_URL=https://yourdomain.com` in the EC2 `~/app/backend/.env`.

---

## App-specific gotchas

1. **CRA env vars bake at build time.** With nginx proxying `/api`, you don't need a
   build-time backend URL — keep API calls relative. This is why the nginx approach is clean.
2. **File uploads go to AWS S3** (private bucket, "Block all public access" stays ON).
   The browser opens files via `/api/files/<key>`, which 302-redirects to a short-lived
   presigned URL. The legacy `backend/uploads/` disk path remains only as a fallback when
   S3 is unreachable, and is ephemeral in Docker — add a named volume only if you rely on it.
3. **Secrets stay in EC2's `.env`**, never in the image or git (`.gitignore` already
   excludes `.env`).
4. Once AWS is live, you can **retire Render + Vercel** and the `keep-render-alive` workflow.

---

## Quick checklist

- [ ] Add Dockerfiles, `.dockerignore`, `nginx.conf`, `docker-compose.yml`
- [ ] Fix hardcoded health-check URL in `Login.js`
- [ ] Test `docker compose up --build` locally
- [ ] Create 2 ECR repos
- [ ] Launch EC2 + Elastic IP + security group
- [ ] Install Docker on EC2, attach ECR-read IAM role
- [ ] Put `.env` + `docker-compose.yml` on EC2
- [ ] Allowlist EC2 IP in MongoDB Atlas
- [ ] Manual first deploy → verify at `http://<IP>`
- [ ] Add GitHub Actions workflow + repo secrets
- [ ] Merge to live branch → confirm auto-deploy
- [ ] Domain + HTTPS

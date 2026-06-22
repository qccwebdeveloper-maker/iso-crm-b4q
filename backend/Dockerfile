# Backend — Node.js / Express API
FROM node:20-alpine
WORKDIR /app

# Install only production dependencies (smaller, faster image)
COPY package*.json ./
RUN npm install --omit=dev

# App source
COPY . .

EXPOSE 5000
CMD ["node", "server.js"]

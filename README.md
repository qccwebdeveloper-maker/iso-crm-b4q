# QC Certification CRM — v10

ISO Certification Management Platform — React + Node.js (no MongoDB needed).

## Quick Start

### Step 1 — Backend
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### Step 2 — Frontend (new terminal)
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

Open http://localhost:3000

---

## Login Credentials

| Role     | Email                | Password   | Notes                         |
|----------|----------------------|------------|-------------------------------|
| Admin    | admin@crm.com        | admin123   | Also OTP via phone 9000000001 |
| Client   | client@crm.com       | client123  | Client ID: CLT-DEMO-001       |
| Auditor  | auditor@crm.com      | auditor123 | Assigned to APP1000, APP1001  |
| Sales    | sales@crm.com        | sales123   |                               |

---

## Features Added (v10)

### 1. Admin Login via Phone OTP
- Login page → click **Admin OTP** tab
- Enter admin mobile: `9000000001`
- Click **Send OTP** → OTP printed in backend console + shown in response as `demo_otp`
- Enter 6-digit OTP (supports paste) → redirected to Admin Dashboard
- Timer countdown with Resend OTP option

### 2. New Client Self-Registration
- Login page → click **Create Account** tab
- Fill all 7 required fields: Company Name, Email, Password, Mobile, Address, ISO Standard, Scope
- Account is created with `isActive: false` (awaiting admin approval)
- A unique **Client ID** is generated (e.g. `CLT-M3X7K2-A9F`) and shown on success screen

### 3. Admin Approval Workflow (User Management)
- Admin → User Management → orange banner shows count of pending registrations
- Click **Pending Approval** tab → see all unapproved clients with their details
- **Approve** → activates the account; client can now log in
- **Reject** → removes the registration

### 4. Pending Account Login Message
- If client tries to log in before approval:  
  *"Your account is pending admin approval. Please wait for activation."*

### 5. Client Feedback Page
- Client sidebar → Feedback → select application, set star rating, write message

---

## All Routes Fixed
- `/client/feedback` → Client Feedback page (was missing)
- `form-row-3` CSS grid class added (was causing layout breaks)
- `btn-outline`, `btn-gold` CSS classes added
- `applications.js` dead-code-after-module.exports bug fixed (image upload route was unreachable)
- All routes wired in App.js with correct imports

---

## Key API Endpoints

| Method | Endpoint                      | Auth     | Description                           |
|--------|-------------------------------|----------|---------------------------------------|
| POST   | /api/auth/login               | Public   | Email + password → JWT                |
| POST   | /api/auth/send-otp            | Public   | Send OTP to admin phone               |
| POST   | /api/auth/verify-otp          | Public   | Verify OTP → JWT (admin only)         |
| POST   | /api/auth/register-client     | Public   | New client registration               |
| GET    | /api/auth/me                  | JWT      | Get current user                      |
| GET    | /api/users                    | Admin    | List all users (incl. pending)        |
| PUT    | /api/users/:id                | Admin    | Update user / approve registration    |
| DELETE | /api/users/:id                | Admin    | Delete / reject user                  |
| GET    | /api/applications             | JWT      | List applications (filtered by role)  |
| POST   | /api/applications             | Client   | Create application                    |
| POST   | /api/applications/:id/submit  | Client   | Submit for review                     |
| POST   | /api/applications/:id/assign  | Admin    | Assign auditor/reviewer               |
| PUT    | /api/applications/:id/status  | Any      | Update status                         |
| POST   | /api/applications/:id/upload  | Any      | Upload document                       |
| POST   | /api/applications/:id/feedback| Any      | Submit feedback                       |


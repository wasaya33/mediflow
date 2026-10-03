# MediFlow — Multi-Tenant SaaS Medical Billing Platform

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=nodedotjs)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

MediFlow is a cloud-native, multi-tenant SaaS medical billing and revenue cycle management (RCM) platform engineered for modern healthcare providers, billing agencies, and clinics.

---

## 🌟 Architecture & Highlights

- **Multi-Tenant Architecture**: Strict application-level tenant isolation via `organizationId` enforced in every database query.
- **Document-Based Data Store**: MongoDB Atlas powered by Prisma ORM using `@id @default(auto()) @map("_id") @db.ObjectId` with index synchronization via `prisma db push`.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions supporting 6 roles:
  - `PLATFORM_ADMIN`: Global platform super-administrator.
  - `ORG_ADMIN`: Organization clinic administrator.
  - `BILLING_MANAGER`: Senior billing supervisor with oversight.
  - `BILLING_SPECIALIST`: Medical billing technician managing claims.
  - `PROVIDER`: Physician / medical provider submitting encounters.
  - `VIEWER`: Read-only reporting access.
- **Fail-Fast Runtime Validation**: Full environment variable validation on startup using Zod.
- **Security & HIPAA Awareness**:
  - Passwords hashed with bcrypt (10 rounds).
  - Passwords strictly omitted from all query projections and API responses.
  - Immutable `AuditLog` records for all mutations, logins, and profile changes.
  - HTTP security headers via `helmet` and strict CORS configuration.
- **Standardized API Responses**: Uniform envelope format across all endpoints (`{ success, message, data, meta? }`).

---

## 📁 Repository Structure

```
mediflow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # 19 models, 6 enums, 25 MongoDB compound indexes
│   │   └── seed.ts             # Idempotent seed script (ICD-10, CPT, Demo Org, Admin)
│   ├── src/
│   │   ├── config/
│   │   │   ├── constants.ts    # Enums, roles, claim statuses, pagination defaults
│   │   │   ├── db.ts           # PrismaClient singleton with globalThis cache
│   │   │   └── env.ts          # Zod schema environment validation
│   │   ├── middlewares/
│   │   │   ├── asyncHandler.ts # Higher-order promise rejection wrapper
│   │   │   ├── auth.ts         # JWT Bearer token authentication
│   │   │   ├── errorHandler.ts # Global 4-parameter error handler (Prisma + Zod + AppError)
│   │   │   ├── rbac.ts         # authorize() & requireRoles() RBAC middleware
│   │   │   ├── tenant.ts       # Tenant context extraction & verification
│   │   │   └── validate.ts     # Zod request validator (body, query, params)
│   │   ├── modules/
│   │   │   ├── auth/           # Registration, login, profile, password change
│   │   │   ├── organizations/  # Tenant profile, settings, operational counts
│   │   │   └── users/          # Tenant-isolated user management & soft deactivation
│   │   ├── shared/
│   │   │   ├── errors/         # AppError hierarchy (400, 401, 403, 404, 409)
│   │   │   ├── types/          # Shared TypeScript interfaces & pagination types
│   │   │   └── utils/          # Standardized response helpers & logger
│   │   ├── types/
│   │   │   └── express.d.ts    # Ambient Express.Request typing (user, organizationId)
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # Server entry point with graceful shutdown
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # Client application (Next.js / Vite)
└── README.md
```

---

## 🗄️ Database Models (MongoDB Atlas)

The schema defines **19 models** and **6 enums** optimized for MongoDB:

| Category | Models | Description |
| :--- | :--- | :--- |
| **Tenant & Identity** | `Organization`, `User` | Tenant root account and RBAC users with compound unique index on `[organizationId, email]`. |
| **Clinical Entities** | `Patient`, `InsurancePolicy`, `Provider`, `Appointment`, `Encounter` | Medical Record Numbers (MRN), insurance policies, provider NPI tracking, and clinical visits. |
| **Medical Reference** | `DiagnosisCode`, `ProcedureCode` | Global reference catalogs for ICD-10 and CPT coding datasets. |
| **Billing & Claims** | `Claim`, `ClaimDiagnosis`, `ClaimProcedure`, `Payment`, `Denial`, `Invoice` | Multi-line claims, diagnosis pointers, payment allocations, denial resolution workflows, and patient invoices. |
| **Operations & Audit** | `Task`, `Document`, `Notification`, `AuditLog` | Task queues, clinical documents, in-app notifications, and immutable HIPAA audit trail. |

---

## 🚀 API Endpoints

### System & Health
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Welcome endpoint with service links |
| `GET` | `/api/health` | Public | Service health check with timestamp & environment |

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new tenant organization and initial `ORG_ADMIN` user |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT Bearer token |
| `GET` | `/api/auth/me` | Protected | Get authenticated user profile with organization details |
| `PUT` | `/api/auth/profile` | Protected | Update current user's name or phone |
| `PUT` | `/api/auth/change-password` | Protected | Change password with current password verification |

### Organization Management (`/api/organizations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/organizations/me` | `ORG_ADMIN`, `PLATFORM_ADMIN` | Get current organization details and live counts |
| `PUT` | `/api/organizations/me` | `ORG_ADMIN`, `PLATFORM_ADMIN` | Update organization settings, contact info, and tax ID |

### User Management (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | `ORG_ADMIN`, `BILLING_MANAGER` | List organization users with pagination, search & filters |
| `GET` | `/api/users/:id` | `ORG_ADMIN`, `BILLING_MANAGER` | Get single user by ID within current tenant |
| `POST` | `/api/users` | `ORG_ADMIN`, `PLATFORM_ADMIN` | Create user in organization with role & temporary password |
| `PUT` | `/api/users/:id` | `ORG_ADMIN`, `PLATFORM_ADMIN` | Update user details, role, or active status |
| `PUT` | `/api/users/:id/deactivate` | `ORG_ADMIN`, `PLATFORM_ADMIN` | Soft delete / deactivate user (self-deactivation blocked) |
| `DELETE` | `/api/users/:id` | `ORG_ADMIN`, `PLATFORM_ADMIN` | Soft delete alias |

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js** 18.x or 20.x+
- **MongoDB Atlas** database cluster (or local MongoDB 6+)
- **Git**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/wasaya33/mediflow.git
cd mediflow/backend

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your environment variables:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mediflow?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long-change-in-prod"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
BCRYPT_SALT_ROUNDS=10
COOKIE_SECRET="your-cookie-secret-min-32-chars-long-change-in-prod"
```

### 4. Database Setup & Seeding
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema and create indexes on MongoDB Atlas
npm run prisma:push

# Seed initial ICD-10, CPT codes, and Demo Clinic
npm run prisma:seed
```

### 5. Start Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:5000`.

---

## 🧪 Testing with cURL

### 1. Register New Tenant & Admin
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "orgName": "Metro Health Partners",
    "orgSlug": "metro-health",
    "name": "Dr. Sarah Jenkins",
    "email": "sarah@metrohealth.com",
    "password": "Password123!"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah@metrohealth.com",
    "password": "Password123!"
  }'
```

### 3. Authenticated Request
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 4. Create User in Organization
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alex Rivera",
    "email": "alex.billing@metrohealth.com",
    "role": "BILLING_SPECIALIST"
  }'
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts server with `tsx watch` hot-reload |
| `npm run build` | Compiles TypeScript into `dist/` |
| `npm run start` | Runs compiled production server |
| `npm run type-check` | Type-checks codebase with `tsc --noEmit` |
| `npm run prisma:generate` | Generates TypeScript Prisma Client |
| `npm run prisma:push` | Synchronizes models and indexes to MongoDB Atlas |
| `npm run prisma:seed` | Seeds database with reference data and admin account |
| `npm run prisma:studio` | Opens Prisma Studio visual database browser |

---

## 🗺️ Roadmap

- [x] Phase 1: Foundation setup, MongoDB Atlas integration, strict error handling, and security middlewares.
- [x] Phase 2: Complete 19-model database schema, 25 indexes, and seed datasets.
- [x] Phase 3: Auth, Multi-Tenant onboarding, and RBAC User Management.
- [ ] Phase 4: Patient Records (MRN, Demographics, Insurance Policies) and Providers (NPI).
- [ ] Phase 5: Clinical Appointments, Encounters, and Visit Notes.
- [ ] Phase 6: Claims Generation, Modifier Line-Items, Payment Allocations, and Denial Management.
- [ ] Phase 7: Analytics, Financial Reports, and EDI 837/835 Claims Integration.

---

## 📄 License
This project is licensed under the ISC License.

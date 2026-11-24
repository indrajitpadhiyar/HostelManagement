# HostelEase Enterprise Backend System

Engineered with modern Node.js, Express (ES Modules), MongoDB Atlas (Mongoose), and JWT Role-Based Access Control (RBAC).

---

## 🏗️ Architecture & Features

- **Runtime & Modules**: Node.js 20+ with native ES Modules (`"type": "module"`).
- **Database**: MongoDB Atlas with resilient connection failover, pooling, and health status tracking.
- **Authentication**: JWT (JSON Web Tokens) with 7-day expiration, bcrypt password hashing (salt factor: 10), and pre-save hooks.
- **Authorization (RBAC)**: Granular permission gates across 4 roles: `student`, `parent`, `warden`, `guard`.
- **API Standards**: JSend envelope format (`success`, `statusCode`, `message`, `data`, `timestamp`).
- **Security**:
  - `helmet`: Security HTTP headers (XSS, HSTS, Sniff protection).
  - `cors`: Cross-Origin Resource Sharing configured for mobile clients.
  - `express-rate-limit`: Tiered rate limiting (300 req/15 min general, 30 req/15 min auth).
  - Sanitized responses: Sensitive fields (like `password`) are automatically stripped from JSON outputs.
- **Error Handling**: Operational `ApiError` class, `asyncHandler` higher-order wrapper, and global error middleware handling Mongoose validation, CastErrors, duplicate keys (E11000), and JWT expiration errors.

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── app.js                          # Express application configuration & middlewares
│   ├── config/
│   │   ├── constants.js                # System roles, leave statuses, notification types
│   │   └── db.js                       # MongoDB Atlas resilient connection manager
│   ├── controllers/
│   │   ├── auth.controller.js          # Login, profile, demo role switching, logout
│   │   ├── student.controller.js       # Student queries, allocation, profile management
│   │   ├── leave.controller.js         # Multi-tier leave state machine (apply, approve, extend)
│   │   ├── guard.controller.js         # QR/Pass verification, checkout, checkin
│   │   ├── warden.controller.js        # Analytics KPI metrics, reports, activity feed, guards
│   │   ├── room.controller.js          # Room inventory, capacity and occupancy management
│   │   └── notification.controller.js  # Role-targeted push notifications & read markers
│   ├── middlewares/
│   │   ├── auth.middleware.js          # JWT verification & RBAC authorization
│   │   ├── error.middleware.js         # Centralized error handler
│   │   └── rateLimiter.middleware.js   # Express rate limiters
│   ├── models/
│   │   ├── User.js                     # Base auth user model with bcrypt
│   │   ├── Student.js                  # Student profile schema
│   │   ├── Room.js                     # Room capacity & occupancy schema
│   │   ├── LeaveRequest.js             # Leave pass life-cycle schema
│   │   ├── Activity.js                 # Movement & audit log schema
│   │   ├── Notification.js             # Notification schema
│   │   └── Guard.js                    # Security guard roster schema
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── student.routes.js
│   │   ├── leave.routes.js
│   │   ├── guard.routes.js
│   │   ├── warden.routes.js
│   │   ├── room.routes.js
│   │   ├── notification.routes.js
│   │   └── index.js                    # Aggregated /api/v1 router
│   ├── seed/
│   │   └── seedData.js                 # Complete deterministic seeder
│   └── utils/
│       ├── apiError.js
│       ├── apiResponse.js
│       ├── asyncHandler.js
│       └── token.utils.js
├── .env                                # Environment configurations
├── server.js                           # HTTP server bootstrap & graceful shutdown
└── package.json
```

---

## ⚡ Quick Start

### 1. MongoDB Atlas Network Access (Important)

In your MongoDB Atlas dashboard:
1. Log in to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Go to **Security > Network Access**
3. Click **Add IP Address**
4. Select **Allow Access From Anywhere** (`0.0.0.0/0`) or add your current public IP:
   `106.202.121.121`
5. Click **Confirm** and wait ~1 minute for Atlas to apply rules.

### 2. Seed Initial Demo Data

```bash
cd backend
npm run seed
```

This will populate:
- 4 Demo Users (`student@hosteleasy.demo`, `parent@hosteleasy.demo`, `warden@hosteleasy.demo`, `guard@hosteleasy.demo`) with password `Password@123`
- Hostel Blocks & Rooms with calculated capacities
- Student profiles with parent linkages
- Sample Leave Requests in various states (Pending Parent, Parent Approved, Warden Approved, Checked Out, Checked In)
- Movement activities and system notifications

### 3. Run Development Server

```bash
npm run dev
# Or for standard execution:
npm start
```

- Server: `http://localhost:5000`
- Health check: `http://localhost:5000/health`
- Base API: `http://localhost:5000/api/v1`

---

## 🔑 Demo Login Accounts

| Role | Email | Mobile | Password |
|---|---|---|---|
| **Student** | `student@hosteleasy.demo` | `9876543210` | `Password@123` |
| **Parent** | `parent@hosteleasy.demo` | `9876543211` | `Password@123` |
| **Warden** | `warden@hosteleasy.demo` | `9876543212` | `Password@123` |
| **Security Guard** | `guard@hosteleasy.demo` | `9876543213` | `Password@123` |

---

## 📡 Key API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /login`: Authenticate with email/mobile and password. Returns JWT token.
- `GET /me`: Returns profile of authenticated user.
- `POST /switch-demo`: Quick-switch between roles for demo testing.
- `POST /logout`: Invalidate session.

### Leave Management (`/api/v1/leaves`)
- `GET /`: Get role-scoped leave list with status and search filters.
- `GET /:id`: Full leave pass details with timeline and approval signatures.
- `POST /`: Student submits new leave pass.
- `PATCH /:id/parent-decision`: Parent approves or rejects leave pass.
- `PATCH /:id/warden-decision`: Warden grants final approval (enforces parent approval prerequisite).
- `POST /:id/extend`: Student requests leave extension.

### Security Guard Gate Clearances (`/api/v1/guard`)
- `GET /dashboard`: Daily gate exit/return statistics and active outside students.
- `POST /scan-verify`: Scans QR code or Pass ID, validates leave status and validity.
- `POST /record-exit`: Logs physical departure and marks student as `OUTSIDE_HOSTEL`.
- `POST /record-return`: Logs physical arrival and marks student as `PRESENT_IN_HOSTEL`.
- `GET /gate-history`: Real-time chronological audit trail of all gate movements.

### Warden Operations & Analytics (`/api/v1/warden`)
- `GET /dashboard`: Real-time KPI cards (in hostel, outside, pending approvals, overdue count, guards on duty).
- `GET /reports`: Aggregated analytical reports (status distribution, reason breakdown, department stats, overdue alerts).
- `GET /activities`: Paginated chronological audit feed.
- `GET /guards`: Security personnel roster.
- `PATCH /guards/:id/toggle-duty`: Toggle guard on/off duty status.

### Room Allocation (`/api/v1/rooms`)
- `GET /`: List all rooms with current occupants and capacity metrics.
- `POST /`: Create new room.
- `POST /:roomNo/allocate`: Assign student to room with automatic vacancy calculation.

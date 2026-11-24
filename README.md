# 🏢 HostelEase – Smart Hostel Management & Digital Leave Approval System

[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_52-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-Mongoose-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/NativeWind-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind_css&logoColor=white)](https://www.nativewind.dev/)

HostelEase is an enterprise-grade, full-stack Smart Hostel Management & Student Leave Clearance mobile application. Built with modern React Native (Expo) and a robust Node.js/Express ES Module REST API.

---

## ✨ System Architecture

```
HostelManagement/
├── frontend/             # React Native (Expo Router) Mobile Client
│   ├── app/              # File-based routes for Student, Parent, Warden, Guard
│   ├── components/       # Liquid Glass reusable design system cards & navigation
│   ├── constants/        # Theme tokens, colors, gradients, status config
│   ├── context/          # Reactive AppContext state management
│   ├── data/             # Initial realistic demo datasets
│   └── services/         # API Client & AsyncStorage persistence service
└── backend/              # Node.js + Express (ES Modules) Enterprise REST API
    ├── server.js         # HTTP server entry point with graceful shutdown
    └── src/
        ├── app.js        # Helmet, CORS, Rate Limiters, Morgan, Router
        ├── config/       # MongoDB connection & system constants
        ├── controllers/  # Auth, Student, Leave, Attendance, Guard, Warden, Room
        ├── middlewares/  # JWT protect & role-based authorize (RBAC), Error handler
        ├── models/       # Mongoose schemas (User, Student, Leave, Room, Attendance, Guard)
        ├── routes/       # Versioned API routes (/api/v1)
        └── seed/         # Deterministic MongoDB Atlas seeder
```

---

## 👥 4 User Roles in 1 Unified Mobile App

| Role | Core Capabilities |
|---|---|
| **👨‍🎓 Student** | Apply for leave passes, real-time status tracker, digital QR pass, extension requests, monthly roll-call compliance & attendance streaks. |
| **👨‍👦 Parent** | Instant leave review, approval / rejection with remarks, digital consent audit trail, student profile & history. |
| **👨‍💼 Warden** | Multi-tier approval clearance, student records, room allocation, occupancy metrics, daily attendance roll-call, guard shifts, compliance reports. |
| **🛡️ Security Guard** | QR code / Pass ID scanner verification, gate exit clearance (checks student OUT), gate return logging (checks student IN), live gate movement feed. |

---

## 🎨 Liquid Glass UI/UX Design System

- **Glassmorphism Aesthetic**: Translucent frosted glass containers, dynamic specular top gloss highlights, subtle drop shadows, and soft ambient gradient glows.
- **Micro-Interactions**: Smooth animated tab indicators, streak counter indicators (`🔥`), and live roll-call status verification tags.
- **Dark/Light Harmony**: Optimized palette (`#2563EB` Royal Blue, `#06B6D4` Cyan, `#10B981` Emerald, `#F8FAFC` Slate).

---

## 🚀 Quick Setup & Installation

### 1. Clone Repository
```bash
git clone https://github.com/indrajitpadhiyar/HostelManagement.git
cd HostelManagement
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your MongoDB Atlas URI & JWT Secret in .env
npm run seed     # Populate demo accounts, rooms, leaves, attendance
npm run dev      # Start server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npx expo start -c
```

---

## 🔑 Pre-Configured Demo Credentials

All seeded accounts use password: `Password@123`

| Role | Email | Mobile |
|---|---|---|
| **Student** | `student@hosteleasy.demo` | `9876543210` |
| **Parent** | `parent@hosteleasy.demo` | `9876543211` |
| **Warden** | `warden@hosteleasy.demo` | `9876543212` |
| **Security Guard** | `guard@hosteleasy.demo` | `9876543213` |

---

## 📄 License
This project is licensed under the MIT License.

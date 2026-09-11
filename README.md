# 🌾 KrishiDirect — Sustainable Direct Farmer-to-Consumer Agri-Tech Marketplace

[![GitHub Repository](https://img.shields.io/badge/GitHub-rakeshk--8685%2Fkrishidirect--agri--marketplace-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rakeshk-8685/krishidirect-agri-marketplace)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Local%20%2F%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT-Secure%20Auth-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Render](https://img.shields.io/badge/Render-Deploy_Ready-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

**KrishiDirect** is a modern, production-grade full-stack agricultural marketplace platform built to dismantle exploitative middleman chains by directly connecting verified regional farmers with urban consumers. It delivers farm-gate price realization for rural growers, authentic pesticide-free produce traceability for households, and an end-to-end digital farm trading ecosystem.

---

## ✨ Features

- 🚜 **Direct Farm-Gate Marketplace**: Consumers discover regional produce directly listed by farmers, bypassing 6–8 intermediary tiers to ensure 40–60% higher realization for farmers and lower costs for buyers.
- 🔍 **Faceted Produce Discovery**: Real-time category filtering (Organic Vegetables, Heirloom Grains, Orchard Fruits, Dairy, Spices), instant search, price sorting, and direct farm provenance badges.
- 🛡️ **Verified Farm Certification**: Comprehensive verification system auditing land documents, organic farming certifications, soil test reports, and farmer identities.
- 📊 **APMC Mandi Rates Ticker**: Live mandi market rate aggregation across regional APMCs (Azadpur, Lasalgaon, Agra, Khanna, etc.) giving farmers and consumers transparent price parity.
- 📦 **Atomic Inventory & Order State Machine**: Concurrency-safe order lifecycle (Placed → Confirmed → Picked Up → In Transit → Delivered) with strict stock decrement rollback protection.
- 📍 **Interactive Visual Order Tracking**: Live delivery step indicators, GPS route coordinates, cold-chain temperature telemetry, and direct courier dispatch status.
- 💎 **Modern Glassmorphism UI**: Ergonomically crafted with Tailwind CSS, custom glassmorphism depth, frosted card surfaces, pill-shaped tactile CTAs, responsive mobile navigations, and zero-layout-shift micro-interactions.
- 🔒 **Enterprise Authentication & Security**: JWT bearer authentication, role-based access control (RBAC), bcrypt password encryption, MongoDB injection sanitization, Helmet HTTP security headers, and rate limiting.
- 👨‍🌾 **Dedicated Multi-Role Portals**:
  - **Consumer Portal**: Product discovery, shopping bag, multi-item checkout, address book, past orders, and verified reviews.
  - **Farmer Dashboard**: Harvest lot publishing, inventory management, fulfillment status updater, earnings analytics, and farm profile customization.
  - **Admin Governance Hub**: Soil test / identity document verification, catalog moderation, platform user management, and order auditing.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: React 18.2 (Functional components & hooks architecture)
- **Build Pipeline**: Vite 5.2 (lightning-fast HMR and optimized chunk bundling)
- **Routing**: React Router DOM 6.23
- **Styling**: Tailwind CSS 3.4 & Vanilla CSS Design System with glassmorphism effects
- **State Management**: Context API (`AuthContext`, `CartContext`, `NotificationContext`)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js v18+ / v20+
- **Framework**: Express.js 4.19
- **Database**: MongoDB with Mongoose 8.3 ODM *(includes auto-resilient fallback data service)*
- **Security & Headers**: Helmet, CORS origin whitelisting, Express Rate Limit, Express Mongo Sanitize
- **Authentication**: JSON Web Tokens (JWT) + BcryptJS

---

## 📁 Repository Structure

```text
krishidirect-agri-marketplace/
├── backend/
│   ├── src/
│   │   ├── config/           # Database connections & environment secret loaders
│   │   ├── controllers/      # Business logic (Auth, Products, Orders, Farmer, Admin, Reviews)
│   │   ├── middleware/       # JWT verification, RBAC guard, Rate limiter, Error handler
│   │   ├── models/           # Mongoose schemas (User, Product, Order, Review)
│   │   ├── routes/           # Express REST endpoints
│   │   ├── scripts/          # Security audits, concurrency tests & admin verification suites
│   │   ├── seeders/          # Database seeding scripts with realistic Indian farm data
│   │   ├── services/         # Data persistence & resilient fallback storage engine
│   │   ├── utils/            # Order state machine validation & transitions
│   │   └── server.js         # API gateway entry point
│   ├── .env.example          # Sample environment configurations
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg       # Brand vector SVG favicon
│   │   └── images/           # High-definition visual assets
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, Footer, ProductCard, Modals, Badges)
│   │   ├── context/          # Global application contexts (Auth, Cart, Notification)
│   │   ├── pages/            # View pages (Home, Marketplace, Login, Orders, Tracking, Details)
│   │   │   ├── admin/        # Admin governance & verification dashboard
│   │   │   └── farmer/       # Farmer operations (Dashboard, Products, Sales, Orders, Profile)
│   │   ├── services/         # Axios/Fetch API client wrapper
│   │   ├── App.jsx           # Root route configuration & role guards
│   │   ├── index.css         # Global design tokens, scrollbars & glassmorphism utilities
│   │   └── main.jsx          # React DOM mounting
│   ├── index.html            # HTML5 shell with semantic meta headers
│   ├── tailwind.config.js    # Design system palette & extended tokens
│   ├── vite.config.js        # Production rollup chunking & dev proxy
│   └── package.json
│
├── .gitignore                # Production ignore definitions
├── LICENSE                   # MIT Open Source License
├── package.json              # Monorepo root workspace scripts
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (`v18.0.0` or higher)
- [npm](https://www.npmjs.com/) (`v9.0.0` or higher)
- [MongoDB](https://www.mongodb.com/) (Optional: running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/rakeshk-8685/krishidirect-agri-marketplace.git
cd krishidirect-agri-marketplace
```

---

### 2️⃣ Install Dependencies
Install all root, backend, and frontend packages with a single command from the project root:
```bash
npm run setup
```

---

### 3️⃣ Configure Environment
Create a `.env` file in the `backend/` directory (or duplicate `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173,http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/agri_marketplace
JWT_SECRET=krishidirect_super_secret_jwt_key_2026_production
JWT_EXPIRES_IN=7d
```

---

### 4️⃣ Seed Initial Data (Recommended)
Populate realistic verified Indian farms, organic produce catalogs, active orders, and demo accounts:
```bash
npm run seed
```

---

### 5️⃣ Launch Development Servers

**Option A: Separate Terminal Windows**

Terminal 1 (Backend API on `http://localhost:5000`):
```bash
npm run start:backend
```

Terminal 2 (Frontend Client on `http://localhost:3000`):
```bash
npm run start:frontend
```

**Option B: Independent Directory Execution**
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

---

### 6️⃣ Open the Application
Navigate your browser to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Demo & Test Credentials

The login screen includes instant 1-Click demo fill buttons for quick evaluation:

| Role | Email | Password | Permissions / Capabilities |
| :--- | :--- | :--- | :--- |
| **Consumer** | `consumer@gmail.com` | `Password@123` | Browse catalog, add to cart, checkout, view live order tracking |
| **Verified Farmer** | `farmer.ramesh@agridirect.in` | `Password@123` | Manage produce lots, update order statuses, view sales earnings |
| **Pending Farmer** | `farmer.lakshmi@agridirect.in` | `Password@123` | New farmer profile awaiting admin verification notice |
| **Super Admin** | `admin@agridirect.in` | `Password@123` | Approve/reject farms, review soil tests, moderate products |

---

## 🧪 Testing & Verification

Run the automated backend test suites:
```bash
# Concurrency & stock race-condition test
node backend/src/scripts/test_inventory_concurrency.js

# Security, auth, and RBAC vulnerability test suite
node backend/src/scripts/test_security_audit.js

# Admin moderation & document verification tests
node backend/src/scripts/test_admin_system.js
```

Verify frontend production bundle compilation:
```bash
npm run build
```

---

## 🌐 Live Deployment on Render (Blueprint)

This repository includes a native [`render.yaml`](file:///d:/Agri%20Marketplace/render.yaml) Blueprint that automatically provisions:
1. **Backend Web Service (`krishidirect-api`)**: Node.js Express server connected to MongoDB Atlas with auto-generated JWT secrets and health monitoring.
2. **Frontend Static Site (`krishidirect-web`)**: React + Vite SPA with URL rewrites (`/* -> /index.html`) and automatic environment binding to the backend API service.

### Deploy Steps:
1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository: `rakeshk-8685/krishidirect-agri-marketplace`.
4. Render will detect [`render.yaml`](file:///d:/Agri%20Marketplace/render.yaml) and automatically configure both services.
5. Click **Apply** to launch both your frontend and backend live!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [Issues](https://github.com/rakeshk-8685/krishidirect-agri-marketplace/issues) page.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See [LICENSE](file:///d:/Agri%20Marketplace/LICENSE) for more information.

---

<p align="center">
  Built with 💚 for Indian Farmers & Conscious Consumers.
</p>

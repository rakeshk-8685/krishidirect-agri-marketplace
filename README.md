# KrishiDirect (कृषि Direct)
> A Direct Farmer-to-Consumer Agri-Tech Marketplace Platform.

---

## 🎯 Purpose of the Project

**KrishiDirect** is an agricultural marketplace platform built to bridge the gap between local farmers and urban consumers by removing predatory middlemen from the food supply chain.

### The Problem
Traditional agricultural supply chains in India force produce through 6 to 8 intermediary tiers (brokers, aggregators, APMC mandis, commission agents, and retail chains). This causes:
- **40–60% farm-gate price erosion** suffered by farmers.
- **10+ days of cold storage transit**, heavy chemical/gas ripening, and produce nutrient loss.
- **Zero traceability** for consumers seeking pesticide-free, authentic farm-fresh food.

### The Solution
KrishiDirect re-engineers this pipeline by enabling:
- **Direct Farmer-to-Consumer Sales:** Direct transactions connecting verified regional growers with urban households.
- **Fair Farm-Gate Realization:** Ensures the vast majority of consumer spending flows directly to the farmers.
- **Radical Produce Traceability:** Complete transparency on harvest dates, origin farms, and verified organic/natural farming methods.
- **Dedicated Portals by Role:**
  - **Consumers:** Discover produce, faceted search, transparent pricing, cart, checkout, and live order tracking.
  - **Farmers:** Add harvest batches, manage stock, and track order fulfillment via a visual workflow.
  - **Administrators:** Farm soil/document verification, catalog moderation, commission engine, and platform analytics.

---

## 🛠️ Technology Stack

### Frontend
- **Core Library:** React 18.2 (Functional Components & Custom Hooks)
- **Build Tool:** Vite 5.2 (Fast ESM build pipeline)
- **Routing:** React Router DOM 6.23
- **Styling:** Tailwind CSS 3.4
- **Iconography:** Lucide React
- **Micro-Animations:** Framer Motion 11

### Backend
- **Runtime:** Node.js (v18+)
- **Web Framework:** Express.js 4.19
- **Authentication & Security:** JSON Web Tokens (JWT), BcryptJS password hashing, Helmet security headers, CORS origin protection, Rate Limiting
- **Logging & Config:** Morgan HTTP logger, Dotenv

### Database
- **Database:** MongoDB 7.0+
- **Object Data Modeling (ODM):** Mongoose 8.3
- *Note: Includes fallback hybrid storage simulation mode if a local MongoDB instance is not connected.*

---

## 🚀 How to Run the Project

### Prerequisites
- [Node.js](https://nodejs.org/) (`v18.0.0` or higher)
- [npm](https://www.npmjs.com/) (`v9.0.0` or higher)
- [MongoDB](https://www.mongodb.com/) (Optional: running locally on `mongodb://127.0.0.1:27017` or configured via `backend/.env`)

---

### Step 1: Install Dependencies
Install all workspace packages (root, backend, and frontend) with one command from the project root:
```bash
npm run setup
```

---

### Step 2: Seed Initial Data (Recommended)
Initialize users, organic farms, verified produce catalogs, and sample orders:
```bash
npm run seed
```

---

### Step 3: Start the Servers
Open two terminal windows in the project root:

**Terminal 1 — Start Backend Server (Port 5000):**
```bash
npm run start:backend
```

**Terminal 2 — Start Frontend Server (Port 3000):**
```bash
npm run start:frontend
```

---

### Step 4: Open the Web Application
Open your browser and visit:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Demo & Test Credentials

The login screen features 1-Click fast autofill buttons, or you can log in manually:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Consumer** | `consumer@gmail.com` | `Password@123` | Active buyer account with past orders |
| **Farmer (Verified)** | `farmer.ramesh@agridirect.in` | `Password@123` | Verified grower with active produce listings |
| **Farmer (Pending)** | `farmer.lakshmi@agridirect.in` | `Password@123` | Farmer profile awaiting admin verification |
| **Super Admin** | `admin@agridirect.in` | `Password@123` | Full governance & verification controls |

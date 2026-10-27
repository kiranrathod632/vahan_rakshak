# 🛡️ GadiRaksha (गाडीरक्षा) - Smart Vehicle QR Safety & Alert System

A production-grade, monorepo full-stack platform built with **Node.js, Express, MongoDB Atlas, Socket.io, and Vite React + Tailwind CSS** for vehicle safety QR stickers.

---

## 📂 Project Structure

```
GadiRaksha/
├── .vercel/                 # Vercel project deployment configuration
├── backend/                 # Node.js Express API & Real-time WebSockets
│   ├── public/              # Static client build fallback
│   ├── scripts/             # MongoDB Atlas seed and utility scripts
│   ├── src/                 # Controllers, Routes, Models, Services, Middlewares
│   ├── .env                 # Backend environment variables
│   ├── .env.example         # Template environment variables
│   └── package.json         # Backend dependencies & scripts
├── docs/                    # Architectural & API specifications
│   ├── API_DOCUMENTATION.md # Complete REST API reference
│   ├── ARCHITECTURE.md      # System architecture & deployment
│   └── WORKFLOWS.md         # Detailed sequence workflows
├── frontend/                # Vite React Single Page Application
│   ├── src/                 # Components, Contexts, Pages, Router
│   ├── index.html           # HTML5 entrypoint
│   ├── package.json         # Frontend dependencies & scripts
│   ├── vite.config.js       # Vite configuration with API proxy
│   ├── tailwind.config.js   # Tailwind theme & dark mode configuration
│   └── postcss.config.js    # PostCSS pipeline
├── node_modules/            # Root dependencies
├── postman/                 # Ready-to-import Postman collections
│   ├── GadiRaksha_API_Collection.json
│   └── GadiRaksha_Environment.json
├── .env.local               # Local development environment configuration
├── .gitignore               # Git ignore configuration
├── package.json             # Root monorepo scripts & dependencies
├── package-lock.json        # Unified lockfile
├── README.md                # Project documentation
└── vercel.json              # Vercel serverless deployment routing
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js >= 18
- MongoDB Atlas or local MongoDB instance

### 2. Environment Configuration
The project includes pre-configured environment files:
- `.env.local` (at root)
- `backend/.env` (inside backend directory)

### 3. Running Development Servers
From the project root:

```bash
# Start backend server (Port 5000)
npm run backend:dev

# Start frontend Vite dev server (Port 3000)
npm run frontend:dev

# Or run both concurrently
npm run dev
```

### 4. Build Frontend for Production
```bash
npm run build
```

---

## 🔑 Demo & Test Credentials

| Role | Mobile Number | Password | Notes |
|---|---|---|---|
| **Super Admin** | `9823000000` | `password123` | Complete system access & staff payroll |
| **Sales Agent** | `9821889900` | `password123` | Salesman dashboard, attendance & sales stats |
| **Vehicle Owner** | `9822100001` | `password123` | Vehicle owner dashboard & alerts history |

### Sample Physical QR Sticker Codes
- `MH-1001` to `MH-1015` (Assigned to registered vehicles)
- `MH-1016` to `MH-1030` (Unassigned / Available for new customer onboarding)

---

## 🚨 Emergency & Bystander QR Scan Flow
1. Open camera or browser to: `http://localhost:3000/scan/MH-1001`
2. Bystander is presented with 4 instant action alert choices:
   - 🚫 **Wrong / No-Parking Alert**
   - 🆘 **Accident SOS / Emergency Assistance**
   - ⚠️ **Towing Warning**
   - 💡 **Lights ON / Flat Tyre**
3. Direct **One-Tap Call** (`tel:+91...`) and **WhatsApp** buttons.
4. Triggers instant Socket.io popups, voice calls, and SMS to the vehicle owner.

---

## 📄 Documentation Links
- Detailed API Reference: [docs/API_DOCUMENTATION.md](file:///c:/Users/User/Desktop/GadiRaksha/docs/API_DOCUMENTATION.md)
- System Architecture: [docs/ARCHITECTURE.md](file:///c:/Users/User/Desktop/GadiRaksha/docs/ARCHITECTURE.md)
- Workflow Blueprints: [docs/WORKFLOWS.md](file:///c:/Users/User/Desktop/GadiRaksha/docs/WORKFLOWS.md)
- Postman Collection: [postman/GadiRaksha_API_Collection.json](file:///c:/Users/User/Desktop/GadiRaksha/postman/GadiRaksha_API_Collection.json)

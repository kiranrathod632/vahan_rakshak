# GadiRaksha System Architecture

## Architecture Overview

GadiRaksha is organized as a unified monorepo containing a full-stack smart vehicle emergency and safety alert platform.

```
                    ┌───────────────────────────┐
                    │    Bystander Smartphone   │
                    │   (Mobile Camera / PWA)   │
                    └─────────────┬─────────────┘
                                  │ Scans Vehicle QR
                                  ▼
                    ┌───────────────────────────┐
                    │   Frontend (React SPA)    │
                    │   - PublicScan.jsx        │
                    │   - SalesDashboard.jsx    │
                    │   - AdminDashboard.jsx    │
                    │   - EmergencyAlertModal   │
                    └─────────────┬─────────────┘
                                  │ REST / WebSockets
                                  ▼
                    ┌───────────────────────────┐
                    │  Backend (Express & Node) │
                    │   - scanController.js     │
                    │   - alertController.js    │
                    │   - authController.js     │
                    │   - salesController.js    │
                    │   - Socket.io Server      │
                    └─────────────┬─────────────┘
                                  │
                   ┌──────────────┴──────────────┐
                   ▼                             ▼
        ┌───────────────────────┐   ┌────────────────────────┐
        │  MongoDB Atlas Cluster│   │ Notification Dispatcher│
        │   (Users, Tags,       │   │  - Socket.io Broadcast │
        │    Vehicles, Alerts)  │   │  - Auto Voice Calls    │
        │                       │   │  - SMS / WhatsApp      │
        └───────────────────────┘   └────────────────────────┘
```

## Directory Structure Specification

```
GadiRaksha/
├── .vercel/                 # Vercel deployment project configuration
├── backend/                 # Node.js Express API & Real-time Server
│   ├── public/              # Static frontend assets fallback
│   ├── scripts/             # Atlas seed scripts & DB utilities
│   ├── src/                 # Controllers, Models, Routes, Middlewares
│   ├── .env                 # Backend environment variables
│   ├── .env.example         # Template environment variables
│   └── package.json         # Backend dependencies & scripts
├── docs/                    # Architecture, API & Workflow specifications
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   └── WORKFLOWS.md
├── frontend/                # Vite React Tailwind Single Page App
│   ├── src/                 # Components, Contexts, Pages, Router
│   ├── index.html           # HTML5 entrypoint
│   ├── package.json         # Frontend dependencies & scripts
│   ├── vite.config.js       # Vite build & dev-server proxy
│   ├── tailwind.config.js   # Tailwind styling theme & dark mode
│   └── postcss.config.js    # PostCSS pipeline
├── node_modules/            # Root dependencies
├── postman/                 # Postman collections & environments
│   ├── GadiRaksha_API_Collection.json
│   └── GadiRaksha_Environment.json
├── .env.local               # Root environment configuration
├── .gitignore               # Monorepo git ignore rules
├── package.json             # Root monorepo scripts & orchestrator
├── package-lock.json        # Unified lockfile
├── README.md                # Project README & quickstart
└── vercel.json              # Vercel deployment routing
```

## Database Connection Resilience
The backend integrates custom DNS resolvers `dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])` prior to initiating SRV lookup for `mongodb+srv://...` clusters on Windows environments, eliminating `querySrv ECONNREFUSED` interruptions.

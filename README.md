# 👥 Team Availability Tracker &bull; Real-Time Sync Dashboard

> A production-grade, full-stack real-time availability dashboard where team status toggles are synchronized live between an Express backend with Server-Sent Events (SSE) and an interactive responsive UI.

Built for the **Workora Full-Stack Development Milestone**.

[![Tests](https://img.shields.io/badge/tests-16%20passed-success?style=flat-square)](backend/tests/availability.test.js)
[![Node.js](https://img.shields.io/badge/node.js-v20%2B-blue?style=flat-square)](https://nodejs.org)
[![Express](https://img.shields.io/badge/express-v4.19-lightgrey?style=flat-square)](https://expressjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 🌟 Key Features

- 🟢 **Live Status Toggling**: Instant toggling between **Available**, **Busy**, **Away**, and **Offline** with custom status notes.
- 📡 **Real-Time Live Synchronization**: Server-Sent Events (SSE) stream (`GET /api/stream`) broadcasts status transitions instantly across all open browser tabs without manual page reloads.
- 📊 **Real-Time Analytics & Stats**: Dynamic metrics for availability rate (%), active status counts, and department distributions.
- 🗄️ **Persistent Atomic Database**: Pre-seeded with 21 realistic team members across 6 departments (Engineering, Design, Product, Marketing, Operations, Data & AI). Fully compatible with Vercel serverless `/tmp` storage.
- 🔍 **Filtering & Live Search**: Instant filtering by department pills, status tabs, or text search across names, roles, and notes.
- 📜 **Audit Trail & Activity Log**: Full chronological history of all team availability transitions.
- 🧪 **Automated Testing Suite**: 16 native test cases passing with 100% pass rate.

---

## 📁 Project Architecture

```
team-availability-tracker/
├── api/
│   └── index.js                      # Vercel serverless entrypoint
├── backend/
│   ├── data/
│   │   └── team.json                 # Persistent atomic JSON storage
│   ├── src/
│   │   ├── controllers/
│   │   │   └── memberController.js   # CRUD & status toggle handlers
│   │   ├── routes/
│   │   │   └── memberRoutes.js       # REST & SSE route definitions
│   │   ├── utils/
│   │   │   ├── broadcaster.js        # SSE real-time event broadcaster
│   │   │   └── storage.js            # Database read/write & seed loader
│   │   ├── app.js                    # Express app configuration
│   │   └── server.js                 # Server listener (Port 5001)
│   ├── tests/
│   │   └── availability.test.js      # 16 automated test cases
│   └── package.json
├── docs/
│   ├── API_DOCUMENTATION.md          # Complete REST API & SSE specification
│   └── WORKORA_SUBMISSION_GUIDE.md   # Workora milestone rubric & checklist
├── public/
│   ├── app.js                        # Client SSE listener & DOM manager
│   ├── index.html                    # Responsive dashboard with Tailwind CSS & Lucide icons
│   └── styles.css                    # Visual status glow badges & animations
├── package.json                      # Monorepo root package
├── vercel.json                       # Zero-config Vercel deployment
└── README.md
```

---

## 🚀 Quick Start (Local)

### 1. Install & Test
```bash
cd backend
npm test
```
*Result: 16 passed, 0 failed.*

### 2. Run the Application
```bash
npm start
```
Open **[http://localhost:5001](http://localhost:5001)** in your browser.

---

## 👨‍💻 Author

- GitHub: [@lavach02-arch](https://github.com/lavach02-arch)
- License: [MIT](LICENSE)

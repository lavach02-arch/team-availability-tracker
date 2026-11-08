# 👥 Team Availability Tracker &bull; Real-Time Dashboard

> A full-stack real-time availability dashboard where team member status toggles are synchronized live between a Flask-SocketIO backend and React 19 frontend.

Built for the **Workora Full-Stack Development Milestone**.

[![Tests](https://img.shields.io/badge/pytest-18%20passed-success?style=flat-square)](backend/tests)
[![Python](https://img.shields.io/badge/python-3.10%2B-blue?style=flat-square)](https://python.org)
[![Flask](https://img.shields.io/badge/flask-3.1-black?style=flat-square)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/react-19-cyan?style=flat-square)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 🌟 Features

- 🟢 **Live Status Toggling**: Instant toggling between **Available**, **Busy**, **Away**, and **Offline** with optional status notes.
- 📡 **Real-Time WebSocket Synchronization**: State changes are broadcast via Flask-SocketIO to all connected dashboards without page refreshes.
- 📊 **Live Analytics & Stats**: Real-time counters for team availability rate, department breakdowns, and status distribution.
- 🗄️ **Persistent SQLite Database**: SQLAlchemy ORM with auto-seeding of 21 team members across 6 departments.
- 🔍 **Filtering & Search**: Instant filter by department, status pill, or search by name.
- 📜 **Audit Log & History**: Full audit trail of all availability transitions and notes.
- 🧪 **Automated Tests**: 18 unit and integration tests passing with `pytest`.

---

## 📁 Architecture

```
team-availability-tracker/
├── api/
│   └── index.py                     # Vercel serverless entrypoint
├── backend/
│   ├── app/
│   │   ├── database.py              # SQLAlchemy initialization
│   │   ├── models.py                # TeamMember & StatusLog ORM models
│   │   ├── routes.py                # REST API endpoints
│   │   └── socket_events.py         # Socket.IO WebSocket handlers
│   ├── instance/
│   │   └── team_availability.db     # SQLite database
│   ├── tests/
│   │   └── test_api.py              # 18 pytest automated tests
│   ├── config.py
│   ├── requirements.txt
│   ├── run.py                       # Server runner (Port 5001)
│   └── seed.py                      # Realistic team members seeder
├── docs/
│   ├── API_DOCUMENTATION.md         # Full REST API & WebSocket specification
│   └── WORKORA_SUBMISSION_GUIDE.md  # Workora milestone rubric
├── frontend/
│   ├── src/
│   │   ├── components/              # MemberCard, StatusBadge, StatusToggle, Navbar
│   │   ├── pages/                   # Dashboard, Members, Activity
│   │   └── services/                # api.js & socket.js
│   └── package.json
├── vercel.json                      # Vercel deployment configuration
└── README.md
```

---

## 🚀 Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
python seed.py
python run.py
```
*Backend runs on `http://localhost:5001`*

### Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

### Run Tests
```bash
cd backend
pytest tests
```
*18 passed in 1.04s*

---

## 👨‍💻 Author

- GitHub: [@lavach02-arch](https://github.com/lavach02-arch)
- License: [MIT](LICENSE)

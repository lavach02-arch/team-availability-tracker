# Workora Milestone Submission Guide
## Project: Team Availability Tracker

---

### 📌 Milestone Objectives & Verification Matrix

| Requirement | Implementation Detail | Status |
| :--- | :--- | :---: |
| **1. Database Schema** | SQLite with SQLAlchemy models: `TeamMember` (id, name, role, department, email, avatar_color, status, note, last_seen, created_at) and `StatusLog` (id, member_id, old_status, new_status, note, changed_by, changed_at). | ✅ **Verified** |
| **2. REST Endpoints for Status Update** | `PUT /api/members/<id>/status` accepting `available`, `busy`, `away`, `offline` with custom note and database persistence. | ✅ **Verified** |
| **3. Responsive Dashboard with Visual Indicators** | Modern React 19 UI with glowing status badges (Green = Available, Red = Busy, Amber = Away, Gray = Offline), search, department filtering, and stats cards. | ✅ **Verified** |
| **4. Live WebSocket / Auto-Refresh** | Flask-SocketIO server with Socket.IO client broadcasting `status_update` events instantly to all connected dashboards without page reloads. | ✅ **Verified** |
| **5. Automated Testing Suite** | 18 automated pytest test cases passing in 1.04s. | ✅ **Verified (18/18 Pass)** |

---

### 🚀 Running the Project Locally

1. **Backend**:
   ```bash
   cd backend
   python run.py
   ```
   *Runs at `http://localhost:5001`*

2. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Runs at `http://localhost:5173`*

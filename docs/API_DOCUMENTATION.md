# Team Availability Tracker &bull; API & WebSocket Documentation

---

## 🎯 Architecture Overview

- **Backend**: Python 3.10+, Flask 3.1, Flask-SQLAlchemy, Flask-SocketIO (WebSocket).
- **Frontend**: React 19, Vite, React Router, Socket.IO Client.
- **Database**: SQLite (SQLAlchemy ORM) with automatic seeding of 21 team members across 6 departments.
- **Real-Time Communication**: WebSocket broadcasting on `status_update`, `member_created`, `member_deleted` with HTTP polling fallback.

---

## 🌐 REST Endpoints

### 1. Health & Statistics
- `GET /api/health`: Service & database connection status.
- `GET /api/stats`: Total members, counts for `available`, `busy`, `away`, `offline`, department distribution, and availability rate percentage.

### 2. Team Members CRUD
- `GET /api/members`: List all members with filtering by `?department=Engineering`, `?status=available`, or search `?search=sharma`.
- `POST /api/members`: Create a new member.
- `GET /api/members/<id>`: Retrieve single member details.
- `PUT /api/members/<id>`: Update member role, name, department, email.
- `DELETE /api/members/<id>`: Remove member and related logs.

### 3. Status Toggling (Core Requirement)
- `PUT /api/members/<id>/status`:
  - **Payload**:
    ```json
    {
      "status": "busy",
      "note": "In sprint planning meeting"
    }
    ```
  - **Valid Statuses**: `available`, `busy`, `away`, `offline`.
  - **Response `200 OK`**: Updated member object.
  - **WebSocket Broadcast**: Emits `status_update` event to all connected dashboard clients instantly!

### 4. Audit & Activity Logs
- `GET /api/activity?limit=30`: Chronological audit trail of all team availability toggles.
- `GET /api/members/<id>/history`: History logs for a specific team member.

---

## 📡 WebSocket Events

| Event | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `status_update` | Server &rarr; Client | `{ member_id, name, old_status, new_status, note, changed_at }` | Real-time status toggle broadcast |
| `member_created` | Server &rarr; Client | `{ id, name, role, department, status }` | New member added |
| `member_deleted` | Server &rarr; Client | `{ id }` | Member removed |

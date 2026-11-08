from flask import Blueprint, request, jsonify
from datetime import datetime
from .database import db
from .models import TeamMember, StatusLog, VALID_STATUSES, AVATAR_COLORS
import random

api = Blueprint('api', __name__)

# ── helpers ──────────────────────────────────────────────────────────────────
def err(msg, code=400):
    return jsonify({'error': msg}), code

def ok(data, code=200):
    return jsonify(data), code

# ── health ────────────────────────────────────────────────────────────────────
@api.get('/health')
def health():
    try:
        db.session.execute(db.text('SELECT 1'))
        db_status = 'connected'
    except Exception:
        db_status = 'error'
    return ok({'status': 'healthy', 'database': db_status,
               'timestamp': datetime.utcnow().isoformat()})

# ── statistics ────────────────────────────────────────────────────────────────
@api.get('/stats')
def stats():
    total      = TeamMember.query.count()
    available  = TeamMember.query.filter_by(status='available').count()
    busy       = TeamMember.query.filter_by(status='busy').count()
    away       = TeamMember.query.filter_by(status='away').count()
    offline    = TeamMember.query.filter_by(status='offline').count()
    total_logs = StatusLog.query.count()

    # departments breakdown
    rows = db.session.execute(
        db.text("SELECT department, COUNT(*) as cnt FROM team_members GROUP BY department ORDER BY cnt DESC")
    ).fetchall()
    departments = [{'name': r[0], 'count': r[1]} for r in rows]

    return ok({
        'total': total,
        'available': available,
        'busy': busy,
        'away': away,
        'offline': offline,
        'total_logs': total_logs,
        'departments': departments,
        'availability_rate': round((available / total * 100) if total else 0, 1),
    })

# ── members list / create ─────────────────────────────────────────────────────
@api.get('/members')
def list_members():
    dept   = request.args.get('department')
    status = request.args.get('status')
    search = request.args.get('search', '').strip()

    q = TeamMember.query
    if dept:
        q = q.filter_by(department=dept)
    if status and status in VALID_STATUSES:
        q = q.filter_by(status=status)
    if search:
        q = q.filter(TeamMember.name.ilike(f'%{search}%') |
                     TeamMember.role.ilike(f'%{search}%') |
                     TeamMember.email.ilike(f'%{search}%'))

    members = q.order_by(TeamMember.name).all()
    return ok({'members': [m.to_dict() for m in members], 'count': len(members)})


@api.post('/members')
def create_member():
    data = request.get_json(silent=True)
    if not data:
        return err('JSON body required')

    name  = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    role  = (data.get('role') or 'Team Member').strip()
    dept  = (data.get('department') or 'General').strip()

    if not name:  return err('name is required')
    if not email: return err('email is required')
    if '@' not in email: return err('valid email is required')

    if TeamMember.query.filter_by(email=email).first():
        return err('A member with this email already exists', 409)

    color = data.get('avatar_color') or random.choice(AVATAR_COLORS)
    member = TeamMember(
        name         = name,
        email        = email,
        role         = role,
        department   = dept,
        avatar_color = color,
        status       = 'offline',
    )
    db.session.add(member)
    db.session.commit()
    return ok({'message': 'Member created', 'member': member.to_dict()}, 201)

# ── single member ─────────────────────────────────────────────────────────────
@api.get('/members/<int:mid>')
def get_member(mid):
    m = TeamMember.query.get_or_404(mid, description='Member not found')
    return ok({'member': m.to_dict(include_logs=True)})


@api.put('/members/<int:mid>')
def update_member(mid):
    m    = TeamMember.query.get_or_404(mid, description='Member not found')
    data = request.get_json(silent=True) or {}

    if 'name'       in data: m.name       = data['name'].strip() or m.name
    if 'role'       in data: m.role       = data['role'].strip() or m.role
    if 'department' in data: m.department = data['department'].strip() or m.department
    if 'email'      in data:
        new_email = data['email'].strip().lower()
        if new_email != m.email:
            if TeamMember.query.filter_by(email=new_email).first():
                return err('Email already in use', 409)
            m.email = new_email
    if 'avatar_color' in data: m.avatar_color = data['avatar_color']

    db.session.commit()
    return ok({'message': 'Member updated', 'member': m.to_dict()})


@api.delete('/members/<int:mid>')
def delete_member(mid):
    m = TeamMember.query.get_or_404(mid, description='Member not found')
    name = m.name
    db.session.delete(m)
    db.session.commit()
    return ok({'message': f'{name} removed from team'})

# ── status update ─────────────────────────────────────────────────────────────
@api.put('/members/<int:mid>/status')
def update_status(mid):
    m    = TeamMember.query.get_or_404(mid, description='Member not found')
    data = request.get_json(silent=True) or {}

    new_status = (data.get('status') or '').strip().lower()
    note       = (data.get('note') or '').strip()
    changed_by = (data.get('changed_by') or 'user').strip()

    if not new_status:
        return err('status is required')
    if new_status not in VALID_STATUSES:
        return err(f'status must be one of: {", ".join(VALID_STATUSES)}')

    try:
        log = m.update_status(new_status, note=note, changed_by=changed_by)
        db.session.commit()
    except ValueError as e:
        return err(str(e))

    # emit via socketio — imported lazily to avoid circular import
    try:
        from . import socketio
        socketio.emit('status_update', {
            'member':    m.to_dict(),
            'log':       log.to_dict(),
            'timestamp': datetime.utcnow().isoformat(),
        }, broadcast=True)
    except Exception:
        pass

    return ok({'message': 'Status updated', 'member': m.to_dict(), 'log': log.to_dict()})

# ── status history ────────────────────────────────────────────────────────────
@api.get('/members/<int:mid>/history')
def status_history(mid):
    TeamMember.query.get_or_404(mid, description='Member not found')
    limit = min(int(request.args.get('limit', 20)), 100)
    logs  = StatusLog.query.filter_by(member_id=mid) \
                           .order_by(StatusLog.changed_at.desc()) \
                           .limit(limit).all()
    return ok({'history': [l.to_dict() for l in logs], 'count': len(logs)})

# ── departments list ──────────────────────────────────────────────────────────
@api.get('/departments')
def list_departments():
    rows  = db.session.execute(
        db.text("SELECT DISTINCT department FROM team_members ORDER BY department")
    ).fetchall()
    return ok({'departments': [r[0] for r in rows]})

# ── recent activity ───────────────────────────────────────────────────────────
@api.get('/activity')
def recent_activity():
    limit = min(int(request.args.get('limit', 30)), 100)
    logs  = (StatusLog.query
             .join(TeamMember, StatusLog.member_id == TeamMember.id)
             .order_by(StatusLog.changed_at.desc())
             .limit(limit).all())
    result = []
    for l in logs:
        d = l.to_dict()
        d['member_name']     = l.member.name
        d['member_initials'] = l.member._initials()
        d['avatar_color']    = l.member.avatar_color
        result.append(d)
    return ok({'activity': result, 'count': len(result)})

from datetime import datetime
from .database import db

VALID_STATUSES = ['available', 'busy', 'away', 'offline']

AVATAR_COLORS = [
    '#E53935', '#8E24AA', '#1E88E5', '#00897B',
    '#43A047', '#FB8C00', '#6D4C41', '#00ACC1',
    '#3949AB', '#D81B60', '#F4511E', '#039BE5',
]

class TeamMember(db.Model):
    __tablename__ = 'team_members'

    id           = db.Column(db.Integer,  primary_key=True, autoincrement=True)
    name         = db.Column(db.String(100), nullable=False)
    role         = db.Column(db.String(100), nullable=False, default='Team Member')
    department   = db.Column(db.String(100), nullable=False, default='General')
    email        = db.Column(db.String(150), unique=True, nullable=False)
    avatar_color = db.Column(db.String(10),  nullable=False, default='#6F4E37')
    status       = db.Column(db.String(20),  nullable=False, default='offline')
    note         = db.Column(db.String(255), nullable=True,  default='')
    last_seen    = db.Column(db.DateTime,    nullable=True)
    created_at   = db.Column(db.DateTime,    default=datetime.utcnow)

    logs = db.relationship('StatusLog', back_populates='member',
                           cascade='all, delete-orphan', lazy='dynamic',
                           order_by='StatusLog.changed_at.desc()')

    def to_dict(self, include_logs=False):
        d = {
            'id':           self.id,
            'name':         self.name,
            'role':         self.role,
            'department':   self.department,
            'email':        self.email,
            'avatar_color': self.avatar_color,
            'avatar_initials': self._initials(),
            'status':       self.status,
            'note':         self.note or '',
            'last_seen':    self.last_seen.isoformat() if self.last_seen else None,
            'created_at':   self.created_at.isoformat(),
        }
        if include_logs:
            d['recent_logs'] = [l.to_dict() for l in self.logs.limit(10)]
        return d

    def _initials(self):
        parts = self.name.strip().split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[-1][0]).upper()
        return self.name[:2].upper()

    def update_status(self, new_status, note='', changed_by='user'):
        if new_status not in VALID_STATUSES:
            raise ValueError(f'Invalid status: {new_status}')
        old_status   = self.status
        self.status  = new_status
        self.note    = note or ''
        self.last_seen = datetime.utcnow()

        log = StatusLog(
            member_id  = self.id,
            old_status = old_status,
            new_status = new_status,
            note       = note or '',
            changed_by = changed_by,
        )
        db.session.add(log)
        return log


class StatusLog(db.Model):
    __tablename__ = 'status_logs'

    id         = db.Column(db.Integer,  primary_key=True, autoincrement=True)
    member_id  = db.Column(db.Integer,  db.ForeignKey('team_members.id', ondelete='CASCADE'), nullable=False)
    old_status = db.Column(db.String(20), nullable=False, default='offline')
    new_status = db.Column(db.String(20), nullable=False)
    note       = db.Column(db.String(255), nullable=True, default='')
    changed_by = db.Column(db.String(100), nullable=False, default='user')
    changed_at = db.Column(db.DateTime, default=datetime.utcnow)

    member = db.relationship('TeamMember', back_populates='logs')

    def to_dict(self):
        return {
            'id':         self.id,
            'member_id':  self.member_id,
            'old_status': self.old_status,
            'new_status': self.new_status,
            'note':       self.note or '',
            'changed_by': self.changed_by,
            'changed_at': self.changed_at.isoformat(),
        }

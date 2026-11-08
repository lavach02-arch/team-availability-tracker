from flask_socketio import emit, join_room, leave_room
from . import socketio
from .database import db
from .models import TeamMember
from datetime import datetime

@socketio.on('connect')
def handle_connect():
    # Send current state to newly connected client
    members = TeamMember.query.order_by(TeamMember.name).all()
    emit('initial_state', {
        'members': [m.to_dict() for m in members],
        'timestamp': datetime.utcnow().isoformat(),
        'connected_at': datetime.utcnow().isoformat(),
    })

@socketio.on('disconnect')
def handle_disconnect():
    pass

@socketio.on('ping_server')
def handle_ping(data):
    emit('pong_server', {'timestamp': datetime.utcnow().isoformat()})

@socketio.on('request_refresh')
def handle_refresh():
    members = TeamMember.query.order_by(TeamMember.name).all()
    emit('initial_state', {
        'members': [m.to_dict() for m in members],
        'timestamp': datetime.utcnow().isoformat(),
    })

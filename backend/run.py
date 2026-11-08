from app import create_app, socketio

app = create_app()

if __name__ == '__main__':
    print('🚀  Team Availability Tracker — Backend')
    print('📡  WebSocket enabled (Flask-SocketIO + eventlet)')
    print('🌐  http://localhost:5001')
    socketio.run(app, host='0.0.0.0', port=5001, debug=True, use_reloader=True)

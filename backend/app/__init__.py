from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from .database import db, init_db
from .routes import api
from config import get_config

socketio = SocketIO(cors_allowed_origins='*', async_mode='eventlet',
                    logger=False, engineio_logger=False)

def create_app(config_class=None):
    app = Flask(__name__, instance_relative_config=True)

    cfg = config_class or get_config()
    app.config.from_object(cfg)

    # Extensions
    CORS(app, resources={r'/api/*': {'origins': '*'}})
    init_db(app)
    socketio.init_app(app)

    # Blueprints
    app.register_blueprint(api, url_prefix='/api')

    # Socket events
    from . import socket_events  # noqa: F401

    return app

import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-team-tracker-2024')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f"sqlite:///{os.path.join('/tmp', 'team_availability.db')}" if os.environ.get('VERCEL') else 'sqlite:///team_availability.db'
    )

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f"sqlite:///{os.path.join('/tmp', 'team_availability.db')}" if os.environ.get('VERCEL') else 'sqlite:///team_availability.db'
    )

config_map = {
    'development': DevelopmentConfig,
    'testing':     TestingConfig,
    'production':  ProductionConfig,
}

def get_config():
    env = os.environ.get('FLASK_ENV', 'development')
    return config_map.get(env, DevelopmentConfig)

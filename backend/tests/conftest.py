import pytest, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app
from app.database import db as _db
from config import TestingConfig

@pytest.fixture(scope='session')
def app():
    application = create_app(TestingConfig)
    with application.app_context():
        _db.create_all()
        yield application
        _db.drop_all()

@pytest.fixture(scope='session')
def client(app):
    return app.test_client()

@pytest.fixture
def seeded_client(client, app):
    with app.app_context():
        from app.models import TeamMember
        if TeamMember.query.count() == 0:
            m = TeamMember(name='Alice Test', role='Developer',
                           department='Engineering', email='alice@test.com',
                           avatar_color='#1E88E5', status='offline')
            _db.session.add(m)
            _db.session.commit()
    return client

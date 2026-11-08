"""
seed.py -- Populates the database with realistic team member data.
Run: python seed.py
"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from app.database import db
from app.models import TeamMember, StatusLog, AVATAR_COLORS
from datetime import datetime, timedelta
import random

MEMBERS = [
    # Engineering
    {'name':'Arjun Sharma',    'role':'Senior Backend Engineer',  'department':'Engineering', 'email':'arjun.sharma@team.dev',    'status':'available'},
    {'name':'Priya Nair',      'role':'Frontend Developer',       'department':'Engineering', 'email':'priya.nair@team.dev',      'status':'busy'},
    {'name':'Rohit Verma',     'role':'DevOps Engineer',          'department':'Engineering', 'email':'rohit.verma@team.dev',     'status':'away'},
    {'name':'Sneha Kapoor',    'role':'Full Stack Developer',     'department':'Engineering', 'email':'sneha.kapoor@team.dev',    'status':'available'},
    {'name':'Karan Mehta',     'role':'QA Engineer',              'department':'Engineering', 'email':'karan.mehta@team.dev',     'status':'offline'},
    {'name':'Aisha Khan',      'role':'Mobile Developer',         'department':'Engineering', 'email':'aisha.khan@team.dev',      'status':'available'},
    # Design
    {'name':'Ravi Patel',      'role':'UI/UX Designer',           'department':'Design',      'email':'ravi.patel@team.dev',      'status':'available'},
    {'name':'Meera Joshi',     'role':'Graphic Designer',         'department':'Design',      'email':'meera.joshi@team.dev',     'status':'busy'},
    {'name':'Dev Anand',       'role':'Product Designer',         'department':'Design',      'email':'dev.anand@team.dev',       'status':'offline'},
    # Product
    {'name':'Nisha Singh',     'role':'Product Manager',          'department':'Product',     'email':'nisha.singh@team.dev',     'status':'busy'},
    {'name':'Amit Gupta',      'role':'Business Analyst',         'department':'Product',     'email':'amit.gupta@team.dev',      'status':'available'},
    {'name':'Pooja Reddy',     'role':'Scrum Master',             'department':'Product',     'email':'pooja.reddy@team.dev',     'status':'away'},
    # Marketing
    {'name':'Suresh Kumar',    'role':'Marketing Lead',           'department':'Marketing',   'email':'suresh.kumar@team.dev',    'status':'available'},
    {'name':'Anjali Desai',    'role':'Content Strategist',       'department':'Marketing',   'email':'anjali.desai@team.dev',    'status':'offline'},
    # HR & Operations
    {'name':'Vikram Rao',      'role':'HR Manager',               'department':'Operations',  'email':'vikram.rao@team.dev',      'status':'available'},
    {'name':'Deepa Iyer',      'role':'Operations Lead',          'department':'Operations',  'email':'deepa.iyer@team.dev',      'status':'away'},
    # Data
    {'name':'Rahul Bose',      'role':'Data Scientist',           'department':'Data & AI',   'email':'rahul.bose@team.dev',      'status':'busy'},
    {'name':'Kavya Pillai',    'role':'ML Engineer',              'department':'Data & AI',   'email':'kavya.pillai@team.dev',    'status':'available'},
    {'name':'Sanjay Ghosh',    'role':'Data Analyst',             'department':'Data & AI',   'email':'sanjay.ghosh@team.dev',    'status':'available'},
    # Management
    {'name':'Lata Krishnan',   'role':'CTO',                      'department':'Management',  'email':'lata.krishnan@team.dev',   'status':'busy'},
    {'name':'Mohan Das',       'role':'Engineering Manager',      'department':'Management',  'email':'mohan.das@team.dev',       'status':'available'},
]

NOTES = {
    'available': ['', 'Ready for tasks', 'Working from home', 'Available all day', 'In office today'],
    'busy':      ['In a meeting', 'Deep work – DND', 'On a call', 'Deadline crunch', 'Sprint review'],
    'away':      ['Lunch break', 'Short break', 'Back in 30 min', 'Doctor appointment', 'Running errand'],
    'offline':   ['', 'Out of office', 'On leave', 'Weekend'],
}

def seed():
    app = create_app()
    with app.app_context():
        existing = TeamMember.query.count()
        if existing > 0:
            print('   Skipping seed - data already exists.')
            print('   Delete instance/team_availability.db to reseed.')
            return

        print('Seeding team members...')
        for i, m in enumerate(MEMBERS):
            color = AVATAR_COLORS[i % len(AVATAR_COLORS)]
            member = TeamMember(
                name         = m['name'],
                role         = m['role'],
                department   = m['department'],
                email        = m['email'],
                avatar_color = color,
                status       = m['status'],
                note         = random.choice(NOTES[m['status']]),
                last_seen    = datetime.utcnow() - timedelta(minutes=random.randint(0, 480)),
            )
            db.session.add(member)
            db.session.flush()

            # generate realistic status history
            current_time = datetime.utcnow() - timedelta(hours=8)
            prev = 'offline'
            for _ in range(random.randint(3, 8)):
                current_time += timedelta(minutes=random.randint(15, 90))
                new_st = random.choice(['available', 'busy', 'away', 'offline'])
                log = StatusLog(
                    member_id  = member.id,
                    old_status = prev,
                    new_status = new_st,
                    note       = random.choice(NOTES[new_st]),
                    changed_by = 'seed',
                    changed_at = current_time,
                )
                db.session.add(log)
                prev = new_st
            print(f'   [OK] {m["name"]} ({m["department"]}) - {m["status"]}')

        db.session.commit()
        total = TeamMember.query.count()
        logs  = StatusLog.query.count()
        print(f'\nDone. Seeded {total} team members with {logs} status log entries.')

if __name__ == '__main__':
    seed()

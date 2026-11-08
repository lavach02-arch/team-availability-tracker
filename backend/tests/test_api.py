import json

class TestHealth:
    def test_health_ok(self, client):
        r = client.get('/api/health')
        assert r.status_code == 200
        d = r.get_json()
        assert d['status'] == 'healthy'
        assert d['database'] == 'connected'

class TestStats:
    def test_stats_returns_counts(self, seeded_client):
        r = seeded_client.get('/api/stats')
        assert r.status_code == 200
        d = r.get_json()
        assert 'total' in d
        assert 'available' in d
        assert 'availability_rate' in d

class TestMembers:
    def test_list_members(self, seeded_client):
        r = seeded_client.get('/api/members')
        assert r.status_code == 200
        d = r.get_json()
        assert 'members' in d
        assert len(d['members']) >= 1

    def test_create_member(self, client):
        r = client.post('/api/members', json={
            'name': 'Bob Builder', 'email': 'bob@test.com',
            'role': 'Engineer', 'department': 'Engineering'
        })
        assert r.status_code == 201
        d = r.get_json()
        assert d['member']['name'] == 'Bob Builder'
        assert d['member']['status'] == 'offline'

    def test_create_duplicate_email(self, client):
        client.post('/api/members', json={
            'name': 'Dup User', 'email': 'dup@test.com', 'role': 'X', 'department': 'Y'
        })
        r = client.post('/api/members', json={
            'name': 'Dup User 2', 'email': 'dup@test.com', 'role': 'X', 'department': 'Y'
        })
        assert r.status_code == 409

    def test_create_missing_name(self, client):
        r = client.post('/api/members', json={'email': 'x@test.com'})
        assert r.status_code == 400

    def test_create_invalid_email(self, client):
        r = client.post('/api/members', json={'name': 'X', 'email': 'notanemail'})
        assert r.status_code == 400

    def test_get_single_member(self, seeded_client):
        members = seeded_client.get('/api/members').get_json()['members']
        mid = members[0]['id']
        r = seeded_client.get(f'/api/members/{mid}')
        assert r.status_code == 200
        assert r.get_json()['member']['id'] == mid

    def test_get_nonexistent_member(self, client):
        r = client.get('/api/members/99999')
        assert r.status_code == 404

    def test_update_member(self, seeded_client):
        mid = seeded_client.get('/api/members').get_json()['members'][0]['id']
        r = seeded_client.put(f'/api/members/{mid}', json={'role': 'Updated Role'})
        assert r.status_code == 200
        assert r.get_json()['member']['role'] == 'Updated Role'

    def test_delete_member(self, client):
        r = client.post('/api/members', json={
            'name': 'To Delete', 'email': 'delete@test.com',
            'role': 'Temp', 'department': 'Temp'
        })
        mid = r.get_json()['member']['id']
        r2 = client.delete(f'/api/members/{mid}')
        assert r2.status_code == 200
        r3 = client.get(f'/api/members/{mid}')
        assert r3.status_code == 404

class TestStatus:
    def test_update_status_valid(self, seeded_client):
        mid = seeded_client.get('/api/members').get_json()['members'][0]['id']
        for status in ['available', 'busy', 'away', 'offline']:
            r = seeded_client.put(f'/api/members/{mid}/status',
                                  json={'status': status, 'note': f'Test {status}'})
            assert r.status_code == 200
            assert r.get_json()['member']['status'] == status

    def test_update_status_invalid(self, seeded_client):
        mid = seeded_client.get('/api/members').get_json()['members'][0]['id']
        r = seeded_client.put(f'/api/members/{mid}/status', json={'status': 'flying'})
        assert r.status_code == 400

    def test_update_status_missing(self, seeded_client):
        mid = seeded_client.get('/api/members').get_json()['members'][0]['id']
        r = seeded_client.put(f'/api/members/{mid}/status', json={})
        assert r.status_code == 400

    def test_status_history(self, seeded_client):
        mid = seeded_client.get('/api/members').get_json()['members'][0]['id']
        seeded_client.put(f'/api/members/{mid}/status', json={'status': 'available'})
        r = seeded_client.get(f'/api/members/{mid}/history')
        assert r.status_code == 200
        assert len(r.get_json()['history']) >= 1

class TestFilters:
    def test_filter_by_status(self, seeded_client):
        mid = seeded_client.get('/api/members').get_json()['members'][0]['id']
        seeded_client.put(f'/api/members/{mid}/status', json={'status': 'available'})
        r = seeded_client.get('/api/members?status=available')
        assert r.status_code == 200
        members = r.get_json()['members']
        assert all(m['status'] == 'available' for m in members)

    def test_search(self, seeded_client):
        r = seeded_client.get('/api/members?search=Alice')
        assert r.status_code == 200

class TestActivity:
    def test_activity_feed(self, seeded_client):
        r = seeded_client.get('/api/activity')
        assert r.status_code == 200
        assert 'activity' in r.get_json()

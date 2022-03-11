import json
from app.main.model import User, SampleSet, Project, Sample, db
from flask_jwt_extended import create_access_token


def test_sampleSet(client):

    user = User.query.all()[0]
    token = create_access_token(user.as_dict())

    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    # check the normal case
    response = client.get("api/v1/sampleset", headers=headers,  content_type='application/json')
    data = response.get_json()
    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]["id"] != ""
    assert data[0]["system_name"] != ""

    # check no authorization
    response = client.get("api/v1/sampleset")
    data = response.get_json()
    assert response.status_code == 401
    assert data["msg"] != ""


def test_singlesampleset(client):
    user = db.session.query(User).first()
    sampleSet = db.session.query(SampleSet).first()
    id = str(sampleSet.id)
    token = create_access_token(user.as_dict())
    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    # normal case

    response = client.get("api/v1/sampleset/" + id, headers=headers)
    data = response.get_json()
    assert response.status_code == 200
    assert data["system_name"] != ""
    assert data["id"] != ""
    assert data["version"] == 0.1

    # no auth
    response = client.get("api/v1/sample/" + id)
    data = response.get_json()
    assert response.status_code == 401
    assert data["msg"] != ""


def test_create_samplesets(client):
    user = db.session.query(User).first()
    project = db.session.query(Project).first()

    token = create_access_token(user.as_dict())
    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    payload = {
        "name": "new name",
        "desc": "description",
        "system_name": "this is a name",
        "comment": "no comment",
        "pid": str(project.id)
    }

    # normal case

    response = client.post(
        "api/v1/sampleset", headers=headers, data=json.dumps(payload),
        content_type='application/json')
    data = response.get_json()

    assert response.status_code == 200
    assert data["id"] != ""
    assert data["version"] == 0.1
    assert data["system_name"] == "this is a name"

    # not auth
    response = client.post("api/v1/sampleset", data=json.dumps(payload), content_type='application/json')
    data = response.get_json()
    assert response.status_code == 401
    assert data["msg"] != ""

    # wrong input
    payload = {
        "na_wrong_me": "new name",
        "type": "blank",
        "comment": ""
    }
    response = client.post(
        "api/v1/sampleset", headers=headers, data=json.dumps(payload),
        content_type='application/json')
    data = response.get_json()
    assert response.status_code == 400
    assert data["message"] != ""


def test_updateSampleset(client):
    user = db.session.query(User).first()
    project = db.session.query(Project).first()
    sampleSet = db.session.query(SampleSet).first()

    token = create_access_token(user.as_dict())
    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    payload = {
        "name": "new name",
        "descr": "description",
        "system_name": "this is a new name for system",
        "pid": str(project.id),
        "comment": "no comment"
    }

    # normal case

    response = client.put(
        "api/v1/sampleset/" + str(sampleSet.id), headers=headers, data=json.dumps(payload),
        content_type='application/json')
    data = response.get_json()

    assert response.status_code == 200
    assert data["id"] != ""
    assert data["version"] != 0.1
    assert data["system_name"] == "this is a new name for system"
    assert data["vid"] == str(sampleSet.vid)

    # no authorization

    response = client.put(
        "api/v1/sampleset/" + str(sampleSet.id),
        data=json.dumps(payload),
        content_type='application/json')

    data = response.get_json()
    assert response.status_code == 401
    assert data["msg"] != ""

    # wrong input
    payload = {
        "name_wrong": "new name for update method set",
        "methods": [],
        "comment": "i ve updated this set"
    }
    response = client.put(
        "api/v1/sampleset/" + str(sampleSet.id),
        headers=headers, data=json.dumps(payload),
        content_type='application/json')

    data = response.get_json()
    assert response.status_code == 400
    assert data["message"] != ""

    samples = SampleSet.query.all()

    assert len(samples) == 3
    s0, s1, s2 = samples[0], samples[1], samples[2]
    assert s0.vid != s1.vid
    assert s1.vid == s2.vid
    assert s2.version != 0.1
    assert s0.version == 0.1
    assert s1.version == 0.1

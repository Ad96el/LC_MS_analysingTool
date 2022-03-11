import json
from app.main.model import User, Project, db
from flask_jwt_extended import create_access_token


def test_methodlist(client):

    user = User.query.all()[0]
    token = create_access_token(user.as_dict())
    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    # check the normal case
    response = client.get("api/v1/project", headers=headers)
    data = response.get_json()
    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]["id"] != ""
    assert data[0]["name"] != ""
    assert data[0]["id"] != ""
    assert data[0]["sop"] != ""

    # check no authorization
    response = client.get("api/v1/project/getlist")
    data = response.get_json()
    assert response.status_code == 401
    assert data["msg"] != ""


def test_singleMethod(client):
    user = db.session.query(User).first()
    project = db.session.query(Project).first()
    id = str(project.id)
    token = create_access_token(user.as_dict())
    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    # normal case

    response = client.get("api/v1/project/" + id, headers=headers)
    data = response.get_json()
    assert response.status_code == 200
    assert data["name"] != ""
    assert data["id"] != ""

    # no auth
    response = client.get("api/v1/project/" + id)
    data = response.get_json()
    assert response.status_code == 401
    assert data["msg"] != ""


def test_createProject(client):

    user = User.query.all()[0]

    token = create_access_token(user.as_dict())
    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    payload = {
        "name": "new name project ",
        "desc": "create a new project",
        "sop": "sop1"
    }

    # normal case
    response = client.post(
        "api/v1/project", headers=headers, data=json.dumps(payload),
        content_type='application/json')
    data = response.get_json()
    assert response.status_code == 200
    assert data["id"] != ""

    # no authorization
    response = client.post("api/v1/project", data=json.dumps(payload), content_type='application/json')
    data = response.get_json()
    assert response.status_code == 401
    assert data["msg"] != ""

    # wrong input
    payload = {
        "name_wrong": "new name project ",
        "desc": "create a new project",
    }
    response = client.post("api/v1/project", headers=headers, data=json.dumps(payload), content_type='application/json')
    data = response.get_json()
    assert response.status_code == 400
    assert data["message"] != ""

    # check database
    projects = Project.query.all()
    assert len(projects) == 2


def test_updateProject(client):

    user = User.query.all()[0]
    project = Project.query.all()[0]

    token = create_access_token(user.as_dict())
    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    payload = {
        "name": "updated projects",
        "desc": "create a new project",
        "sop": "sop1"
    }

    # normal case
    response = client.put(
        "api/v1/project/" + str(project.id),
        headers=headers, data=json.dumps(payload),
        content_type='application/json')

    data = response.get_json()
    assert response.status_code == 200
    assert data["id"] == str(project.id)

    # no authorization
    response = client.put(
        "api/v1/project/" + str(project.id),
        data=json.dumps(payload),
        content_type='application/json')

    data = response.get_json()
    assert response.status_code == 401
    assert data["msg"] != ""

    # wrong input
    payload = {
        "name_wrong": "updated projects",
        "desc": "create a new project",
        "sop": "sop1"
    }
    response = client.put(
        "api/v1/method/" + str(project.id),
        headers=headers, data=json.dumps(payload),
        content_type='application/json')
    data = response.get_json()
    assert response.status_code == 400
    assert data["message"] != ""

    # check database
    projects = Project.query.all()

    assert len(projects) == 2

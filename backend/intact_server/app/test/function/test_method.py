import json
from app.main.model import User, Method, db
from flask_jwt_extended import create_access_token


def test_methodlist(client):

    userq = User.query.all()
    user = userq[0]
    token = create_access_token(user.as_dict())
    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    # check the normal case
    response = client.get("api/v1/method", headers=headers)
    data = response.get_json()
    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]["id"] != ""
    assert data[0]["name"] == "method1"
    assert data[0]["id"] != ""

    # check no authorization
    response = client.get("api/v1/method")
    data = response.get_json()
    assert response.status_code > 300
    assert data["msg"] != ""


def test_singleMethod(client):
    user = db.session.query(User).first()
    method = db.session.query(Method).first()
    id = str(method.id)
    token = create_access_token(user.as_dict())
    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    # normal case

    response = client.get("api/v1/method/" + id, headers=headers)
    data = response.get_json()
    assert response.status_code == 200
    assert data["name"] != ""
    assert data["id"] != ""
    assert data["version"] == 0.1

    # no auth
    response = client.get("api/v1/method/" + id)
    data = response.get_json()
    assert response.status_code > 400
    assert data["msg"] != ""


def test_createMethod(client):

    user = User.query.all()[0]
    token = create_access_token(user.as_dict())
    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    payload = {
        "type": "new super cool type",
        "name": "new name"
    }

    # normal case
    response = client.post("api/v1/method", headers=headers, data=json.dumps(payload), content_type='application/json')
    data = response.get_json()
    assert response.status_code == 200
    assert data["id"] != ""

    # no authorization
    response = client.post("api/v1/method", data=json.dumps(payload), content_type='application/json')
    data = response.get_json()
    assert response.status_code == 401
    assert data["msg"] != ""

    # wrong input
    payload = {
        "type_wrong": "new super cool type",
        "name": "new name"
    }
    response = client.post("api/v1/method", headers=headers, data=json.dumps(payload), content_type='application/json')
    data = response.get_json()
    assert response.status_code == 400
    assert data["message"] != ""

    # check database
    methods = Method.query.all()
    assert len(methods) == 2


def test_updateMethod(client):

    user = User.query.all()[0]
    method = Method.query.all()[0]

    token = create_access_token(user.as_dict())
    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    payload = {
        "type": "update method 1",
        "name": "new name for update",
        "comment": "updates the method set"
    }

    # normal case
    response = client.put(
        "api/v1/method/" + str(method.id),
        headers=headers, data=json.dumps(payload),
        content_type='application/json')

    data = response.get_json()
    assert response.status_code == 200
    assert data["id"] != ""
    assert data["version"] != 0.1
    assert data["vid"] == str(method.vid)

    # no authorization
    response = client.put(
        "api/v1/method/" + str(method.id),
        data=json.dumps(payload),
        content_type='application/json')

    data = response.get_json()
    assert response.status_code == 401
    assert data["msg"] != ""

    # wrong input
    payload = {
        "type_wrong": "new super cool type",
        "name": "new name"
    }
    response = client.put(
        "api/v1/method/" + str(method.id),
        headers=headers, data=json.dumps(payload),
        content_type='application/json')
    data = response.get_json()
    assert response.status_code == 400
    assert data["message"] != ""

    # check database
    methods = Method.query.all()
    m0, m1 = methods[1], methods[2]
    assert len(methods) == 3
    assert m0.vid == m1.vid
    assert m0.version != m1.version

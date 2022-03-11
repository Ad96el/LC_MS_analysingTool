
import json
from app.main.model import User, MethodSet, Method, db
from flask_jwt_extended import create_access_token


def test_methodlistSet(client):

    user = User.query.all()[0]
    token = create_access_token(user.as_dict())
    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    # check the normal case
    response = client.get("api/v1/methodset", headers=headers)
    data = response.get_json()
    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]["id"] != ""
    assert data[0]["name"] == "name"

    # check no authorization
    response = client.get("api/v1/method")
    data = response.get_json()
    assert response.status_code == 401
    assert data["msg"] != ""


def test_singleMethodSet(client):
    user = db.session.query(User).first()
    methodSet = db.session.query(MethodSet).first()
    id = str(methodSet.id)
    token = create_access_token(user.as_dict())
    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    # normal case

    response = client.get("api/v1/methodset/" + id, headers=headers)
    data = response.get_json()
    assert response.status_code == 200
    assert data["name"] != ""
    assert data["id"] != ""
    assert data["version"] == 0.1

    # no auth
    response = client.get("api/v1/methodset/" + id)
    data = response.get_json()
    assert response.status_code == 401
    assert data["msg"] != ""


def test_createMethodset(client):

    user = User.query.all()[0]
    token = create_access_token(user.as_dict())
    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    payload = {
        "name": "new name",
        "methods": [],
        "comment": ""
    }

    # normal case
    response = client.post(
        "api/v1/methodset", headers=headers, data=json.dumps(payload),
        content_type='application/json')
    data = response.get_json()
    assert response.status_code == 200
    assert data["id"] != ""

    # no authorization
    response = client.post("api/v1/methodset", data=json.dumps(payload), content_type='application/json')
    data = response.get_json()
    assert response.status_code == 401
    assert data["msg"] != ""

    # wrong input
    payload = {
        "na_wrong_me": "new name",
        "methods": [],
        "comment": ""
    }
    response = client.post(
        "api/v1/methodset", headers=headers, data=json.dumps(payload),
        content_type='application/json')
    data = response.get_json()
    assert response.status_code == 400
    assert data["message"] != ""

    # check with methods

    method = Method.query.all()[0]

    payload = {
        "name": "new name",
        "methods": [{"name": method.name, "id": str(method.id)}],
        "comment": ""
    }

    response = client.post(
        "api/v1/methodset", headers=headers, data=json.dumps(payload),
        content_type='application/json')

    data = response.get_json()
    assert response.status_code == 200
    assert data["id"] != ""
    assert len(data["methods"]) == 1

    # check database
    methodsets = MethodSet.query.all()
    assert len(methodsets) == 3


def test_updateMethod(client):

    user = User.query.all()[0]
    methodset = MethodSet.query.all()[0]

    token = create_access_token(user.as_dict())
    headers = {
        'Authorization': 'Bearer {}'.format(token)
    }

    payload = {
        "name": "new name for update method set",
        "methods": [],
        "comment": "i ve updated this set"
    }

    # normal case
    response = client.put(
        "api/v1/methodset/" + str(methodset.id),
        headers=headers, data=json.dumps(payload),
        content_type='application/json')

    data = response.get_json()
    assert response.status_code == 200
    assert data["id"] != ""
    assert data["version"] != 0.1
    assert data["vid"] == str(methodset.vid)

    # no authorization

    response = client.put(
        "api/v1/methodset/" + str(methodset.id),
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
        "api/v1/methodset/" + str(methodset.id),
        headers=headers, data=json.dumps(payload),
        content_type='application/json')

    data = response.get_json()
    assert response.status_code == 400
    assert data["message"] != ""

    # check database
    methodsets = MethodSet.query.all()
    m0, m1, m2, m3 = methodsets[0], methodsets[1], methodsets[2], methodsets[3]
    assert len(methodsets) == 4
    assert m0.vid != m1.vid
    assert m1.vid != m2.vid
    assert m2.vid == m3.vid
    assert m3.version != 0.1
    assert m0.version == 0.1
    assert m1.version == 0.1
    assert m2.version == 0.1

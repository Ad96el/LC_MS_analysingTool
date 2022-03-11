import json


def test_login(client):

    payload = {
        "email": "test@gmail.com",
        "password": "hello"
    }
    response = client.post("api/v1/user/login", data=json.dumps(payload),  content_type='application/json')
    data = response.get_json()
    assert response.status_code == 200
    assert data["token"] != ""
    assert data["userId"] != ""


def test_signup(client):

    payload = {
        "email": "testasuidf52@agmaailq.com",
        "password": "hello"
    }

    response = client.post("api/v1/user/signup", data=json.dumps(payload),  content_type='application/json')
    data = response.get_json()
    assert response.status_code == 200
    assert data["id"] != ""
    assert data["approved"] == False
    assert data["role"] == 0
    assert data["created"] != ""

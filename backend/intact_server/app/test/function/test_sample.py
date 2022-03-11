
# import json
# from app.main.model import User, Sample, db
# from flask_jwt_extended import create_access_token


# def test_sample(client):

#     user = User.query.all()[0]
#     token = create_access_token(user.as_dict())

#     headers = {
#         'Authorization': 'Bearer {}'.format(token)
#     }

#     # check the normal case
#     response = client.get("api/v1/sample", headers=headers)
#     data = response.get_json()
#     assert response.status_code == 200
#     assert len(data) == 1
#     assert data[0]["id"] != ""
#     assert data[0]["sample_name"] != ""

#     # check no authorization
#     response = client.get("api/v1/method")
#     data = response.get_json()
#     assert response.status_code == 401
#     assert data["msg"] != ""


# def test_singlesample(client):
#     user = db.session.query(User).first()
#     sample = db.session.query(Sample).first()
#     id = str(sample.id)
#     token = create_access_token(user.as_dict())
#     headers = {
#         'Authorization': 'Bearer {}'.format(token)
#     }

#     # normal case

#     response = client.get("api/v1/sample/" + id, headers=headers)
#     data = response.get_json()
#     assert response.status_code == 200
#     assert data["sample_name"] != ""
#     assert data["id"] != ""
#     assert data["version"] == 0.1

#     # no auth
#     response = client.get("api/v1/sample/" + id)
#     data = response.get_json()
#     assert response.status_code == 401
#     assert data["msg"] != ""


# def test_createSample(client):

#     user = User.query.all()[0]
#     token = create_access_token(user.as_dict())
#     headers = {
#         'Authorization': 'Bearer {}'.format(token)
#     }

#     payload = {
#         "sample_name": "new Sample",
#         "sample_type": "blank",
#         "comment": "",
#         "color": "#FFFFFF"
#     }

#     # normal case
#     response = client.post(
#         "api/v1/sample", headers=headers, data=json.dumps(payload),
#         content_type='application/json')
#     data = response.get_json()
#     assert response.status_code == 200
#     assert data["id"] != ""

#     # no authorization
#     response = client.post("api/v1/sample", data=json.dumps(payload), content_type='application/json')
#     data = response.get_json()
#     assert response.status_code == 401
#     assert data["msg"] != ""

#     # wrong input
#     payload = {
#         "na_wrong_me": "new name",
#         "type": "blank",
#         "comment": ""
#     }
#     response = client.post("api/v1/sample", headers=headers, data=json.dumps(payload), content_type='application/json')
#     data = response.get_json()
#     assert response.status_code == 400
#     assert data["message"] != ""


# def test_updateSample(client):

#     user = User.query.all()[0]
#     sample = Sample.query.all()[0]

#     token = create_access_token(user.as_dict())
#     headers = {
#         'Authorization': 'Bearer {}'.format(token)
#     }

#     payload = {
#         "sample_name": "new name for update method set",
#         "sample_type": "hello",
#         "comment": "i ve updated this set",
#         "color": "#FFFFFF"
#     }

#     # normal case
#     response = client.put(
#         "api/v1/sample/" + str(sample.id),
#         headers=headers, data=json.dumps(payload),
#         content_type='application/json')

#     data = response.get_json()
#     assert response.status_code == 200
#     assert data["id"] != ""
#     assert data["version"] != 0.1
#     assert data["vid"] == str(sample.vid)

#     # no authorization

#     response = client.put(
#         "api/v1/sample/" + str(sample.id),
#         data=json.dumps(payload),
#         content_type='application/json')

#     data = response.get_json()
#     assert response.status_code == 401
#     assert data["msg"] != ""

#     # wrong input
#     payload = {
#         "name_wrong": "new name for update method set",
#         "methods": [],
#         "comment": "i ve updated this set"
#     }
#     response = client.put(
#         "api/v1/sample/" + str(sample.id),
#         headers=headers, data=json.dumps(payload),
#         content_type='application/json')

#     data = response.get_json()
#     assert response.status_code == 400
#     assert data["message"] != ""

#     # check database
#     samples = Sample.query.all()
#     s0, s1, s2 = samples[0], samples[1], samples[2]
#     assert len(samples) == 3
#     assert s0.vid != s1.vid
#     assert s1.vid == s2.vid
#     assert s2.version != 0.1
#     assert s0.version == 0.1
#     assert s1.version == 0.1

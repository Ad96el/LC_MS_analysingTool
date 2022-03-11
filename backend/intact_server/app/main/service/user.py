from typing import Dict, List
from flask import abort
import random
import string
import requests
# own libs
from app.main.util.utils import check_permissions, dataBaseSave, dataBaseUpdate, pagination
from app.main.util import messages
from app.main.model import db, User
from flask_jwt_extended import create_access_token


def generate_token(email: str, password: str):
    user = User.query.filter_by(email=email).first()
    if(not user):
        abort(400, description="email does not exits")
    if(not user.approved):
        abort(400, description="User is not approved")
    out = {}
    correct_pwd = user.validate_password(password)
    if(correct_pwd):
        access_token = create_access_token(identity=user.as_dictJWT())
        out["token"] = access_token
        return out
    else:
        abort(500, description="password was not correct")


def create_user(email: str, password: str) -> User:
    user = User.query.filter_by(email=email).first()
    if user:
        abort(400, description="User already exits")
    new_User = User(email, password)
    dataBaseSave(new_User)
    return new_User


def get_user(id) -> User:
    user = User.query.filter_by(id=id).first()
    if not user:
        abort(400, description="User does not exits")
    return user


def get_user_list(filter: Dict[str, str], sort: List[str], range: List[int]) -> List[User]:
    query = db.session.query(User)
    rows = query.count()
    users = pagination(sort, filter, range, User, query)
    out = []
    for user in users:
        out.append(user.as_dict())
    return out, rows


def edit_user(id, data, uid):
    user = get_user(id)
    requestedUser = get_user(uid)
    check_permissions(requestedUser.role, messages.ADMIN_PERMISSION)
    user.email = data["email"]
    user.approved = data["approved"]
    user.role = data["role"]
    dataBaseUpdate()
    return user


def restore_user(email):
    user = User.query.filter_by(email=email).first()
    if(not user):
        abort(400, "User does not exits")
    password = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    json = {}
    json["To"] = user.email
    json["topic"] = "RESET_PASSWORD"
    json["password"] = password
    # response = requests.post("http://email:4100/api/send", json=json)
    # if (not response.status_code == 200):
    #     abort(500, "Internal Server Error")
    # user.setPassword(password)
    # dataBaseUpdate()
    return user

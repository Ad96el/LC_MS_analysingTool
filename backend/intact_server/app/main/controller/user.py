# libs
from flask_jwt_extended.view_decorators import jwt_required
from flask_jwt_extended.utils import get_jwt_identity
from app.main.util.utils import generate_header
from flask import request
from flask_restplus.marshalling import marshal
import json
# own libs
from app.main.service.user import generate_token, create_user, get_user_list, edit_user, restore_user
from app.main.util.dto import credentials, tokens, user
from flask_restplus import Namespace, Resource

app = Namespace("auth", description="Controller for the user")


@app.route('/login')
class User_login(Resource):
    @app.doc(description="login user with credentials", security=[])
    @app.marshal_with(tokens)
    @app.expect(credentials, validate=True)
    def post(self):
        data = request.get_json()
        email = data["email"]
        password = data["password"]
        out = generate_token(email, password)
        return marshal(out, tokens)


@app.route('/signup')
class User_singUp(Resource):
    @app.doc(description="login user with credentials")
    @app.marshal_with(user)
    @app.expect(credentials, validate=True)
    def post(self):
        data = request.get_json()
        email = data["email"]
        password = data["password"]
        out = create_user(email, password)
        return marshal(out.as_dict(), user)


@app.route("")
class Users(Resource):
    @app.doc(description="Return all users")
    @app.marshal_with(user)
    @jwt_required()
    def get(self):
        filter = request.args.get("filter")
        range = request.args.get("range")
        sort = request.args.get("sort")
        filter = json.loads(filter) if filter else {}
        range = json.loads(range) if range else [0, 250]
        sort = json.loads(sort) if sort else ["id", "asc"]
        out, count = get_user_list(filter, sort, range)
        header = generate_header(count)
        return out, 200, header


@app.route('/<id>')
@app.param('id', 'The User identifier')
class User_id(Resource):
    @jwt_required()
    @app.doc(description="updates an user")
    @app.expect(user, vlidate=True)
    @app.marshal_with(user)
    def put(self, id):
        data = request.get_json()
        user_details = get_jwt_identity()
        out = edit_user(id, data, user_details["id"])
        return marshal(out, user)


@app.route('/restore')
class User_restore(Resource):
    @app.doc(description="gives an user a random password")
    @app.expect(user, vlidate=True)
    @app.marshal_with(user)
    def post(self):
        data = request.get_json()
        email = data["email"]
        out = restore_user(email)
        return marshal(out, user)

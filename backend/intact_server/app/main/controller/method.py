# libs
from app.main.util.utils import generate_header
from flask import request
from flask_jwt_extended.utils import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_restplus import Namespace, Resource
from flask_restplus.marshalling import marshal
import json
# own libs
from app.main.util.dto import method, method_create_update, version
from app.main.service.method import (
    get_method_by_msid,
    delete_method,
    get_method_by_vid,
    get_method,
    get_method_list,
    edit_method,
    create_method)

app = Namespace("method", description="Controller for the user")


@app.route('')
class Method(Resource):
    @app.doc(description="return all methods",
             params={"range": '[start, end]',
                     "sort": '["field": "which field", "order": "order of the sort"]',
                     "filter": "filter over column"})
    @app.marshal_list_with(method)
    def get(self):
        filter = request.args.get("filter")
        range = request.args.get("range")
        sort = request.args.get("sort")
        filter = json.loads(filter) if filter else {}
        range = json.loads(range) if range else [0, 250]
        sort = json.loads(sort) if sort else ["id", "asc"]

        out, count = get_method_list(filter, sort, range)
        header = generate_header(count)
        return out, 200, header

    @jwt_required()
    @app.doc(description="creates a new method")
    @app.marshal_with(method)
    @app.expect(method_create_update, validate=True)
    def post(self):
        data = request.get_json()
        name = data["name"]
        type = data["type"]
        method_props = data["method"] if "method" in data else []
        user_details = get_jwt_identity()
        out = create_method(name, type, method_props, user_details["id"])
        return marshal(out.as_dict(), method)


@app.route('/<id>')
@app.param('id', 'The method identifier')
class Method_id(Resource):

    @app.doc(description="returns a method from id")
    @app.marshal_with(method)
    def get(self, id):
        out = get_method(id)
        return marshal(out, method)

    @jwt_required()
    @app.doc(description="updates a method")
    @app.marshal_with(method)
    @app.expect(method_create_update, validate=True)
    def put(self, id):
        data = request.get_json()
        name = data["name"]
        comment = data["comment"] if "comment" in data else ""
        method_props = data["method"]
        user_details = get_jwt_identity()
        out = edit_method(id, name, method_props, user_details["id"], comment)
        return marshal(out, method)

    @jwt_required()
    @app.doc(description="Deletes a method")
    @app.marshal_with(method)
    def delete(self, id):
        user_details = get_jwt_identity()
        out = delete_method(id, user_details["id"])
        return marshal(out, method)


@app.route('/version/<id>')
class Method_version(Resource):
    @app.doc(description="get all versions")
    @app.marshal_list_with(version)
    def get(self, id):
        out = get_method_by_vid(id)
        return marshal(out, version)


@app.route('/methodset/<id>')
class Method_Methodset(Resource):
    @app.doc(description="get all versions")
    @app.marshal_list_with(method)
    def get(self, id):
        out = get_method_by_msid(id)
        return marshal(out, method)

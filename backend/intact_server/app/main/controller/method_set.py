# libs
from app.main.util.utils import generate_header
from flask_jwt_extended.utils import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_restplus import Namespace, Resource
from flask_restplus.marshalling import marshal
from flask import request
import json
# own libs
from app.main.service.method_set import (
    get_methodset_by_vid,
    get_methodset, get_methodset_list,
    create_method_set,
    edit_method_set,
    remove_method_set)

from app.main.util.dto import methodSet_create_update, method_set, version

app = Namespace("Method Set", description="Controller for the method sets")


@app.route('')
class MethodSet(Resource):
    @app.marshal_with(method_set)
    @app.expect(methodSet_create_update, validate=True)
    @jwt_required()
    @app.doc(description="creates a new method set",
             params={"range": '[start, end]',
                     "sort": '["field": "which field", "order": "order of the sort"]',
                     "filter": "filter over column"})
    def post(self):
        user_details = get_jwt_identity()
        data = request.get_json()
        name = data["name"]
        methods = data["methods"] if "methods" in data else []
        out = create_method_set(name, methods, user_details["id"])
        return marshal(out, method_set)

    @app.doc(description="returns all method lists")
    @app.marshal_list_with(method_set)
    def get(self):
        filter = request.args.get("filter")
        range = request.args.get("range")
        sort = request.args.get("sort")
        filter = json.loads(filter) if filter else {}
        range = json.loads(range) if range else [0, 250]
        sort = json.loads(sort) if sort else ["id", "asc"]
        out, rows = get_methodset_list(filter, range, sort)
        header = generate_header(rows)
        return out, 200, header


@app.route('/<id>')
class MethodSet(Resource):
    @app.param('id', 'The method set identifier')
    @app.doc(description="updates a method set")
    @app.marshal_with(method_set)
    @app.expect(methodSet_create_update, validate=True)
    @jwt_required()
    def put(self, id):
        data = request.get_json()
        name = data["name"]
        methods = data["methods"]
        comment = data["comment"] if "comment" in data else ""
        user_details = get_jwt_identity()
        out = edit_method_set(id, name, methods, user_details["id"], comment)
        return marshal(out.as_dict(), method_set)

    @app.param('id', 'The method set identifier')
    @app.doc(description="get a method set by id")
    @app.marshal_with(method_set)
    def get(self, id):
        out = get_methodset(id)
        return marshal(out, method_set)

    @jwt_required()
    @app.param('id', 'The method set identifier')
    @app.doc(description="deletes a method set")
    def delete(self, id):
        user_details = get_jwt_identity()
        out = remove_method_set(id, user_details["id"])
        return marshal(out, method_set)


@app.route('/version/<id>')
class MethodSet_version(Resource):
    @app.doc(description="get all versions")
    @app.marshal_list_with(version)
    def get(self, id):
        out = get_methodset_by_vid(id)
        return marshal(out, version)

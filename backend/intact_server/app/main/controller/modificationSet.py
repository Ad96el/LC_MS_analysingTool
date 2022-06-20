# libs
from app.main.util.utils import generate_header
from flask import request
from flask_jwt_extended.utils import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_restplus import Namespace, Resource
from flask_restplus.marshalling import marshal
import json
# own libs
from app.main.util.dto import modification_set, modification_set_create_update
from app.main.service.modification_set import (
    delete_modification_set,
    get_modification_set,
    get_modification_set_list,
    edit_modification_set,
    create_modification_set)

app = Namespace("modification_set", description="Controller for the Modification Sets")


@app.route('')
class Modification_Set(Resource):
    @app.doc(description="return all modifications",
             params={"range": '[start, end]',
                     "sort": '["field": "which field", "order": "order of the sort"]',
                     "filter": "filter over column"})
    @app.marshal_list_with(modification_set)
    @jwt_required()
    def get(self):
        filter = request.args.get("filter")
        range = request.args.get("range")
        sort = request.args.get("sort")
        filter = json.loads(filter) if filter else {}
        range = json.loads(range) if range else [0, 250]
        sort = json.loads(sort) if sort else ["id", "asc"]

        out, count = get_modification_set_list(filter, sort, range)
        header = generate_header(count)
        return marshal(out, modification_set), 200, header

    @jwt_required()
    @app.doc(description="creates a new modification")
    @app.marshal_with(modification_set)
    @app.expect(modification_set_create_update, validate=True)
    def post(self):
        data = request.get_json()
        name = data["name"]
        modifications = data["modifications"]
        user_details = get_jwt_identity()
        out = create_modification_set(name, modifications, user_details["id"])
        return marshal(out.as_dict(), modification_set)


@app.route('/<id>')
@app.param('id', 'The modification set identifier')
class Modification_set_id(Resource):

    @app.doc(description="returns a modification set from id")
    @app.marshal_with(modification_set)
    @jwt_required()
    def get(self, id):
        out = get_modification_set(id)
        return marshal(out, modification_set)

    @jwt_required()
    @app.doc(description="updates a modification set")
    @app.marshal_with(modification_set)
    @app.expect(modification_set_create_update, validate=True)
    def put(self, id):
        data = request.get_json()
        name = data["name"]
        modifications = data["modifications"]
        user_details = get_jwt_identity()
        out = edit_modification_set(id, name, modifications, user_details["id"])
        return marshal(out, modification_set)

    @jwt_required()
    @app.doc(description="Deletes a modification set")
    @app.marshal_with(modification_set)
    def delete(self, id):
        user_details = get_jwt_identity()
        out = delete_modification_set(id, user_details["id"])
        return marshal(out, modification_set)

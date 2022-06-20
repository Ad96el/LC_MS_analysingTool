# libs
from app.main.util.utils import generate_header
from flask import request
from flask_jwt_extended.utils import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_restplus import Namespace, Resource
from flask_restplus.marshalling import marshal
import json
# own libs
from app.main.util.dto import modification, modification_create_update
from app.main.service.modification import (
    delete_modification,
    get_modification,
    get_modification_list,
    edit_modification,
    create_modification)

app = Namespace("modification", description="Controller for the Modification")


@app.route('')
class Modification(Resource):
    @app.doc(description="return all modifications",
             params={"range": '[start, end]',
                     "sort": '["field": "which field", "order": "order of the sort"]',
                     "filter": "filter over column"})
    @app.marshal_list_with(modification)
    @jwt_required()
    def get(self):
        filter = request.args.get("filter")
        range = request.args.get("range")
        sort = request.args.get("sort")
        filter = json.loads(filter) if filter else {}
        range = json.loads(range) if range else [0, 250]
        sort = json.loads(sort) if sort else ["id", "asc"]

        out, count = get_modification_list(filter, sort, range)
        header = generate_header(count)
        return out, 200, header

    @ jwt_required()
    @ app.doc(description="creates a new modification")
    @ app.marshal_with(modification)
    @ app.expect(modification_create_update, validate=True)
    def post(self):
        data = request.get_json()
        name = data["name"]
        formula_add = data["formula_add"]
        formula_sub = data["formula_sub"] if "formula_sub" in data else ""
        kind = data["kind"]
        user_details = get_jwt_identity()
        out = create_modification(name, formula_add, formula_sub, kind, user_details["id"])
        return marshal(out.as_dict(), modification)


@app.route('/<id>')
@app.param('id', 'The modification identifier')
class Modification_id(Resource):

    @app.doc(description="returns a modification from id")
    @app.marshal_with(modification)
    @jwt_required()
    def get(self, id):
        out = get_modification(id)
        return marshal(out, modification)

    @jwt_required()
    @app.doc(description="updates a modification")
    @app.marshal_with(modification)
    @app.expect(modification_create_update, validate=True)
    def put(self, id):
        data = request.get_json()
        name = data["name"]
        formula_add = data["formula_add"]
        formula_sub = data["formula_sub"] if "formula_sub" in data else ""
        kind = data["kind"]
        user_details = get_jwt_identity()
        out = edit_modification(id, name, formula_add, formula_sub, kind, user_details["id"])
        return marshal(out, modification)

    @jwt_required()
    @app.doc(description="Deletes a modification")
    @app.marshal_with(modification)
    def delete(self, id):
        user_details = get_jwt_identity()
        out = delete_modification(id, user_details["id"])
        return marshal(out, modification)

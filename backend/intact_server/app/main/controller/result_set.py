# libs
from app.main.util.utils import generate_header
from flask import request
import json
from flask_jwt_extended.utils import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_restplus import Namespace, Resource
from flask_restplus.marshalling import marshal
# own libs
from app.main.service.result_set import (
    get_result_set,
    get_result_set_list,
    create_result_Set,
    delete_result_set,
    get_result_set_by_vid
)
from app.main.util.dto import resultSet, result_set_update_create, version

app = Namespace("resultset", description="Controller for result sets")


@app.route('/<id>')
class Result_id(Resource):

    @app.marshal_with(resultSet)
    @jwt_required()
    @app.doc(description="get result set by id")
    def get(self, id):
        out = get_result_set(id)
        return marshal(out.as_dict(), resultSet)

    @jwt_required()
    @app.doc(description="Deletes a result set")
    @app.marshal_with(resultSet)
    def delete(self, id):
        user_details = get_jwt_identity()
        out = delete_result_set(id, user_details["id"])
        return marshal(out, resultSet)


@app.route('')
class Result(Resource):
    @app.marshal_with(resultSet)
    @jwt_required()
    @app.doc(description="creates a new result set")
    @app.expect(result_set_update_create, validate=True)
    def post(self):
        data = request.get_json()
        kind = data["kind"]
        sid = data["sid"]
        user_details = get_jwt_identity()
        out = create_result_Set(sid, user_details["id"], kind)
        return marshal(out, resultSet)

    @app.doc(description="get all result sets")
    @app.marshal_list_with(resultSet)
    @jwt_required()
    def get(self):
        filter = request.args.get("filter")
        range = request.args.get("range")
        sort = request.args.get("sort")
        filter = json.loads(filter) if filter else {"head": True}
        range = json.loads(range) if range else [0, 250]
        sort = json.loads(sort) if sort else ["id", "asc"]
        out, rows = get_result_set_list(filter, sort, range)
        header = generate_header(rows)
        return out, 200, header


@app.route('/version/<id>')
class ResultSet_Version(Resource):
    @app.doc(description="get all versions")
    @app.marshal_list_with(version)
    @jwt_required()
    def get(self, id):
        out = get_result_set_by_vid(id)
        return marshal(out, version)

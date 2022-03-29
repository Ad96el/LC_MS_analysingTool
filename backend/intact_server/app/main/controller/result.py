# libs
from app.main.util.utils import generate_header
from flask import request, send_from_directory
import json
from flask_jwt_extended.utils import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_restplus import Namespace, Resource
from flask_restplus.marshalling import marshal
# own libs
from app.main.service.results import (
    get_result,
    get_result_list,
    create_result,
    delete_result,
    edit_result,
    get_result_by_vid,
    createResultPdf,
)
from app.main.util.dto import result, result_update_create, version, result_preview

app = Namespace("results", description="Controller for results")


@app.route('/<id>')
class Result_id(Resource):

    @app.marshal_with(result)
    @app.doc(description="get result by id")
    def get(self, id):
        out = get_result(id)
        return marshal(out.as_dict(), result)

    @jwt_required()
    @app.expect(result_update_create, validate=True)
    @app.marshal_with(result)
    @app.doc(description="updates a result")
    def put(self, id):
        user_details = get_jwt_identity()
        data = request.get_json()
        peaks = data["peaks"]
        msid = data["msid"]
        sid = data["sid"]
        comment = data["comment"] if "comment" in data else ""
        out = edit_result(id, peaks, user_details["id"], msid, sid, comment)
        return marshal(out.as_dict(), result)

    @jwt_required()
    @app.doc(description="Deletes a result")
    @app.marshal_with(result)
    def delete(self, id):
        user_details = get_jwt_identity()
        out = delete_result(id, user_details["id"])
        return marshal(out, result)


@app.route('')
class Result(Resource):
    @app.marshal_with(result)
    @jwt_required()
    @app.doc(description="creates a new result")
    @app.expect(result_update_create, validate=True)
    def post(self):
        data = request.get_json()
        tics = data["tics"]
        peaks = data["data"]
        sid = data["id"]
        user_details = get_jwt_identity()
        out = create_result(peaks, tics, user_details["id"],  sid)
        return marshal(out, result)

    @app.doc(description="get all result")
    @app.marshal_list_with(result)
    def get(self):
        filter = request.args.get("filter")
        range = request.args.get("range")
        sort = request.args.get("sort")
        filter = json.loads(filter) if filter else {"head": True}
        range = json.loads(range) if range else [0, 250]
        sort = json.loads(sort) if sort else ["id", "asc"]
        out, rows = get_result_list(filter, sort, range)
        header = generate_header(rows)
        return marshal(out, result_preview), 200, header


@app.route('/version/<id>')
class Result_Version(Resource):
    @app.doc(description="get all versions")
    @app.marshal_list_with(version)
    def get(self, id):
        out = get_result_by_vid(id)
        return marshal(out, version)


@app.route('/pdfview/<id>')
class PdfCreation(Resource):
    @app.doc(description="Generates a pdf from the passed id")
    def get(self, id):
        encodedString = createResultPdf(id)
        return {"pdfb64": encodedString.decode("UTF-8")}

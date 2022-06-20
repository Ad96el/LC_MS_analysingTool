# libs
from app.main.util.utils import generate_header
from flask import request
import json
from flask_jwt_extended.utils import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_restplus import Namespace, Resource
from flask_restplus.marshalling import marshal
# own libs
from app.main.service.sample import (
    all_peak,
    assign_Peaks_to_component,
    get_deconvolution_data,
    get_peaks,
    get_sample_ms,
    get_sample_tics,
    delete_sample,
    get_sample,
    get_sample_list,
    edit_sample,
    create_sample)
from app.main.util.dto import sample, sample_update_create

app = Namespace("sample", description="Controller for samples")


@app.route('/<id>')
class Sample_id(Resource):

    @app.marshal_with(sample)
    @app.doc(description="get sample by id")
    @jwt_required()
    def get(self, id):
        out = get_sample(id)
        return marshal(out.as_dict(), sample)

    @jwt_required()
    @app.expect(sample_update_create, validate=True)
    @app.marshal_with(sample)
    @app.doc(description="updates a sample")
    def put(self, id):
        data = request.get_json()
        name = data["name"]
        user_details = get_jwt_identity()
        type = data["type"]
        color = data["color"]
        msid = data["msid"] if "msid" in data else ""
        comment = data["comment"] if "comment" in data else ""
        out = edit_sample(id, type, name, user_details["id"], comment, color, msid)
        return marshal(out.as_dict(), sample)

    @jwt_required()
    @app.doc(description="Deletes a method")
    @app.marshal_with(sample)
    def delete(self, id):
        user_details = get_jwt_identity()
        out = delete_sample(id, user_details["id"])
        return marshal(out, sample)


@app.route('')
class Sample(Resource):
    @app.marshal_with(sample)
    @jwt_required()
    @app.doc(description="creates a new sample")
    @app.expect(sample_update_create)
    def post(self):
        files = request.files.getlist("files")
        sid = request.form.get("sid")
        user_details = get_jwt_identity()
        out = create_sample(files, sid, user_details["id"])
        return marshal(out, sample)

    @app.doc(description="get all samples")
    @app.marshal_list_with(sample)
    @jwt_required()
    def get(self):
        filter = request.args.get("filter")
        range = request.args.get("range")
        sort = request.args.get("sort")
        filter = json.loads(filter) if filter else {"head": True}
        range = json.loads(range) if range else [0, 250]
        sort = json.loads(sort) if sort else ["id", "asc"]
        out, rows = get_sample_list(filter, sort, range)
        header = generate_header(rows)
        return out, 200, header


@app.route('/values')
class Sample_values(Resource):
    @app.doc(description="get the peak and tic values for the sample")
    @jwt_required()
    def get(self):
        kind = request.args.get("kind")
        id = request.args.get("id")
        out = {}

        if(kind == "tics"):
            out, _ = get_sample_tics(id)
        elif(kind == "peaks"):
            out = get_peaks(id)
        elif(kind == "all"):
            out = all_peak(id)
        elif (kind == "comptopeak"):
            out = assign_Peaks_to_component(id)
        elif (kind == "msdecon"):
            intervall = json.loads(request.args.get("intervall"))
            out = get_deconvolution_data(id, intervall)
        else:
            intervall = json.loads(request.args.get("intervall"))
            out, _ = get_sample_ms(id, intervall)
        return out

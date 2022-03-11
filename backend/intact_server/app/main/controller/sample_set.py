from app.main.util.utils import generate_header
from flask import json, request
from flask_jwt_extended.utils import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_restplus import Namespace, Resource
from flask_restplus.marshalling import marshal
# own libs
from app.main.service.sample_set import (
    delete_sampleSet,
    update_sampleSet,
    get_sampleSet,
    get_sampleSetList,
    create_sampleSet)
from app.main.util.dto import sampleSet_create_update, sample_set, sample, version


app = Namespace("sample_set", description="Controller for the sample sets")


@app.route('/<id>')
class Sample_id(Resource):
    @app.doc(description="get sample set by id")
    @app.marshal_with(sample_set)
    def get(self, id):
        out = get_sampleSet(id)
        return marshal(out, sample_set)

    @jwt_required()
    @app.doc(description="updates a sample set")
    @app.expect(sampleSet_create_update, validate=True)
    @app.marshal_with(sample_set)
    def put(self, id):
        user_details = get_jwt_identity()
        data = request.get_json()
        name = data["name"]
        system_name = data["system_name"]
        pid = data["pid"]
        descr = data["descr"] if "descr" in data else ""
        out = update_sampleSet(system_name, descr, name, user_details["id"], id, pid)
        return marshal(out.as_dict(), sample_set)

    @jwt_required()
    @app.doc(description="Deletes a method")
    @app.marshal_with(sample_set)
    def delete(self, id):
        user_details = get_jwt_identity()
        out = delete_sampleSet(id, user_details["id"])
        return marshal(out, sample_set)


@app.route('')
class Sample_list(Resource):
    @app.doc(description="get all sample sets",
             params={"range": '[start, end]',
                     "sort": '["field": "which field", "order": "order of the sort"]',
                     "filter": "filter over column"})
    @app.marshal_list_with(sample_set)
    def get(self):
        filter = request.args.get("filter")
        range = request.args.get("range")
        sort = request.args.get("sort")
        filter = json.loads(filter) if filter else {}
        range = json.loads(range) if range else [0, 250]
        sort = json.loads(sort) if sort else ["id", "asc"]
        out, count = get_sampleSetList(filter, sort, range)
        header = generate_header(count)
        return out, 200, header

    @app.marshal_with(sample_set)
    @app.expect(sampleSet_create_update, validate=True)
    @jwt_required()
    @app.doc(description="creates a new sample set")
    def post(self):
        user_details = get_jwt_identity()
        data = request.get_json()
        name = data["name"]
        system_name = data["system_name"]
        descr = data["descr"] if "descr" in data else ""
        pid = data["pid"]
        user_details = get_jwt_identity()
        out = create_sampleSet(system_name, descr, name, user_details["id"], pid)
        return marshal(out.as_dict(), sample_set)

# libs
import json
from app.main.util.utils import generate_header
from flask import request
from flask_jwt_extended.utils import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_restplus import Namespace, Resource
from flask_restplus.marshalling import marshal
# own libs
from app.main.service.project import (
    delete_project,
    get_project,
    get_project_list,
    edit_project,
    create_project)

from app.main.util.dto import project, project_update_create, sample_set


app = Namespace("project", description="Controller for projects")


@app.route('/<id>')
class Project_id(Resource):
    @app.marshal_with(project)
    @app.doc(description="get a singe project by id")
    def get(self, id):
        out = get_project(id)
        return marshal(out.as_dict(), project)

    @jwt_required()
    @app.expect(project_update_create, validate=True)
    @app.marshal_with(project)
    @app.doc(description="updates a new project")
    def put(self, id):
        data = request.get_json()
        name = data["name"]
        sop = data["sop"]
        desc = data["desc"]
        user_details = get_jwt_identity()
        out = edit_project(id, name, sop, desc, user_details["id"])
        return marshal(out.as_dict(), project)

    @jwt_required()
    @app.marshal_with(project)
    @app.doc(description="deletes a project")
    def delete(self, id):
        user_details = get_jwt_identity()
        out = delete_project(id, user_details["id"])
        return marshal(out, project)


@app.route('')
class Project_List(Resource):
    @app.doc(description="get all values from project",
             params={"range": '[start, end]',
                     "sort": '["field": "which field", "order": "order of the sort"]',
                     "filter": "filter over column"})
    @app.marshal_list_with(project)
    def get(self):
        filter = request.args.get("filter")
        range = request.args.get("range")
        sort = request.args.get("sort")
        filter = json.loads(filter) if filter else {}
        range = json.loads(range) if range else [0, 250]
        sort = json.loads(sort) if sort else ["id", "asc"]
        out, count = get_project_list(filter, sort, range)
        header = generate_header(count)
        return out, 200, header

    @app.marshal_with(project)
    @jwt_required()
    @app.doc(description="create a new project")
    @app.expect(project_update_create, validate=True)
    def post(self):
        data = request.get_json()
        name = data["name"]
        desc = data["desc"]
        sop = data["sop"]
        user_details = get_jwt_identity()
        out = create_project(name, sop, desc, user_details["id"])
        return marshal(out.as_dict(), project)

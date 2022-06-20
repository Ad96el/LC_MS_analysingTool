# -*- coding: utf-8 -*-
from http import HTTPStatus
from flask import abort, request
from flask_restplus import Namespace, Resource
from flask_restplus.marshalling import marshal
from werkzeug.datastructures import FileStorage
from flask_restplus import fields
from flask_jwt_extended import jwt_required
# own libs
from app.main.service.protein import calculate_protein_mass, validate
from app.main.util import messages
from app.main.util.dto import protein_validate, method


app = Namespace("protein", description="Controller for the protein routes")

upload_parser = app.parser()
upload_parser_params = app.parser()

upload_parser.add_argument('file', location='files',
                           type=FileStorage, required=True,  help=messages.HELP_FILE)

upload_parser_params.add_argument('file', location='files',
                                  type=FileStorage, required=True, help=messages.HELP_FILE)

upload_parser_params.add_argument('params', type=fields.List(fields.Raw), location="form", required=True,
                                  help=messages.HELP_PARAMS)


@app.route("/calculate")
class Protein(Resource):
    @app.expect(upload_parser_params)
    @jwt_required()
    def post(self):
        if "file" not in request.files:
            abort(400, description="file not added")
        file = request.files["file"]
        params = request.form["params"]
        filename = file.filename
        if filename == "" or ".fasta" not in filename:
            abort(400,  description=messages.ERROR_FILE)
        out = calculate_protein_mass(file, params)
        return out, HTTPStatus.OK


@app.route("/validate")
class Validate(Resource):
    @app.expect(upload_parser)
    @app.doc(description="mod and modSetId are empty")
    @app.marshal_with(protein_validate)
    @jwt_required()
    def post(self):
        if "file" not in request.files:
            abort(400, description=messages.ERROR_FILE)

        file = request.files["file"]
        if file.filename == "" or ".fasta" not in file.filename:
            abort(400, description=messages.ERROR_FILE)
        out = validate(file)
        return marshal(out, protein_validate)

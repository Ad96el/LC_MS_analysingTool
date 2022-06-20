from flask_restplus.marshalling import marshal
from flask_restplus import Namespace, Resource
from flask_jwt_extended import jwt_required
# own libs
from app.main.service.util import get_statistics, get_colors
from app.main.util.dto import statistics

app = Namespace("utils", description="Controller statistics and utility data")


@app.route('/statistics')
class User_login(Resource):
    @app.doc(description="get statistics of system", security=[])
    @app.marshal_with(statistics)
    @jwt_required()
    def get(self):
        out = get_statistics()
        return marshal(out, statistics)


@app.route('/color')
class User_login(Resource):
    @app.doc(description="get statistics of system", security=[])
    @jwt_required()
    def get(self):
        out = get_colors()
        return out

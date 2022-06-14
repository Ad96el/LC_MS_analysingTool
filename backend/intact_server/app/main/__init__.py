
from flask import Flask
from flask.helpers import url_for
from flask_jwt_extended import JWTManager
from flask_restplus import Api as ApiRaw
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
# own libs
from app.main.controller.sample_set import app as ss_app
from app.settings import app_config
from app.main.controller.method_set import app as ms_app
from app.main.controller.method import app as m_app
from app.main.controller.project import app as p_app
from app.main.controller.protein import app as pr_app
from app.main.controller.sample import app as s_app
from app.main.controller.user import app as u_app
from app.main.controller.utils import app as util_app
from app.main.controller.result import app as r_app
from app.main.controller.result_set import app as rs_app
from app.main.controller.modification import app as mo_app
from app.main.controller.modificationSet import app as mos_app
from app.main.util.dto import register_models
from app.main.model import db

authorizations = {
    'Bearer Auth': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization'
    },
}

# Bug in flask rest plus. Overwrite the specs url.
class API(ApiRaw):
    @property
    def specs_url(self):
        return url_for(self.endpoint('specs'), _external=False)


def create_app(configType: str):

    app = Flask(__name__)

    state = configType if type(configType) == str else "development"
    app.config.from_object(app_config[state])
    print(app_config[state], state )

    # add cors
    CORS(app, resources={r"/*": {"origins": "*"}})

    # create database
    db.init_app(app)
    with app.app_context():
        db.create_all()

    # setup proxy
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    # JWT
    JWTManager(app)

    api = API(title="Ibex Api Server",
              version="0.9",
              description="Documentation of the Ibex API server",
              authorizations=authorizations,
              security='Bearer Auth',
              doc="/api/v1")

    api = register_models(api)
    # register apps
    api.add_namespace(ms_app, path="/api/v1/methodset")
    api.add_namespace(u_app, path="/api/v1/user")
    api.add_namespace(m_app, path="/api/v1/method")
    api.add_namespace(p_app, path="/api/v1/project")
    api.add_namespace(pr_app, path="/api/v1/protein")
    api.add_namespace(s_app, path="/api/v1/sample")
    api.add_namespace(ss_app, path="/api/v1/sampleset")
    api.add_namespace(util_app, path="/api/v1/utils")
    api.add_namespace(r_app, path="/api/v1/result")
    api.add_namespace(rs_app, path="/api/v1/resultset")
    api.add_namespace(mo_app,  path="/api/v1/modification")
    api.add_namespace(mos_app, path="/api/v1/modificationset")
    api.init_app(app)

    return app

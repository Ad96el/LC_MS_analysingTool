import pytest
from app.main.model import User, Method, MethodSet, Sample, SampleSet, Project
from app.main import create_app, db
import uuid


@pytest.fixture(scope='module')
def new_user():
    user = User("test@gmail.com", "hello")
    user.role = 2
    return user


@pytest.fixture(scope='module')
def new_method():
    method = Method("type1", "method1", None, uuid.uuid4())
    return method


@pytest.fixture(scope='module')
def new_methodSet():
    method_s = MethodSet("name", None, uuid.uuid4())
    return method_s


@pytest.fixture(scope='module')
def new_sample():
    sample = Sample("sampletype", "samplename", None, uuid.uuid4(), "")
    return sample


@pytest.fixture(scope='module')
def new_sampleSet():
    sampleSet = SampleSet("name", None, "system_name", uuid.uuid4())
    return sampleSet


@pytest.fixture(scope='module')
def new_project():
    project = Project("sop1", "name1", None, descr="")
    return project


@pytest.fixture(scope='module')
def client(new_user, new_method, new_methodSet, new_sample, new_sampleSet, new_project):
    app = create_app("testing")
    app.app_context().push()
    db.session.add(new_user)
    db.session.add(new_method)
    db.session.add(new_methodSet)
    db.session.add(new_project)
    db.session.add(new_sample)
    db.session.add(new_sampleSet)
    db.session.commit()
    app.app_context().push()

    client = app.test_client()
    yield client
    db.session.close()
    db.drop_all()

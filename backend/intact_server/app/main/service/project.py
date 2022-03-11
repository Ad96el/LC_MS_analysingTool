
from http import HTTPStatus
from typing import Dict, List


from app.main.service.user import get_user
from flask import abort
from app.main.model import Project, db

# own libs
from app.main.util.utils import check_permissions, dataBaseDelete, dataBaseSave, dataBaseUpdate, pagination, validate_uuid4
from app.main.util import messages


def get_project(id: str) -> Project:
    validate_uuid4(id)
    project = Project.query.filter_by(id=id).first()
    if(not project):
        abort(HTTPStatus.NOT_FOUND, description=messages.ERROR_NOT_EXIT + id)
    return project


def get_project_list(filter: Dict[str, str], sort: List[str], range: List[int]):
    query = db.session.query(Project)
    rows = query.count()
    projects = pagination(sort, filter, range, Project, query)
    out = []
    for project in projects:
        out.append(project.as_dict())
    return out, rows


def create_project(name: str, sop: str, desc: str, uid: str) -> Project:
    user = get_user(uid)
    check_permissions(user.role, messages.ADMIN_PERMISSION)
    project = Project(sop, name, user, descr=desc)
    dataBaseSave(project)
    return project


def edit_project(pid: str, name: str, sop: str, desc: str,  uid: str) -> Project:
    user = get_user(uid)

    check_permissions(user.role, messages.ADMIN_PERMISSION)

    project = get_project(pid)
    project.sop = sop
    project.descr = desc
    project.name = name
    dataBaseUpdate()
    return project


def delete_project(pid: str, uid: str):
    user = get_user(uid)

    check_permissions(user.role, messages.ADMIN_PERMISSION)
    project = get_project(pid)
    out = project.as_dict()

    dataBaseDelete(project)
    return out

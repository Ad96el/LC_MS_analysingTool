
from app.main.service.project import get_project
from app.main.model import SampleSet, db
from flask import abort
from typing import Dict, List
from http import HTTPStatus
# own libs
from app.main.util.utils import check_permissions, dataBaseDelete, dataBaseSave, dataBaseUpdate, pagination, validate_uuid4
from .user import get_user
from app.main.util import messages


def get_sampleSet(sid: str) -> SampleSet:
    validate_uuid4(sid)
    sampleSet = SampleSet.query.filter_by(id=sid).first()
    if(not sampleSet):
        abort(HTTPStatus.NOT_FOUND, description=messages.ERROR_NOT_EXIT + sid)
    return sampleSet


def get_sampleSetList(filter: Dict[str, str], sort: List[str], range: List[int]) -> List[SampleSet]:
    query = db.session.query(SampleSet)
    samplesets = pagination(sort, filter, range, SampleSet, query)
    rows = query.count()
    out = []
    for sampleset in samplesets:
        out.append(sampleset.as_dict())
    return out, rows


def create_sampleSet(system_name: str, descr: str, name: str, uid: str, pid: str) -> SampleSet:
    user = get_user(uid)
    project = get_project(pid)
    check_permissions(user.role, messages.GUEST_PERMISSION)
    sampleSet = SampleSet(name, user, system_name, project, descr=descr)
    dataBaseSave(sampleSet)
    return sampleSet


def update_sampleSet(
        system_name: str, descr: str, name: str, uid: str,
        sid: str, pid: str) -> SampleSet:

    user = get_user(uid)
    check_permissions(user.role, messages.USER_PERMISSION)
    sampleset = get_sampleSet(sid)
    project = get_project(pid) if pid != "" else None

    sampleset.name = name
    sampleset.system_name = system_name
    sampleset.descr = descr
    sampleset.project = project
    dataBaseUpdate()
    return sampleset


def delete_sampleSet(sid: str, uid: str):
    user = get_user(uid)
    check_permissions(user.role, messages.ADMIN_PERMISSION)
    # get data
    sampleset_delete = get_sampleSet(sid)
    out = sampleset_delete.as_dict()

    # delete the samples as well
    dataBaseDelete(sampleset_delete.samples)
    dataBaseDelete(sampleset_delete)

    return out

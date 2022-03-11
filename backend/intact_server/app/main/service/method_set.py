
from flask import abort
from app.main.model import MethodSet, db
from typing import Dict, List
from http import HTTPStatus
# own libs
from app.main.util.utils import check_permissions, dataBaseDelete, dataBaseSave, pagination, updateVersion, validate_uuid4, create_uuid4, checkVersion
from .method import get_method
from .user import get_user
from app.main.util import messages


def get_methodset_vid(vid) -> List[MethodSet]:
    validate_uuid4(vid)
    methodSets = MethodSet.query.filter_by(vid=vid).all()
    if(not methodSets):
        abort(HTTPStatus.NOT_FOUND, description=messages.ERROR_NOT_EXIT + vid)
    return methodSets


def get_methodset(id: str) -> MethodSet:
    validate_uuid4(id)
    methodSet = MethodSet.query.filter_by(id=id).first()
    if(not methodSet):
        abort(HTTPStatus.NOT_FOUND, description=messages.ERROR_NOT_EXIT)
    return methodSet


def get_methodset_list(filter: Dict[str, str],  range: List[int], sort: List[str],):
    query = db.session.query(MethodSet)
    rows = query.filter_by(head=True).count()
    method_sets = pagination(sort, filter, range, MethodSet, query)
    out = []
    for methodset in method_sets:
        out.append(methodset.as_dict())
    return out, rows


def create_method_set(name: str, methods: List[str], uid:  str):
    user = get_user(uid)
    check_permissions(user.role, messages.USER_PERMISSION)
    vid = create_uuid4()
    new_methodSet = MethodSet(name, user, vid)
    method_list = []
    for mid in methods:
        method_list.append(get_method(mid))
    new_methodSet.methods = method_list

    dataBaseSave(new_methodSet)
    return new_methodSet


def edit_method_set(method_set_id: str, name: str, methods: List[str], uid: str, comment: str):
    user = get_user(uid)
    check_permissions(user.role, messages.USER_PERMISSION)

    methodSet = get_methodset(method_set_id)
    new_methodSet = MethodSet(name, user, methodSet.vid)

    # only allow newest method to be updated
    checkVersion(methodSet.head)
    # remove old methods and add new
    method_list = []
    for method_id in methods:
        method_list.append(get_method(method_id))

    new_methodSet.methods = method_list

    # update samples
    new_methodSet.samples = methodSet.samples

    # update version
    new_methodSet.comment = comment
    methodSet.head = False
    new_methodSet.version = updateVersion(methodSet.version)
    new_methodSet.parent = methodSet.id

    # save cahnges
    dataBaseSave(new_methodSet)
    return new_methodSet


def remove_method_set(method_set_id: str, uid: str):
    user = get_user(uid)
    check_permissions(user.role, messages.ADMIN_PERMISSION)
    methodSet_delete = get_methodset(method_set_id)
    out = methodSet_delete.as_dict()
    # delete all versions of the methodset
    methodSets = get_methodset_vid(methodSet_delete.vid)
    for methodSet in methodSets:
        dataBaseDelete(methodSet)
    return out


def get_methodset_by_vid(mid: str):
    validate_uuid4(mid)
    methodset = get_methodset(mid)
    methods = get_methodset_vid(methodset.vid)

    out = []
    for method in methods:
        out.append(method.as_dict())
    return out

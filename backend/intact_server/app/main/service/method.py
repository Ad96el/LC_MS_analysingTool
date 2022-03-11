from flask import abort
from typing import List, Dict
from http import HTTPStatus
import json
# own libs
from app.main.util.utils import checkVersion, check_permissions, dataBaseDelete, dataBaseSave, pagination, updateVersion, validate_uuid4, create_uuid4
from app.main.util import messages
from app.main.service.user import get_user
from app.main.model import Method, MethodSet, db


def get_method_vid(vid: str) -> List[Method]:
    validate_uuid4(vid)

    methods = Method.query.filter_by(vid=vid).all()
    if(not methods):
        abort(HTTPStatus.NOT_FOUND, description=messages.ERROR_NOT_EXIT + vid)
    return methods


def get_method(mid: str) -> Method:
    validate_uuid4(mid)

    method = Method.query.filter_by(id=mid).first()
    if(not method):
        abort(HTTPStatus.NOT_FOUND, description=messages.ERROR_NOT_EXIT)

    return method


def get_method_list(filter: Dict[str, str], sort: List[str], range: List[int]) -> List[Method]:
    query = db.session.query(Method)
    rows = query.filter_by(head=True).count()

    # very ugly... trying to catch react admin bug. investigate again TODO
    if("id" in filter and type(filter["id"]) is list and "name" in filter["id"][0] and "id" in filter["id"][0]):
        filter = out = {"id": [x["id"] for x in filter["id"]]}

    methods = pagination(sort, filter, range, Method, query)
    out = []
    for method in methods:
        out.append(method)
    return out, rows


def edit_method(mid: str, name: str, method_props, uid: str, comment: str) -> Method:

    user = get_user(uid)
    check_permissions(user.role, messages.USER_PERMISSION)

    method = get_method(mid)
    checkVersion(method.head)

    components = json.dumps(method_props["components"]) if "components" in method_props else ""
    calculation = json.dumps(method_props["calculations"]) if "calculations" in method_props else ""
    new_method = Method(method.type, name, user, method.vid, components, calculation)

    new_method.methodSet = method.methodSet
    method.methodSet = []

    # update version
    method.head = False
    new_method.head = True
    new_method.version = updateVersion(method.version)
    new_method.comment = comment

    # save changes
    dataBaseSave(new_method)
    return new_method


def create_method(name: str, type: str, method_props, uid: str):
    user = get_user(uid)

    check_permissions(user.role, messages.USER_PERMISSION)

    vid = create_uuid4()
    components = json.dumps(method_props["components"]) if "components" in method_props else ""
    calculation = json.dumps(method_props["calculations"]) if "calculations" in method_props else ""
    method = Method(type, name, user, vid, components, calculation)
    dataBaseSave(method)
    return method


# delete all methods and their versions
def delete_method(mid: str, uid: str):

    user = get_user(uid)
    method_delete = get_method(mid)
    out = method_delete.as_dict()
    check_permissions(user.role, messages.ADMIN_PERMISSION)

    methods = get_methodset_vid(method_delete.vid)
    for method in methods:
        dataBaseDelete(method)
    return out


def get_methodset_vid(vid) -> List[Method]:
    """
    get all the methodset with the same version id.
    """
    validate_uuid4(vid)
    methods = Method.query.filter_by(vid=vid).all()
    if(not methods):
        abort(HTTPStatus.NOT_FOUND, description=messages.ERROR_NOT_EXIT + vid)
    return methods


def get_method_by_vid(mid: str):
    validate_uuid4(mid)
    method = get_method(mid)
    methods = get_methodset_vid(method.vid)
    out = []
    for method in methods:
        out.append(method.as_dict())
    return out


def get_method_by_msid(id: str):
    validate_uuid4(id)
    methodset = MethodSet.query.filter_by(id=id).first()
    if(not methodset):
        abort(400, description="methodset does not exits")
    methods = methodset.methods
    out = []
    for method in methods:
        out.append(method.as_dict())
    return out

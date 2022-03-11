from flask import abort
from typing import List, Dict
from http import HTTPStatus
# own libs
from app.main.service.modification import get_modification
from app.main.util.utils import check_permissions, dataBaseDelete, dataBaseSave, dataBaseUpdate, pagination,   validate_uuid4
from app.main.util import messages
from app.main.service.user import get_user
from app.main.model import ModificationSet, db


def get_modification_set(mid: str) -> ModificationSet:
    validate_uuid4(mid)

    modification_set = ModificationSet.query.filter_by(id=mid).first()
    if(not modification_set):
        abort(HTTPStatus.NOT_FOUND, description=messages.ERROR_NOT_EXIT)

    return modification_set


def get_modification_set_list(filter: Dict[str, str], sort: List[str], range: List[int]) -> List[ModificationSet]:
    query = db.session.query(ModificationSet)
    rows = query.count()

    modification_sets = pagination(sort, filter, range, ModificationSet, query)
    out = []
    for modification_set in modification_sets:
        out.append(modification_set)
    return out, rows


def edit_modification_set(id: str, name: str, modification_ids: List[str], uid: str) -> ModificationSet:

    user = get_user(uid)
    check_permissions(user.role, messages.USER_PERMISSION)

    modification_set = get_modification_set(id)
    modification_set.name = name
    modifications = []
    for modification_id in modification_ids:
        modification = get_modification(modification_id)
        modifications.append(modification)

    modification_set.modifications = modifications

    dataBaseUpdate()
    return modification_set


def create_modification_set(name: str, modification_ids: List[str], uid) -> ModificationSet:
    user = get_user(uid)
    check_permissions(user.role, messages.USER_PERMISSION)

    modifications = []

    for modification_id in modification_ids:
        modification = get_modification(modification_id)
        modifications.append(modification)

    modification_set = ModificationSet(name, modifications)
    dataBaseSave(modification_set)
    return modification_set


def delete_modification_set(mid: str, uid: str):
    user = get_user(uid)
    modification_set_delete = get_modification_set(mid)
    out = modification_set_delete.as_dict()

    check_permissions(user.role, messages.ADMIN_PERMISSION)
    dataBaseDelete(modification_set_delete)
    return out

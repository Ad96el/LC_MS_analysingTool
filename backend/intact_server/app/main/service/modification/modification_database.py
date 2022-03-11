from flask import abort
from typing import List, Dict
from http import HTTPStatus
# own libs
from app.main.util.utils import check_permissions, dataBaseDelete, dataBaseSave, dataBaseUpdate, pagination,   validate_uuid4
from app.main.util import messages
from app.main.service.user import get_user
from app.main.model import Modification, db
from app.main.service.modification.calculation import calculateMass


def get_modification(mid: str) -> Modification:
    validate_uuid4(mid)

    modification = Modification.query.filter_by(id=mid).first()
    if(not modification):
        abort(HTTPStatus.NOT_FOUND, description=messages.ERROR_NOT_EXIT)

    return modification


def get_modification_list(filter: Dict[str, str], sort: List[str], range: List[int]) -> List[Modification]:
    query = db.session.query(Modification)
    rows = query.count()

    modifications = pagination(sort, filter, range, Modification, query)
    out = []
    for modification in modifications:
        out.append(modification)
    return out, rows


def edit_modification(id: str, name: str, formula_add: str, formula_sub: str, kind: str, uid: str) -> Modification:

    user = get_user(uid)
    check_permissions(user.role, messages.USER_PERMISSION)
    mass = calculateMass(formula_add, formula_sub)

    modification = get_modification(id)
    modification.formula_add = formula_add
    modification.formula_sub = formula_sub
    modification.mass = mass
    modification.name = name
    modification.kind = kind
    dataBaseUpdate()
    return modification


def create_modification(name: str, formula_add: str, formula_sub: str, kind: str, uid: str) -> Modification:
    user = get_user(uid)

    check_permissions(user.role, messages.USER_PERMISSION)

    mass = calculateMass(formula_add, formula_sub)

    modification = Modification(formula_add, formula_sub, mass, name, kind)
    dataBaseSave(modification)
    return modification


def delete_modification(mid: str, uid: str):
    user = get_user(uid)
    modification_delete = get_modification(mid)

    check_permissions(user.role, messages.ADMIN_PERMISSION)
    dataBaseDelete(modification_delete)

    return modification_delete

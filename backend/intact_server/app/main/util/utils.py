from uuid import UUID
import uuid
from sqlalchemy import desc, asc
from flask import abort
from http import HTTPStatus
import datetime

from sqlalchemy.sql.expression import extract
# own libs
from . import messages
from app.main.model import db


def validate_uuid4(uuid_string):
    try:
        UUID(str(uuid_string), version=4)
    except ValueError:
        abort(HTTPStatus.BAD_REQUEST, messages.ERROR_WRONG_UUID)


def check_permissions(permission, required_permission):
    if(permission < required_permission):
        abort(HTTPStatus.BAD_REQUEST, description=messages.ERROR_NO_PERMISSONS)


def create_uuid4():
    return uuid.uuid4()


def updateVersion(version):
    return version + 1


def generate_header(count):
    return {
        'Access-Control-Expose-Headers': 'Content-Range', 'Content-Range': 'bytes : 0-9/' + str(count)}


def pagination(sort, filter, range, model, query):
    """
    Function for paging. 
    @sort: defines which column should be sorted 
    @filter: filters out objects which are not matching 
    @range: 
    """
    # sort
    value, kind = sort[0], sort[1]
    sort_function = asc if kind == "ASC" else desc
    query = query.order_by(sort_function(getattr(model, value)))

    # filters default head true if not set false.
    if(hasattr(model, "head")):
        filter["head"] = True if "head" not in filter else filter["head"]

    for attr, value in filter.items():
        if(not hasattr(model, attr)):
            abort(HTTPStatus.BAD_REQUEST, description=messages.ERROR_ATTR)
        if attr == "head":
            query = query.filter_by(head=value)
        elif attr == "id" and type(value) is list:
            query = query.filter(model.id.in_(value))
        elif "id" in attr and type(value) is str:
            query = query.filter(getattr(model, attr) == value)
        elif "created" == attr:
            parts = value.split("-")
            date = datetime.datetime(int(parts[0]), int(parts[1]), int(parts[2]))
            query = query.filter(extract("month", getattr(model, attr)) == date.month,
                                 extract('year', getattr(model, attr)) == date.year,
                                 extract('day', getattr(model, attr)) == date.day)
        else:
            query = query.filter((getattr(model, attr).like("%%%s%%" % value)))
    start, end = range[0], range[1]
    out = query.all()[start:end+1]
    return out


def checkVersion(head: bool):
    if(not head):
        abort(400, description=messages.ERROR_VERSION)


def dataBaseSave(obj):
    if isinstance(obj, list):
        db.session.add_all(obj)
    else:
        db.session.add(obj)
    dataBaseUpdate()


def dataBaseDelete(obj):
    try:
        if isinstance(obj, list):
            for o in obj:
                db.session.delete(o)
        else:
            db.session.delete(obj)
        dataBaseUpdate()
    except:
        abort(400, description=messages.ERROR_UPDATE)


def dataBaseUpdate():
    db.session.commit()

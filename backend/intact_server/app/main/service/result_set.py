
import json
from http import HTTPStatus
from typing import Dict, List
from flask import abort
# own libs
from app.main.model import ResultSet, db
from app.main.service.user import get_user
from app.main.util import messages
from app.main.util.utils import checkVersion, check_permissions, create_uuid4, dataBaseDelete, dataBaseSave, dataBaseUpdate, pagination, updateVersion, validate_uuid4
from app.main.model.sampleSet import SampleSet
from app.main.service.sample import all_peak, get_deconvolution_data
from app.main.service.sample_set import get_sampleSet
from app.main.service.results import create_result, delete_result, edit_result


def get_result_set(rid: str) -> ResultSet:
    """
    get a specific result Set
    """
    validate_uuid4(rid)
    result = ResultSet.query.filter_by(id=rid).first()
    if(not result):
        abort(HTTPStatus.NOT_FOUND, description=messages.ERROR_NOT_EXIT + rid)
    return result


def get_result_set_list(filter: Dict[str, str], sort: List[str], range: List[int]) -> List[ResultSet]:
    """
    get all results sets
    """
    query = db.session.query(ResultSet)
    results = pagination(sort, filter, range, ResultSet, query)
    rows = query.filter_by(head=True).count()
    out = []
    for sample in results:
        out.append(sample.as_dict())
    return out, rows


def edit_result_set(sampleSet: SampleSet, uid: str):
    old_result_set = sampleSet.result_set
    checkVersion(old_result_set.head)

    samples = [x for x in sampleSet.samples if x.mid]

    updatedResults = []

    user = get_user(uid)
    for sample in samples:
        data = all_peak(str(sample.id), sample)
        deconvolutionDatas = []
        for peak in data["peaks"]["data"]:
            deconvolutionData = get_deconvolution_data(str(sample.id), [peak["start"], peak["end"]])
            deconvolutionDatas.append(deconvolutionData)
        results = [result for result in sample.results if result.head]
        # A Sample already have a result -> update it
        if(len(results) > 0):
            result = results[0]
            ed_result = edit_result(
                str(result.id),
                json.dumps(data["peaks"]["data"]),
                json.dumps(deconvolutionDatas),
                uid, str(sample.mid),
                str(sample.id),
                single=False)
            updatedResults.append(ed_result)

        # A Sample has no result -> create one
        else:
            result = create_result(data["peaks"]["data"], data["tics"], uid, str(sample.id), single=True)
            if(result):
                updatedResults.append(result)
    dataBaseSave(updatedResults)
    new_result_set = ResultSet(old_result_set.name, user, old_result_set.vid, sampleSet, updatedResults)
    new_result_set.version = updateVersion(old_result_set.version)
    old_result_set.head = False
    dataBaseSave(new_result_set)
    return new_result_set


def create_result_Set(sid: str, uid: str, kind: str) -> ResultSet:
    """
    creates a new result set. 
    If Kind is all, for every sample in the sampleset a result is created

    if there is a result set -> update it
    if there is no result set -> create it
    """

    user = get_user(uid)
    check_permissions(user.role, messages.USER_PERMISSION)

    sampleSet = get_sampleSet(sid)

    if(sampleSet.result_set):
        resultSet = edit_result_set(sampleSet, uid)
    else:
        samples = sampleSet.samples
        results = []
        if(kind == "all"):
            for sample in samples:
                if(sample.mid):
                    data = all_peak(str(sample.id), sample)
                    result = create_result(data["peaks"]["data"], data["tics"], uid,  str(sample.id), single=True)
                    results.append(result)

        resultSet = ResultSet(sampleSet.name + "_result", user, create_uuid4(), sampleSet, results)
        dataBaseSave(resultSet)

    return resultSet


def get_result_set_by_vid(rid: str):
    validate_uuid4(rid)
    result_set = get_result_set(rid)
    results_sets = ResultSet.query.filter_by(vid=str(result_set.vid)).all()
    out = []
    for result_set in results_sets:
        out.append(result_set.as_dict())
    return out


def delete_result_set(id: str, uid: str):
    user = get_user(uid)
    check_permissions(user.role, messages.ADMIN_PERMISSION)
    resultSet = get_result_set(id)
    out = resultSet.as_dict()
    result = [result for result in resultSet.results if result.head]
    if(len(result) > 0):
        delete_result(str(result[0].id), uid)

    to_delete_result_sets = get_result_set_by_vid(str(resultSet.id))

    # delete all result sets
    for to_delete in to_delete_result_sets:
        delete = get_result_set(to_delete["id"])
        dataBaseDelete(delete)
    return out

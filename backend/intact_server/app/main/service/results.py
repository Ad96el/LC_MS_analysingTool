from app.main.model.result_set import ResultSet
from http import HTTPStatus
from typing import Dict, List
from flask import abort
import json
# own libs
from app.main.model import Results, db
from app.main.service.method_set import get_methodset
from app.main.service.sample import get_deconvolution_data, get_sample
from app.main.service.user import get_user
from app.main.util import messages
from app.main.util.utils import checkVersion, check_permissions, create_uuid4, dataBaseDelete, dataBaseSave, dataBaseUpdate, pagination, updateVersion, validate_uuid4
from app.main.util.pdf import PDF

def get_result(rid: str) -> Results:
    """
    get one specific result by their id
    """
    validate_uuid4(rid)
    result = Results.query.filter_by(id=rid).first()
    if(not result):
        abort(HTTPStatus.NOT_FOUND, description=messages.ERROR_NOT_EXIT + rid)
    return result


def get_result_list(filter: Dict[str, str], sort: List[str], range: List[int]) -> List[Results]:
    """
    get all results.
    """
    query = db.session.query(Results)
    results = pagination(sort, filter, range, Results, query)
    rows = query.filter_by(head=True).count()
    out = []
    for sample in results:
        out.append(sample.as_dict())
    return out, rows


def edit_result(id: str, peaks: str, deconvolution: str, uid: str, msid: str, sid: str, single=True, comment="") -> Results:
    """
    Edit a result
    """
    user = get_user(uid)
    check_permissions(user.role, messages.USER_PERMISSION)
    old_result = get_result(id)
    checkVersion(old_result.head)

    methodSet = get_methodset(msid) if msid != "" else None
    sample = get_sample(sid) if sid != "" else None

    if(not methodSet or not sample):
        abort(400, description="Sample or or methodset does not exist")

    new_result = Results(create_uuid4(), old_result.name, user, peaks, deconvolution,
                         old_result.tics, sample, methodSet, old_result.vid)

    if(single):
        new_result.result_set = old_result.result_set
    old_result.head = False
    new_result.version = updateVersion(old_result.version)
    dataBaseSave(new_result)
    return new_result


def create_result(peaks: dict, tics: dict, uid: str,  sid: str, single=False) -> Results:
    """
    creates a new rseult. There are 4 cases. 
    1. the sample has already a result -> update it 
    2. there is already a reusult set but the sample has no result -> create a new result
    3. we want to create the result set later -> first create a result 
    4. there is no result set and no result -> create booth 
    """

    user = get_user(uid)
    check_permissions(user.role, messages.USER_PERMISSION)
    sample = get_sample(sid)
    msid = str(sample.mid)
    sampleSet = sample.sampleSets

    deconvolutionDatas = []
    peakData = peaks["data"] if "data" in peaks else peaks
    for peak in peakData:
        deconvolutionData = get_deconvolution_data(sid, [peak["start"], peak["end"]])
        deconvolutionDatas.append(deconvolutionData)

    if(len(sample.results) > 0):
        """
        There are alreay results for the sample. Update the head.
        """
        result_head = [res for res in sample.results if res.head][0]
        result = edit_result(
            str(result_head.id),
            json.dumps(peaks),
            json.dumps(deconvolutionDatas),
            uid, msid, str(sample.id))
    elif(sampleSet.result_set):
        """
        There is already a result set and we create a new result.
        """
        result_set = sampleSet.result_set
        methodSet = get_methodset(msid)
        name = sample.name + "_result"

        result = Results(
            create_uuid4(),
            name,
            user,
            json.dumps(peaks),
            json.dumps(deconvolutionDatas),
            json.dumps(tics),
            sample,
            methodSet,
            create_uuid4())

        dataBaseSave(result)
        results = result_set.results
        results.append(result)
        dataBaseUpdate()
    elif(single):
        """
        create a single result
        """
        methodSet = get_methodset(msid)
        name = sample.name + "_result"
        result = Results(
            create_uuid4(),
            name,
            user,
            json.dumps(peaks),
            json.dumps(deconvolutionDatas),
            json.dumps(tics),
            sample,
            methodSet,
            create_uuid4())
    else:
        """
        create a single result with corresponding result set. 
        """
        methodSet = get_methodset(msid)
        name = sample.name + "_result"
        result = Results(
            create_uuid4(),
            name,
            user,
            json.dumps(peaks),
            json.dumps(deconvolutionDatas),
            json.dumps(tics),
            sample,
            methodSet,
            create_uuid4())

        dataBaseSave(result)
        resultSet = ResultSet(sampleSet.name + "_result", user, create_uuid4(), sampleSet, [result])
        dataBaseSave(resultSet)
    return result


def get_result_by_vid(rid: str):
    validate_uuid4(rid)
    result = get_result(rid)
    results = Results.query.filter_by(vid=str(result.vid)).all()
    out = []
    for result in results:
        out.append(result.as_dict())
    return out


def delete_result(id: str, uid: str) -> Results:
    user = get_user(uid)
    check_permissions(user.role, messages.ADMIN_PERMISSION)
    result = get_result(id)
    out = result.as_dict()
    version_results = get_result_by_vid(str(result.id))
    for res in version_results:
        toDelete = get_result(res["id"])
        dataBaseDelete(toDelete)
    return out


def createResultPdf(id: str): 
    result = get_result(id)
    out = result.as_dict()
    peaks = json.loads(out["peaks"])
    tics = json.loads(out["tics"])
    deconData = json.loads(out["deconData"])
    pdfCreator = PDF()
    pdfCreator.createLayout()
    data = {
        "name" : out["name"].split(".")[0],
        "created": out["created"].strftime("%d.%m.%y"),
        "version": str(out["version"]),
        "creator": out["user"]["email"] 
        }
    pdfCreator.addHeader(data)
    pdfCreator.addLC(tics, peaks)
    for msPeak in deconData:
        pdfCreator.addMS(tics, peaks, index)
    pdfCreator.save(str(out["id"]))
 
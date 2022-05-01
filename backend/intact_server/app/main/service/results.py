from app.main.model.result_set import ResultSet
from http import HTTPStatus
from typing import Dict, List
from flask import abort
import json
import os
import itertools
import base64
from scipy.signal import find_peaks
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
    if(os.path.exists(os.getcwd()+"/static/pdf/" + id + ".pdf")):
        with open(os.getcwd()+"/static/pdf/" + id + ".pdf", "rb") as pdfFile:
            encodedString = base64.b64encode(pdfFile.read())
        return encodedString
    result = get_result(id)
    out = result.as_dict()
    peaks = json.loads(out["peaks"])
    tics = json.loads(out["tics"])
    deconData = json.loads(out["deconData"])
    pdfCreator = PDF()
    pdfCreator.createLayout()
    data = {
        "name": out["name"].split(".")[0],
        "created": out["created"].strftime("%d.%m.%y"),
        "version": str(out["version"]),
        "creator": out["user"]["email"]
    }
    pdfCreator.addHeader(data)
    pdfCreator.addLC(tics, peaks)
    for index, msPeak in enumerate(deconData):
        if(index > 5):
            break
        pdfCreator.addMS(msPeak["raw"], msPeak["decon"], msPeak["peaks"], index)
    pdfCreator.save(str(out["id"]))
    with open(os.getcwd()+"/static/pdf/" + id + ".pdf", "rb") as pdfFile:
        encodedString = base64.b64encode(pdfFile.read())
    return encodedString


def identify_species(data: dict):
    error_msgs = []
    aligned_heavy_chain_species = []
    aligned_light_chain_species = []
    decon_data = json.loads(data["deconData"])
    if(len(decon_data) != 2):
        error_msgs.append(
            f"ERROR identify species: Found to many species. Expected two got {len(decon_data)}. Selected the first two. Please check th LC")
    first_peak, second_peak = decon_data[0], decon_data[1]

    if(len(first_peak["peaks"]) > 1 or len(second_peak["peaks"]) > 1):
        error_msgs.append(f"""ERROR deconvoluted peak species: Found to many species for the LC or HC. 
        Expected two. found for HC: {len(second_peak["peaks"])} and for LC: {len(second_peak["peaks"])} 
            Selected those with the highest intensity.""")
    first_peak_index = next((i for i, e in enumerate(first_peak["peaks"]) if e["peakIntensity"] == 100))
    second_peak_index = next((i for i, e in enumerate(second_peak["peaks"]) if e["peakIntensity"] == 100))

    if (first_peak["peaks"][first_peak_index]["peakMass"] > second_peak["peaks"][second_peak_index]["peakMass"]):
        heavy_chain = first_peak
        light_chain = second_peak
    else:
        heavy_chain = second_peak
        light_chain = first_peak

    heavy_chain_intensity = [x["y"] for x in heavy_chain["decon"]]
    light_chain_intensity = [x["y"] for x in light_chain["decon"]]
    heavy_chain_species, _ = find_peaks(heavy_chain_intensity, height=2.0)
    light_chain_species, _ = find_peaks(light_chain_intensity, height=2.0)

    heavy_main_peak = {"x": heavy_chain["peaks"][0]["peakMass"], "y": 100}
    light_main_peak = {"x": light_chain["peaks"][0]["peakMass"], "y": 100}

    for specie in heavy_chain_species:
        point = heavy_chain["decon"][specie]
        if (abs(point["x"] - heavy_main_peak["x"]) > 1000):
            continue
        aligned_heavy_chain_species.append(heavy_chain["decon"][specie])

    for specie in light_chain_species:
        point = light_chain["decon"][specie]
        if (abs(point["x"] - light_main_peak["x"]) > 1000):
            continue
        aligned_light_chain_species.append(light_chain["decon"][specie])

    return {"heavyChainSpecies": aligned_heavy_chain_species, "lightChainSpecies": aligned_light_chain_species}, error_msgs


def identify_sugars(species, signal):
    decon_data = json.loads(signal["deconData"])
    heavy_chain = decon_data[0] if len(decon_data[0]["peaks"]) > 1 else decon_data[1]
    raw_signal = [z["y"] for z in heavy_chain["decon"]]
    sugar_peaks, _ = find_peaks(raw_signal, height=0.5)
    sugar_weights = []
    for peak in sugar_peaks:
        sugar_weights.append(heavy_chain["decon"][peak])

    distance = {}
    for specie in species:
        distance[str(specie["x"])] = []
        for sugar in sugar_weights:
            distance[str(specie["x"])].append(abs(sugar["x"] - specie["x"]))

    with open(os.getcwd()+"/static/json/glycan.json", "rb") as json_glycan:
        glycan_data = json.load(json_glycan)

    sugar_candidates = []
    for specie in distance.keys():
        for distance_value in distance[specie]:
            for glycan in glycan_data:
                if (glycan["mass"] == distance_value):
                    sugar_candidates.append(glycan)
    return sugar_candidates


# def get_modification_candidates(specie):
#     decon_data = json.loads(specie["deconData"])
#     first_peak, second_peak = decon_data[0], decon_data[1]
#     if(len(first_peak["peaks"]) > 1 or len(second_peak["peaks"]) > 1):
#         return
#     if (first_peak["peaks"][0]["peakMass"] > second_peak["peaks"][0]["peakMass"]):
#         heavy_chain = first_peak["peaks"][0]
#         light_chain = second_peak["peaks"][0]
#     else:
#         heavy_chain = second_peak["peaks"][0]
#         light_chain = first_peak["peaks"][0]

#     light_chain_mod = []
#     heavy_chain_mod = []

#     with open(os.getcwd()+"/static/json/mod.json", "rb") as json_mod:
#         mod_data = json.load(json_mod)
#     for mod in mod_data:
#         if(mod["mass"] == light_chain["error"]):
#             light_chain_mod.append(mod)
#         if(mod["mass"] == heavy_chain["error"]):
#             heavy_chain_mod.append(mod)

#     return {"heavyChainMod": heavy_chain_mod, "lightChainMod": light_chain_mod}


def get_difference_molecule_D(molecule):
    decon_data = json.loads(molecule["deconData"])
    error_msgs = []
    if(len(decon_data) > 1):
        error_msgs.append(
            f"""ERROR to many peaks in D: Expected to have one peak. Found {len(decon_data)}. Check the LC of D. Selected the first one.""")
    first_peak = decon_data[0]
    if(len(first_peak["peaks"]) > 1):
        error_msgs.append(
            f"""ERROR to many Species in D: Expected to have one peak. Found {len(first_peak["peaks"])}. 
            Check the deconvolution of the first LC peak of D. 
            Further calculation are based on the peak with the highest intensity.""")
    first_peak_index = next((i for i, e in enumerate(first_peak["peaks"]) if e["peakIntensity"] == 100))
    return first_peak["peaks"][first_peak_index]["error"], error_msgs


def get_difference_molecule_N(molecule):
    decon_data = json.loads(molecule["deconData"])
    error_msgs = []
    if(len(decon_data) > 1):
        error_msgs.append(
            f"""ERROR to many peaks in N: Expected to have one peak. Found {len(decon_data)}. Check the LC of N. Selected the first one.""")
    first_peak = decon_data[0]
    first_peak_index = next((i for i, e in enumerate(first_peak["peaks"]) if e["peakIntensity"] == 100))
    return first_peak["peaks"][first_peak_index]["error"], error_msgs


def get_difference_chain(specie):
    decon_data = json.loads(specie["deconData"])
    first_peak, second_peak = decon_data[0], decon_data[1]
    first_peak_index = next((i for i, e in enumerate(first_peak["peaks"]) if e["peakIntensity"] == 100))
    second_peak_index = next((i for i, e in enumerate(second_peak["peaks"]) if e["peakIntensity"] == 100))
    if (first_peak["peaks"][first_peak_index]["peakMass"] > second_peak["peaks"][second_peak_index]["peakMass"]):
        heavy_chain = first_peak["peaks"][first_peak_index]
        light_chain = second_peak["peaks"][second_peak_index]
    else:
        heavy_chain = second_peak["peaks"][first_peak_index]
        light_chain = first_peak["peaks"][second_peak_index]

    difference_light_chain = light_chain["error"]
    difference_heavy_chain = heavy_chain["error"]
    return difference_heavy_chain, difference_light_chain


def identify_modification(specie_dr, specie_d, specie_N):
    difference_heavy, difference_light = get_difference_chain(specie_dr)
    difference_mole_d, error_msgs = get_difference_molecule_D(specie_d)
    difference_mole_n, error_msgs_n = get_difference_molecule_N(specie_N)

    out = {"diffHeavy": difference_heavy, "diffLight": difference_light, "diffD": difference_mole_d}

    #candidates = get_modification_candidates(specie_dr)
    error_msgs.extend(error_msgs_n)
    return out, error_msgs


def analyze_result_together(ids: dict):
    r_result = get_result(ids["R"])
    n_result = get_result(ids["N"])
    d_result = get_result(ids["D"])
    dr_result = get_result(ids["DR"])
    species, error_msgs = identify_species(dr_result.as_dict())

    sugar_candidates = identify_sugars(species["heavyChainSpecies"], r_result.as_dict())
    mod_candidates, error_msgs_mod = identify_modification(
        dr_result.as_dict(),
        d_result.as_dict(),
        n_result.as_dict())
    error_msgs_mod.extend(error_msgs)
    return {"species": species,
            "sugar": sugar_candidates,
            "mod": mod_candidates,
            "errors": error_msgs_mod}

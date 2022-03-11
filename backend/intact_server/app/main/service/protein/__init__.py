import json

from app.main.util.utils import create_uuid4
from app.main.service.protein.massCalculation.sequence import Sequence
from app.main.service.protein.massCalculation.protein import Protein
from app.main.service.modification_set import get_modification_set


def get_Dictionaries(modificationId: str, glyco: bool):
    """
    Creates the dictionaries for the sugars and modification based on the provided modificationset
    """
    modificationSet = get_modification_set(modificationId).as_dict() if modificationId != "" else {
        "modifications": [], "kind": ""}

    modification = [x for x in modificationSet["modifications"] if x["kind"] == "modification"]
    sugars = [x for x in modificationSet["modifications"] if x["kind"] == "glyco"]

    modificationDic = {}
    sugarDic = {"None": 0}

    for sugar in sugars:
        sugarDic[sugar["name"]] = sugar["mass"]

    for mod in modification:
        modificationDic[str(mod["id"])] = {"name": mod["name"], "mass": mod["mass"]}

    if(not glyco):
        return {"None": 0}, modificationDic

    return sugarDic, modificationDic


def calculate_protein_mass(file, params):
    name = " "
    sequence_list = []
    count = 0
    params = json.loads(params.replace("'", '"'))
    while name != "":
        name = file.readline().decode("utf-8")
        if ">" in name:
            name = name.strip()[1:]
            amino_seq = file.readline().decode("utf-8").strip()
            modificationSetId = params[count]["modSetId"]

            sugarDic, modificationDic = get_Dictionaries(modificationSetId, params[count]["glyco"])
            sequence = Sequence(
                name, amino_seq, amount=params[count]["quant"],
                modification=params[count]["mod"],
                glyco=params[count]["glyco"],
                modificationDic=modificationDic, sugar=sugarDic)
            sequence_list.append(sequence)
            count += 1
    protein = Protein(sequence_list)
    out = {}
    out["R"] = protein.getR()
    out["D"] = protein.getD()
    out["N"] = protein.getN()
    out["DR"] = protein.getDR()
    return out


def validate(file):
    name = " "
    out = []
    while name != "":
        name = file.readline().decode("utf-8")
        if ">" in name:
            name = name.strip()[1:]
            tmp = {}
            tmp["name"] = name
            tmp["glyco"] = False
            tmp["mod"] = []
            tmp["id"] = str(create_uuid4())
            tmp["quant"] = 1
            tmp["modSetId"] = ""
            out.append(tmp)
    return out


def glycolysation():
    prot = Protein([])
    return list(prot.getGlyco())


def modification():
    prot = Protein([])
    return list(prot.getGlyco())

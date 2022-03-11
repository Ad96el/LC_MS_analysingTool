import os
from pathlib import Path
import datetime
from http import HTTPStatus
from typing import Dict, List
from flask import abort
from rawReader.RawReader import ThermoRawReader
import shutil
from datetime import datetime as dt
# own libs
from app.main.model import Sample, db
import app.main.service.sample_set as sample_set_service
from app.main.service.method_set import get_methodset
from app.main.service.user import get_user
from app.main.util import messages
from app.main.util.utils import check_permissions, create_uuid4, dataBaseDelete, dataBaseSave, dataBaseUpdate, pagination, validate_uuid4


def get_sample(sid: str) -> Sample:
    """
    get one specific sample
    """
    validate_uuid4(sid)
    sample = Sample.query.filter_by(id=sid).first()
    if(not sample):
        abort(HTTPStatus.NOT_FOUND, description=messages.ERROR_NOT_EXIT + sid)
    return sample


def get_sample_list(filter: Dict[str, str], sort: List[str], range: List[int]) -> List[Sample]:
    """
    get all samples.
    """
    query = db.session.query(Sample)
    samples = pagination(sort, filter, range, Sample, query)
    rows = len(query.all())
    out = []
    for sample in samples:
        out.append(sample.as_dict())
    return out, rows


def edit_sample(sid: str, sampleType: str, sampleName: str, uid: str, comment: str, color: str, msid: str) -> Sample:
    user = get_user(uid)
    check_permissions(user.role, messages.USER_PERMISSION)

    sample = get_sample(sid)
    methodSet = get_methodset(msid) if msid != "" else None
    sample.type = sampleType
    sample.name = sampleName
    sample.color = color
    sample.comment = comment
    sample.methodSet = methodSet
    dataBaseUpdate()
    return sample


def create_sample(files: List, sid: str, uid: str, comment="") -> Sample:
    """
    creates a new sample
    """
    user = get_user(uid)
    check_permissions(user.role, messages.USER_PERMISSION)
    sampleSet = sample_set_service.get_sampleSet(sid)
    samples = []
    for file in files:
        # check here maybe bug
        id = create_uuid4()
        sample_name = file.filename
        data = file.read()

        # create directory of open file and wirte content
        year = datetime.datetime.now().year
        directory = "static/" + str(year) + "/" + str(id)
        Path(directory).mkdir(parents=True, exist_ok=True)
        fileName = directory + "/" + sample_name
        if not os.path.exists(os.path.dirname(fileName)):
            os.makedirs(os.path.dirname(fileName))
        file = open(fileName, "wb+")
        file.write(data)
        file.close()
        # get sample data
        try:
            rawFile = ThermoRawReader(fileName)
            vial = rawFile.source.SampleInformation.get_Vial()
            InstrumentalMethod = rawFile.source.SampleInformation.InstrumentMethodFile
            injectionVollume = rawFile.source.SampleInformation.InjectionVolume
            sampleType = "type not in file"
        except:
            abort(HTTPStatus.BAD_REQUEST, description=messages.ERROR_WRONG_FILE)

        sample = Sample(id, sampleType, sample_name, user, create_uuid4(), comment,
                        InstrumentalMethod, injectionVollume, vial, fileName, sampleSet=sampleSet)
        # save sample
        dataBaseSave(sample)

        samples.append(sample.as_dict())
    return samples


def delete_sample(id: str, uid: str):

    user = get_user(uid)
    check_permissions(user.role, messages.ADMIN_PERMISSION)
    sample = get_sample(id)
    out = sample.as_dict()

    # delets file
    file = sample.file
    index_substring = file.rfind("/")
    folder = file[:index_substring]
    if os.path.exists(folder):
        shutil.rmtree(folder)
    dataBaseDelete(sample)
    return out

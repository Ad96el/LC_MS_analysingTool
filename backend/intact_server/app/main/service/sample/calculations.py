from itertools import compress
import json
import os
from http import HTTPStatus
from typing import List
from flask import abort
from rawReader.RawReader import ThermoRawReader
from mspy import detect_peak
import pandas as pd
import numpy as np
from UniDec import run_unidec
# own libs
from app.main.util import messages
from app.main.util.utils import create_uuid4
from .sample_database import get_sample


def get_y(id, x, tics=[]):
    tics = get_sample_tics(id)[0] if(tics == None) else tics
    x_values = np.absolute(np.array([x["x"] for x in tics]) - x)
    indexX = np.where(x_values == np.amin(x_values))[0][0]
    return round(tics[indexX]["y"], 2)


def get_sample_tics(id: str, sample=None):
    sample = get_sample(id)if not sample else sample
    file = sample.file
    if(os.path.exists(file)):
        rawReader = ThermoRawReader(file)
        df_values = rawReader.getTIC()
        df_values.columns = ["x", "y"]
        maxValue = df_values["y"].max()
        df_values["y"] = df_values["y"] / maxValue * 100
        df_values = df_values.round(2)
        rawReader.close()
        out = json.loads(df_values.to_json(orient="records"))
        return out, df_values
    else:
        abort(HTTPStatus.BAD_REQUEST, description=messages.FILE_DOES_NOT_EXIT)


def get_sample_ms(id: str, intervall: List[int], s=None):
    sample = get_sample(id) if not s else s
    start = float(intervall[0])
    end = float(intervall[1])
    file = sample.file

    if(os.path.exists(file)):
        rawReader = ThermoRawReader(file)
        df_values = rawReader.getAverageSpectrumByRT(start, end)
        df_values.columns = ["x", "y"]
        maxValue = df_values["y"].max()
        df_values["y"] = df_values["y"] / maxValue * 100
        df_values = df_values.round(2)
        rawReader.close()
        out = json.loads(df_values.to_json(orient="records"))
        return out, df_values


def calculate_score_fasta(data: dict, componets: List[dict]) -> dict:
    out = []
    if(len(componets) == 0):
        return data["peaks"]

    for peak in data["peaks"]:
        scores = []
        mass = peak["peakMass"]
        for comp in componets:
            scores.append(round(abs(comp["mass"] - mass), 2))

        maxScoreIndex = scores.index(min(scores))
        componets[maxScoreIndex]["peakMass"] = peak["peakMass"]
        componets[maxScoreIndex]["peakIntensity"] = peak["peakIntensity"]
        componets[maxScoreIndex]["id"] = str(create_uuid4())
        componets[maxScoreIndex]["score"] = peak["score"]
        componets[maxScoreIndex]["specToPeak"] = peak["specToPeak"]
        componets[maxScoreIndex]["error"] = scores[maxScoreIndex]
        out.append(componets[maxScoreIndex].copy())
    return out


def get_deconvolution_data(id: str, intervall: List[int]):
    sample = get_sample(id)
    methodSet = sample.methodSet

    data = {}
    param_raw_list_decon = [method for method in methodSet.methods if method.type == "decon"]
    param_raw_list_fasta = [method for method in methodSet.methods if method.type == "fasta"]
    if(len(param_raw_list_decon) == 0):
        abort(400, description=messages.ERROR_DECON)

    if (len(param_raw_list_fasta) == 0):
        componentsParam = []
    else:
        componentsParam = json.loads(param_raw_list_fasta[0].components)

    calculationParam = json.loads(param_raw_list_decon[0].calculations)
    file, directory = save_ms(id, intervall, sample)
    data = run_unidec(file, directory, params=calculationParam)
    component_data = calculate_score_fasta(data, componentsParam)
    data["peaks"] = component_data
    return data


def save_ms(id: str, intervall: List[int], sample=None):
    sam = get_sample(id) if not sample else sample
    _, df = get_sample_ms(id, intervall, sam)
    directory = "/".join(sam.file.split("/")[:-1])
    file = "peak.txt"
    df.to_csv(directory + "/" + file, sep=" ", header=False, index=False)
    return file, directory


def get_peaks(id: str, tics=None, sample=None):

    sample = get_sample(id) if not sample else sample
    methodSet = sample.methodSet
    if(methodSet == None):
        abort(400, description=messages.ERROR_NO_METHODSET)

    methods = methodSet.methods
    for method in methods:
        if(method.type == "peak"):
            calculations = json.loads(method.calculations)
            if not isinstance(tics, pd.DataFrame):
                rawReader = ThermoRawReader(sample.file)
                tics = rawReader.getTIC()
                tics.columns = ["x", "y"]
            peaks, _ = detect_peak(
                tics, calculations["pickingHeight"],
                calculations["absThreshold"],
                calculations["relThreshold"],
                calculations["snThreshold"],
                calculations["baselineWindow"],
                calculations["baselineOffset"],
                calculations["smoothMethod"],
                calculations["smoothWindow"],
                calculations["smoothCycles"])
            return {"id": id,
                    "data": [
                        {"rtPeak": round(x, 2),
                         "start": round(x-0.5, 2),
                         "end": round(x+0.5, 2),
                         "id": str(create_uuid4())} for x in peaks]}

    abort(400, description=messages.ERROR_PEAK)


def get_components(id: str, sample=None):
    sample = get_sample(id) if not sample else sample
    methodSet = sample.methodSet
    if(methodSet == None):
        abort(400, description=messages.ERROR_NO_METHODSET)
    methods = methodSet.methods
    for method in methods:
        if(method.type == "peak"):
            return json.loads(method.components)
    abort(400, description=messages.ERROR_PEAK)


def assign_Peaks_to_component(id: str, peaks={"id": -1, "data": []}, tics=[]):
    peaks = get_peaks(id) if peaks["id"] == -1 else peaks
    tics = get_sample_tics(id)[0] if tics == [] else tics
    components = get_components(id)

    if(len(peaks["id"]) == 0 or len(components) == 0):
        return peaks

    for component in components:
        distance = []
        for peak in peaks["data"]:
            diff = abs(peak["rtPeak"] - component["rt"])
            distance.append(diff)

        if(distance == []):
            continue

        if(component["type"] == "closest" and min(distance) < component["window"]):
            minIndex = distance.index(min(distance))
            x = peaks["data"][minIndex]["rtPeak"]
            peaks["data"][minIndex]["rtComp"] = round(component["rt"], 2)
            peaks["data"][minIndex]["window"] = component["window"]
            peaks["data"][minIndex]["y"] = get_y(id, x, tics)
            peaks["data"][minIndex]["comp"] = component["name"]

        elif (component["type"] == "highest" and min(distance) < component["window"]):
            candidates = [d < component["window"] for d in distance]

            maxPeak = max(compress(peaks["data"], candidates), key=lambda x: x["rtPeak"])
            minIndex = peaks["data"].index(maxPeak)
            x = maxPeak["rtPeak"]
            peaks["data"][minIndex]["rtComp"] = round(component["rt"], 2)
            peaks["data"][minIndex]["window"] = component["window"]
            peaks["data"][minIndex]["y"] = get_y(id, x, tics)
            peaks["data"][minIndex]["comp"] = component["name"]
    return peaks


def all_peak(id: str, sample=None):
    sample = get_sample(id) if not sample else sample
    if(not sample.mid):
        abort(400, description=messages.ERROR_NO_METHODSET)
    tics, df = get_sample_tics(str(sample.id), sample)
    peaks = get_peaks(str(sample.id), tics=df, sample=sample)
    peaktocomp = assign_Peaks_to_component(str(sample.id), peaks, tics)
    return {"tics": tics, "peaks": peaktocomp, "id": id}

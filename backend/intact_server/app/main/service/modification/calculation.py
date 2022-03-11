import re
from flask import abort
from http import HTTPStatus
from app.main.util import messages

atoms = {
    "C": 12.011,
    "H": 1.00794,
    "N": 14.0067,
    "O": 15.994,
    "S": 32.066,
    "c": 12.011,
    "h": 1.00794,
    "n": 14.0067,
    "o": 15.994,
    "s": 32.066
}


def checkFormula(formula: str):
    allowed = r"[CHNOSchnos1234567890]+"
    machted_patter = re.findall(allowed, formula)
    if(len(machted_patter) == 0):
        abort(HTTPStatus.BAD_REQUEST, description=messages.ERROR_UNALLOWED_FORMULA)
    pattern = machted_patter[0]
    if(len(pattern) != len(formula) or formula.isnumeric()):
        abort(HTTPStatus.BAD_REQUEST, description=messages.ERROR_UNALLOWED_FORMULA)


def calculateMass(formulaAdd: str, formulaSub: str) -> float:
    formulaSub = formulaSub.strip()
    formulaAdd = formulaAdd.strip()

    def add(x, y):
        return x + y

    def sub(x, y):
        return x - y

    mass = 0

    if(formulaAdd and formulaAdd != ""):
        mass = calculate(formulaAdd, mass, add)

    if(formulaSub and formulaSub != ""):
        mass = calculate(formulaSub, mass, sub)
    return round(mass, 3)


def calculate(formula: str, mass: float, operation):
    lastChar = ""
    quantity = ""
    for char in formula:
        if(lastChar == ""):
            lastChar = char
        elif(char.isalpha() and quantity == ""):
            mass = operation(mass, atoms[lastChar])
            lastChar = char
        elif(char.isalpha() and quantity != ""):
            mass = operation(mass, atoms[lastChar] * int(quantity))
            lastChar = char
            quantity = ""
        elif(char.isnumeric()):
            quantity += char

    if(quantity != ""):
        mass = operation(mass, atoms[lastChar] * int(quantity))
    else:
        mass = operation(mass, atoms[lastChar])
    return mass

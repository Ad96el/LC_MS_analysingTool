import itertools


class Sequence:
    """
    a part of the protein class. 

    1. takes a seuquence and modification.
    2. calcualtes the mass of the amino sequence
    3. applies the modification of the protein.

    """

    _WATER_MASS = 18.01528

    _modifications = {

    }

    _aminoDic = {
        "A": 71.07884,
        "C": 103.14484,
        "D": 115.08864,
        "E": 129.11552,
        "F": 147.1766,
        "G": 57.05196,
        "H": 137.1412,
        "I": 113.15948,
        "K": 128.17416,
        "L": 113.15948,
        "M": 131.1986,
        "N": 114.10392,
        "P": 97.11672,
        "Q": 128.1308,
        "R": 156.18764,
        "S": 87.07824,
        "T": 101.10512,
        "V": 99.1326,
        "W": 186.21328,
        "Y": 163.176,
    }

    _sugarDic = {}

    def __init__(
        self, name, sequence, amount=1, modification=[], glyco=True, sugar={}, modificationDic={}
    ):
        self.name = name
        self.sequence = sequence
        self.amount = amount
        self.glyco = glyco
        self.modification = modification
        self._sugarDic = sugar
        self._modifications = modificationDic
        self.mass = self._calculateMassArray(self.sequence)
        self._applymodifications()

    def _applymodifications(self):
        """
        applies the modifcation of chain. The modification is applied globally. 

        if the modification is variable (var = True). the modification is [0, quant] applied
        """
        out = []
        for mod in self.modification:
            if mod["mod"] == "-1":
                continue
            modId = mod["mod"]
            modificationRaw = self._modifications[modId]

            name, value, quantity, variable = modificationRaw["name"], modificationRaw["mass"], mod["quant"], mod["var"]
            if not variable:
                mod = {}
                mod["name"] = name
                mod["quantity"] = quantity
                mod["mass"] = quantity * value
                out.append([mod])
            else:
                possibleMod = []
                for i in range(quantity + 1):
                    mod = {}
                    mod["name"] = name
                    mod["quantity"] = i
                    mod["mass"] = i * value
                    possibleMod.append(mod)
                out.append(possibleMod)
        combinations = [list(elem) for elem in list(itertools.product(*out))]
        self.modificationMass = combinations

    def _calculateMassArray(self, aminoArray):
        totalMass = 0
        for amino in aminoArray:
            mass = self._aminoDic[amino]
            totalMass += mass
        return totalMass + self._WATER_MASS

    # getter and setter
    def getName(self):
        return self.name

    def getSequence(self):
        return self.sequence

    def getAmount(self):
        return self.amount

    def getGlyco(self):
        return self.glyco

    def getmodification(self):
        return self.modification

    def getMass(self):
        return self.mass

    def getmodificationMass(self):
        return self.modificationMass

    def hasmodification(self):
        return len(self.modification) != 0

    def getSugar(self):
        return self._sugarDic

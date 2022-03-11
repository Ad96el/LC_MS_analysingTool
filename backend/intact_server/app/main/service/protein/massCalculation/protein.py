from typing import Dict, List
from app.main.service.protein.massCalculation.sequence import Sequence
from app.main.util.utils import create_uuid4
import itertools


class Protein:

    """
    basic approach of this class: 

    1. init the protein with the seuquences. 

    2. calcualte the mass with _calculateMass()
        - the mass of the modification
        - all possible combinations of the chain, glyco and their modification

    """

    _HYDROGEN_MASS = 1.00794
    _DEGLY_CONSTANT = 0.98472
    singleParts = []

    def __init__(self, chains: List[Sequence]):
        self.chains = chains
        self.singleParts = []
        self._calculateMass()

    def _calculateModifications(self, chain):
        chainModification = chain.getmodificationMass()
        out = []
        for mass in chainModification:
            tmpModification = {}
            tmpName = "("
            tmpMass = 0
            tmpQuantity = "("

            # create the tmp mass, name and quantity for the modification
            for modification in list(mass):
                tmpName += str(modification["name"]) + ","
                tmpMass += modification["mass"]
                tmpQuantity += str(modification["quantity"]) + ","

            tmpModification["modifications"] = (
                tmpName[:-1] if tmpName != "(" else tmpName
            ) + ")"
            tmpModification["modificationQuantity"] = (
                tmpQuantity[:-1] if tmpQuantity != "(" else tmpQuantity
            ) + ")"
            tmpModification["mass"] = tmpMass
            out.append(tmpModification)
        return out

    def _calculateSugarCombinations(self, count, sugarDic):
        out = []
        keys = sugarDic.keys()
        for _ in range(count):
            out.append(keys)
        return [list(elem) for elem in list(itertools.product(*out))]

    def _singleParts(self, sugarDic: Dict, chain: Sequence, combinations_modification: Dict):
        for sugar in sugarDic:
            for modification in combinations_modification:
                modCopySugar = modification.copy()
                modCopySugar["mass"] = modification["mass"] + sugarDic[sugar] + chain.getMass()
                modCopySugar["glyco"] = "(" + sugar + ")"
                modCopySugar["chain_quantity"] = 1
                modCopySugar["name"] = chain.getName()
                modCopySugar["id"] = str(create_uuid4())
                modCopySugar["hasGlyco"] = chain.getGlyco()
                self.singleParts.append(modCopySugar)

    def _addSugar(self, chain: Sequence, amount):
        """
        applys all possible combinations of sugar and their modification
        """
        CombinedParts = []
        count = chain.getAmount() if amount else 1
        sugarDic = chain.getSugar()

        combinations_modification = self._calculateModifications(chain)
        combinations_sugar = self._calculateSugarCombinations(count, sugarDic)
        self._singleParts(sugarDic, chain, combinations_modification.copy())

        for protein_combination in combinations_modification:
            for sugar_combination in combinations_sugar:
                name = "(" + ",".join(sugar_combination) + ")"
                protein_combination_copy = protein_combination.copy()

                glyco_value = sum([sugarDic[elem] for elem in sugar_combination])

                protein_combination_copy["mass"] = round(protein_combination["mass"] +
                                                         count * (glyco_value + chain.getMass()), 2)

                protein_combination_copy["glyco"] = name
                protein_combination_copy["chain_quantity"] = count
                protein_combination_copy["name"] = chain.getName()
                protein_combination_copy["id"] = str(create_uuid4())
                CombinedParts.append(protein_combination_copy)
        return CombinedParts

    def _calculateCombinations(self, amount=True):
        """
        itertools calculates the inner product of all lists.
        expl:
        a = [["a","b"], ["c","d"]]
        itertools.product(*a) -> [('a', 'c'), ('a', 'd'), ('b', 'c'), ('b', 'd')]

        calcuates all possible combinations of the chain with the sugar.
        """

        combinations = []
        for chain in self.chains:
            combination = self._addSugar(chain, amount)
            combinations.append(combination)
        return (
            [list(elem) for elem in list(itertools.product(*combinations))],
            combinations
        )

    def _sum(self, combinations, disulfid):
        # compute the mass of the protein
        result = []
        for sequenceCombination in combinations:
            interResult = {}
            name = ""
            quantity = ""
            modifications = ""
            modificationQuantity = ""
            glyco = ""
            mass = 0

            for sequence in sequenceCombination:
                name += sequence["name"] + ","
                quantity += str(sequence["chain_quantity"]) + ","
                modifications += sequence["modifications"] + ","
                modificationQuantity += sequence["modificationQuantity"] + ","
                mass += sequence["mass"]
                glyco += sequence["glyco"] + ","

            interResult["name"] = name[:-1]
            interResult["quantity"] = quantity[:-1]
            interResult["modifications"] = modifications[:-1]
            interResult["modificationQuantity"] = modificationQuantity[:-1]
            interResult["mass"] = round(mass - (disulfid * self._HYDROGEN_MASS), 2)
            interResult["glyco"] = glyco[:-1]
            interResult["id"] = str(create_uuid4())
            result.append(interResult)
        return result

    def _countDisulfid(self):
        """
        counts the amount of C. Each bridge needs two c => divide by 2 
        """
        allSequence = ""
        for chain in self.chains:
            allSequence += chain.getAmount() * chain.getSequence()
        return allSequence.count("C")

    def _calculateMass(self):
        combinations, parts = self._calculateCombinations()
        self.massCombinations = self._sum(combinations, self._countDisulfid())
        self.parts = parts

    def clear(self):
        self.singleParts = []
        self.chains = []
        self.parts = []
        self.massCombinations = []

    def getN(self):
        return [x for x in self.massCombinations if "Degly" not in x["glyco"]]

    def getR(self):
        return [x for x in self.singleParts if x["glyco"] != "(Degly)"]

    def getD(self):
        query = "("
        naming = "("
        count = 0
        for chain in self.chains:
            query += "None," * chain.amount
            if chain.getGlyco():
                count += chain.amount
                naming += "Degly," * chain.amount
            else:
                naming += "None," * chain.amount
            query = query[:-1] + "),("
            naming = naming[:-1] + "),("

        query = query[:-2]
        naming = naming[:-2]
        deglyCombination = [x for x in self.massCombinations if x["glyco"] == query]
        out = []
        for x in deglyCombination:
            x["mass"] = x["mass"] + count * self._DEGLY_CONSTANT
            x["glyco"] = naming
            out.append(x)
        return out

    def getDR(self):
        candidates = [x for x in self.singleParts if x["glyco"] == "(None)"]
        out = []
        for c in candidates:
            if(not c["hasGlyco"]):
                out.append(c)
            else:
                c["mass"] = c["mass"] + self._DEGLY_CONSTANT
                c["glyco"] = "(Degly)"
                out.append(c)
        return out

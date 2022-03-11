ERROR_WRONG_UUID = "ERROR: provided uuid has a wrong format: "
ERROR_NOT_EXIT = "ERROR: requested entity does not exit: "
ERROR_NO_PERMISSONS = "The requested operation requrires higher permissions"
ERROR_NAME_EXITS = "The provided name already exits. Violates the unique attribute: "
ERROR_BROKEN_QUERY = "The Server tried to run a broken QUERY"
ERROR_UPDATE = "The Server could not update the server"
ERROR_DEPRECATED_VERSON = "The request aims to update a deprecated version. "
FILE_DOES_NOT_EXIT = "The request file for the sample does not exit anymore. Delete the sample and reupload the raw file again"
ERROR_UNALLOWED_FORMULA = "The provided formula is wrong"
ERROR_ATTR = "ERROR: attribute does not exits"
ERROR_FILE = "File has the wrong format"
HELP_PARAMS = """
                The Params field expects the following input: for each chain a dictionary with: [{"name":"string","glyco":bool,"mod":[],"id":"string","quant":number,"modSetId":"string"}]. 
                The name has to match with the name of the chain in the file. Id can set random. The modSetId has to exits in the database.

                the mod attribute is a list of the possible modifications from the modificationset with the attributes: 
                [{mod":"string","quant":number,"var":bool,"id": number}]

                The id can set random. The mod attribute is the id of the modification from the database. This modification has to be a part of the Modificationset. 
            """
ERROR_WRONG_FILE = "The provided Raw file has the wrong format. Data could not be extracted"
HELP_FILE = "The uploaded file has to be a .fasta file. The chain starts with: '>NAME'. The next line has to be the whole amino sequence. "
ERROR_DECON = "The Methodset has no Deconvolution Method"
ERROR_NO_METHODSET = "No Methodset Provided"
ERROR_PEAK = "The Methodset has no Peak Selection Method"
ERROR_VERSION = "Ther Version of the entity can not be updated"
ADMIN_PERMISSION = 2
USER_PERMISSION = 1
GUEST_PERMISSION = 0

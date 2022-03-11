from flask_restplus.model import Model
from flask_restplus import fields

preview = Model('Preview Element to reduce data traffic', {
    'name': fields.String(required=True),
    'id': fields.String(required=True)
})


user = Model("user", {
    'id': fields.String(required=True),
    'approved': fields.Boolean(required=True),
    'role': fields.Integer(required=True),
    'created': fields.String(required=True),
    'email': fields.String(required=True),
})


calculation = Model("Calculation Properties for the peak selection", {
    'absThreshold': fields.Float(required=True),
    'baselineOffset': fields.Float(required=True),
    'baselineWindow': fields.Float(required=True),
    'pickingHeight': fields.Float(required=True),
    'relThreshold': fields.Float(required=True),
    'smoothCycles': fields.Float(required=True),
    'smoothMethod': fields.String(required=True),
    'smoothWindow': fields.Float(required=True),
    'snThreshold': fields.Float(required=True),
})


method = Model('method', {
    'id': fields.String(required=True, description='The method set identifier'),
    'type': fields.String(required=True, description='The method set identifier'),
    'name': fields.String(required=True, description='The method set name'),
    'created': fields.DateTime(required=True, description='creation date of the method set', dt_format="iso8601"),
    'version': fields.Float(required=True),
    'vid': fields.String(required=True),
    'head': fields.Boolean(required=True),
    'user': fields.Nested(user),
    'components': fields.String(required=True),
    'calculations': fields.String(required=True),
})


method_set = Model('method_Set', {
    'id': fields.String(required=True, description='The method set identifier'),
    'name': fields.String(required=True, description='The method set name'),
    'created': fields.DateTime(required=True, description='creation date of the method set', dt_format="iso8601"),
    'methods': fields.List(fields.Nested(method)),
    'version': fields.Float(required=True),
    'head': fields.Boolean(required=True),
    'vid': fields.String(required=True),
    'user': fields.Nested(user)
})


tokens = Model('provided tokens', {
    'token': fields.String(required=True),
})

project = Model("project", {
    'id': fields.String(required=True),
    'sop': fields.String(required=True),
    'created': fields.DateTime(required=True),
    'name': fields.String(required=True),
    'desc': fields.String(required=True),
    'user': fields.Nested(user),
})

result = Model("result", {
    'id': fields.String(required=True),
    'created': fields.String(required=True),
    'name': fields.String(required=True),
    'user': fields.Nested(user),
    'sid': fields.String(required=True),
    'methodset': fields.Nested(preview),
    'rsid': fields.String(required=True),
    'peaks': fields.String(required=True),
    'tics': fields.String(required=True),
    'version': fields.Float(required=True),
    'vid': fields.String(required=True),
    'head': fields.Boolean(required=True),
    'deconData': fields.String(required=True),
})

result_preview = Model("Result Preview to reduce data traffic", {
    'id': fields.String(required=True),
    'created': fields.String(required=True),
    'name': fields.String(required=True),
    'user': fields.Nested(user),
    'sid': fields.String(required=True),
    'methodset': fields.Nested(preview),
    'rsid': fields.String(required=True),
    'version': fields.Float(required=True),
    'vid': fields.String(required=True),
    'head': fields.Boolean(required=True),

})

sample = Model("sample", {
    'id': fields.String(required=True),
    'created': fields.String(required=True),
    'type': fields.String(required=True),
    'name': fields.String(required=True),
    'user': fields.Nested(user),
    "sid": fields.String(required=True),
    'color': fields.String(required=True),
    'methodset': fields.Nested(method_set),
    "result":  fields.Nested(preview)
})


sample_set = Model("sample_set", {
    'name': fields.String(required=True),
    'id': fields.String(required=True),
    'descr': fields.String(required=True),
    'pid': fields.String(required=True),
    'rsid': fields.String(required=True),
    'system_name': fields.String(required=True),
    'user': fields.Nested(user),
    'created': fields.DateTime(required=True, dt_format="iso8601"),
})

version = Model("version", {
    'version': fields.String(),
    'id': fields.String(required=True),
})

resultSet = Model("result set", {
    'id': fields.String(required=True),
    'created': fields.String(required=True),
    'name': fields.String(required=True),
    'user': fields.Nested(user),
    'sid': fields.String(required=True),
    'version': fields.Float(required=True),
    'vid': fields.String(required=True),
    'head': fields.Boolean(required=True),
    'results': fields.List(fields.String())
})


statistics = Model("statistics", {
    'sample_count': fields.Integer(),
    'project_count': fields.Integer(),
    'sampleset_cout': fields.Integer(),
    'samples_no_sampleset': fields.Integer(),
    'new_project': fields.String(),
    'users_count': fields.Integer(),
    'version': fields.Float(required=True),
    'vid': fields.String(required=True),
    'head': fields.Boolean(required=True),
})

modification = Model("modification", {
    'id': fields.String(required=True),
    'formula_add': fields.String(required=True),
    'formula_sub': fields.String(),
    'mass': fields.Float(required=True),
    'created':  fields.String(required=True),
    'name': fields.String(required=True),
    'kind': fields.String(required=True),
})


modification_set = Model("modification_set", {
    'id': fields.String(required=True),
    'created':  fields.String(required=True),
    'name': fields.String(required=True),
    'modifications': fields.List(fields.Nested(modification))
})

protein_validate = Model("protein_Validate", {
    'id': fields.String(required=True),
    'glyco':  fields.Boolean(required=True),
    'name': fields.String(required=True),
    "mod": fields.List(fields.Raw()),
    "quant": fields.Integer(),
    "modSetId": fields.String()
})

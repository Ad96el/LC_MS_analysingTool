from flask_restplus.model import Model
from flask_restplus import fields

methodSet_create_update = Model('create method_Set', {
    'name': fields.String(required=True, description='The method set name'),
    'methods': fields.List(fields.String()),
    'comment': fields.String(),
})


credentials = Model('user credentials', {
    'email': fields.String(required=True, description='email of the user'),
    'password': fields.String(required=True, description='password of the user'),
})

project_update_create = Model("update project", {
    'name': fields.String(required=True),
    'desc': fields.String(required=True),
    'sop': fields.String(required=True),
    'comment': fields.String(),
})

sample_update_create = Model("update or create sample", {
    'name': fields.String(required=True),
    'type': fields.String(required=True),
    'color': fields.String(required=True),
    'msid': fields.String(required=True),
    'comment': fields.String(),
})


method = Model("method includes calculation and components", {
    'calculation': fields.Raw(),
    'components': fields.List(fields.Raw())
})

method_create_update = Model("update or  create method", {
    'type': fields.String(required=True),
    'name': fields.String(required=True),
    "method": fields.Nested(method),
})

sampleSet_create_update = Model("create or update a new sampleset", {
    'name': fields.String(required=True),
    'pid': fields.String(required=True),
    'system_name': fields.String(required=True),
    'comment': fields.String(),
    'desc': fields.String(),
})

result_update_create = Model("update or create results", {
    'id': fields.String(required=True),
    'data': fields.List(fields.Raw()),
    'tics': fields.List(fields.Raw()),
    'comment': fields.String(),
})

result_set_update_create = Model("update or create results", {
    'kind': fields.String(required=True),
    'sid': fields.String(required=True),
})

modification_create_update = Model("update or create modification", {
    'formula_add': fields.String(),
    'formula_sub': fields.String(),
    'kind': fields.String(required=True),
    'name': fields.String(required=True),
})

modification_set_create_update = Model("update or create modification set", {
    'name': fields.String(required=True),
    'modifications': fields.List(fields.String()),
})

result_combine = Model("Combine four analyzes", {
    'id_N': fields.String(required=True),
    'id_R': fields.String(required=True),
    'id_D': fields.String(required=True),
    'id_DR': fields.String(required=True),

})

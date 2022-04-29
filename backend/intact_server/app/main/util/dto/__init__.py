from .request import (methodSet_create_update, credentials, project_update_create,
                      sample_update_create, method_create_update, sampleSet_create_update,
                      method as method_request,  result_update_create, result_combine,
                      result_set_update_create, modification_create_update, modification_set_create_update)

from .response import (user, method, tokens, project, sample, method_set, sample_set, user, version, preview,
                       statistics, result, resultSet, modification, modification_set, protein_validate, result_preview)


def register_models(app):
    app.models[modification.name] = modification
    app.models[result_set_update_create.name] = result_set_update_create
    app.models[modification_create_update.name] = modification_create_update
    app.models[methodSet_create_update.name] = methodSet_create_update
    app.models[credentials.name] = credentials
    app.models[sample_update_create.name] = sample_update_create
    app.models[method.name] = method
    app.models[method_create_update.name] = method_create_update
    app.models[tokens.name] = tokens
    app.models[project.name] = project
    app.models[sample.name] = sample
    app.models[method_set.name] = method_set
    app.models[project_update_create.name] = project_update_create
    app.models[sample_set.name] = sample_set
    app.models[sampleSet_create_update.name] = sampleSet_create_update
    app.models[user.name] = user
    app.models[version.name] = version
    app.models[statistics.name] = statistics
    app.models[method_request.name] = method_request
    app.models[result_update_create.name] = result_update_create
    app.models[result.name] = result
    app.models[resultSet.name] = resultSet
    app.models[modification_set.name] = modification_set
    app.models[modification_set_create_update.name] = modification_set_create_update
    app.models[protein_validate.name] = protein_validate
    app.models[preview.name] = preview
    app.models[result_preview.name] = result_preview
    app.models[result_combine.name] = result_combine
    return app

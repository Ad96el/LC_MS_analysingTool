from flask import abort
from sqlalchemy.sql.expression import desc
from app.main.model import db, User, Sample, SampleSet, Project


def get_statistics():
    pquery = db.session.query(Project)
    ssquery = db.session.query(SampleSet)
    squery = db.session.query(Sample)
    uquery = db.session.query(User)

    srows = len(squery.all())
    urows = len(uquery.all())
    prows = len(pquery.all())

    ssrows = len(ssquery.all())
    sample_no_sampleSet = squery.filter(Sample.methodSet == None).count()
    newProject = pquery.order_by(desc(Project.created)).first()

    out = {
        'sample_count': srows,
        'project_count': prows,
        'sampleset_cout': ssrows,
        'samples_no_sampleset': sample_no_sampleSet,
        'new_project': newProject.id if newProject else "",
        'users_count': urows
    }
    return out


def get_colors():
    return ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'black', 'white']

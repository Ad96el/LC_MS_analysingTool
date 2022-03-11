
#TODO: ORDER IS IMPORTANT! Fix this. its ugly

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID

db = SQLAlchemy()

association_method_methodSet = db.Table('method_method_set', db.metadata,
                                        db.Column('method_id', UUID(as_uuid=True), db.ForeignKey('method.id')),
                                        db.Column('method_set_id', UUID(as_uuid=True), db.ForeignKey('method_set.id'))
                                        )

association_result_resultSet = db.Table('result_result_set', db.metadata,
                                        db.Column('result_id', UUID(as_uuid=True), db.ForeignKey('results.id')),
                                        db.Column('result_set_id', UUID(as_uuid=True), db.ForeignKey('result_set.id'))
                                        )

association_modification_modificationset = db.Table('modification_modification_set', db.metadata,
                                        db.Column('modification_id', UUID(as_uuid=True), db.ForeignKey('modification.id')),
                                        db.Column('modification_set_id', UUID(as_uuid=True), db.ForeignKey('modification_set.id'))
                                        )


from .user import User
from .sampleSet import SampleSet
from .project import Project
from .method import Method
from .methodSet import MethodSet
from .sample import Sample
from .result import Results
from .result_set import ResultSet
from .modification import Modification 
from .modification_set import ModificationSet





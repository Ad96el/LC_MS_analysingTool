from datetime import datetime as dt
import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from . import db, User


class SampleSet(db.Model):
    """ sample set Model for storing sample set related details """
    __tablename__ = "sample_set"

    blocked = False
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created = db.Column(db.DateTime, nullable=False)
    system_name = db.Column(db.String(255), nullable=False)
    sample_start = db.Column(db.DateTime)
    descr = db.Column(db.String(255))
    name = db.Column(db.String(255), nullable=False)
    uid = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    pid = db.Column(UUID(as_uuid=True), db.ForeignKey('project.id'))
    rsid = db.Column(UUID(as_uuid=True), db.ForeignKey('result_set.id'))

    # relations
    result_set = relationship("ResultSet", lazy='subquery', back_populates="sampleSet")
    user = relationship("User", lazy='subquery', back_populates="sampleSets")
    project = relationship("Project", lazy='subquery', back_populates="sampleSets")
    samples = relationship("Sample", lazy='subquery', back_populates="sampleSets")

    def __init__(self, name: str, user: User, system_name: str, project=None, samples=[], descr=""):
        self.system_name = system_name
        self.name = name
        self.descr = descr
        self.user = user
        self.samples = samples
        self.project = project
        self.created = dt.now(datetime.timezone.utc).isoformat()

    def as_dict(self):
        out = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        out["pid"] = self.project.id if self.project else ""
        out["user"] = self.user.as_dict() if self.user else None
        out["samples"] = [x.id for x in self.samples]
        out["rsid"] = self.result_set.id if self.result_set else None
        out["blocked"] = self.blocked
        return out

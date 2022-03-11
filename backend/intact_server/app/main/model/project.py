from datetime import datetime as dt
import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from . import db, User


class Project(db.Model):
    """ Project Model for storing project related details """
    __tablename__ = "project"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sop = db.Column(db.String(255))
    created = db.Column(db.DateTime, nullable=False)
    name = db.Column(db.String(255),  nullable=False)
    descr = db.Column(db.String(255))
    uid = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))

    # relations
    user = relationship("User", back_populates="projects")
    sampleSets = relationship("SampleSet",  lazy='subquery', back_populates="project")

    def __init__(self, sop: str, name: str, user: User, descr=""):
        self.sop = sop
        self.name = name
        self.descr = descr
        self.user = user
        self.created = dt.now(datetime.timezone.utc).isoformat()

    def as_dict(self):
        out = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        out["sampleSets"] = [x.id for x in self.sampleSets]
        out["user"] = self.user.as_dict() if self.user else None
        out["desc"] = self.descr
        return out

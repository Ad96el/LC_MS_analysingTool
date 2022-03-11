from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from . import db, User
from datetime import datetime as dt
import datetime


class Sample(db.Model):
    """ sample Model for storing sample related details """
    __tablename__ = "sample"

    id = db.Column(UUID(as_uuid=True), primary_key=True)
    created = db.Column(db.DateTime, nullable=False)
    type = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    injectionMethod = db.Column(db.String(255), nullable=False)
    injectionvolume = db.Column(db.String(255), nullable=False)
    vial = db.Column(db.String(255), nullable=False)
    color = db.Column(db.String(20), nullable=False)
    file = db.Column(db.String(255), nullable=False)
    uid = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    sid = db.Column(UUID(as_uuid=True), db.ForeignKey('sample_set.id'))
    mid = db.Column(UUID(as_uuid=True), db.ForeignKey('method_set.id'))
    # relations
    results = relationship("Results", lazy='subquery', back_populates="sample")
    user = relationship("User", lazy='subquery', back_populates="samples")
    sampleSets = relationship("SampleSet", lazy='subquery', back_populates="samples")
    methodSet = relationship("MethodSet", lazy='subquery',  back_populates="samples")

    def __init__(self, id: uuid, sampleType: str, samplename: str, user: User, vid: str, comment: str,
                 injectionMethod: str, injectionvolume: str, vial: int, file: str, sampleSet=None, color="white"):
        self.type = sampleType
        self.name = samplename
        self.user = user
        self.sampleSets = sampleSet
        self.head = True
        self.version = 0.1
        self.comment = comment
        self.vid = vid
        self.color = color
        self.injectionMethod = injectionMethod
        self.injectionvolume = injectionvolume
        self.vial = vial
        self.id = id
        self.created = dt.now(datetime.timezone.utc).isoformat()
        self.file = file

    def as_dict(self):
        out = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        out["sampleSets"] = self.sampleSets.id if self.sampleSets else ""
        out["user"] = self.user.as_dict() if self.user else {}
        out["methodset"] = self.methodSet.as_dict() if self.methodSet else None
        results = [x.as_dict() for x in self.results if x.head] if self.results else None
        out["result"] = results[0] if results and len(results) > 0 else None
        return out

from datetime import datetime as dt
import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import Boolean, Float
from . import db, User, association_result_resultSet


class ResultSet(db.Model):
    """ sample set Model for storing sample set related details """
    __tablename__ = "result_set"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created = db.Column(db.DateTime, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    uid = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))

    # version
    vid = db.Column(UUID(as_uuid=True), nullable=False)
    head = db.Column(Boolean)
    version = db.Column(Float, nullable=False)
    comment = db.Column(db.String(255))

    # relations
    user = relationship("User", lazy='subquery', back_populates="result_set")
    sampleSet = relationship("SampleSet", lazy='subquery', back_populates="result_set",
                             uselist=False)

    results = relationship("Results", lazy='subquery', secondary=association_result_resultSet,
                           back_populates="result_set")

    def __init__(self, name: str, user: User, vid: str, SampleSet=None, results=[]):
        self.name = name
        self.user = user
        self.created = dt.now(datetime.timezone.utc).isoformat()
        self.sampleSet = SampleSet
        self.results = results
        self.vid = vid
        self.head = True
        self.version = 0.1

    def as_dict(self):
        out = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        out["user"] = self.user.as_dict() if self.user else None
        out["results"] = [x.id for x in self.results if x.head]
        out["sid"] = self.sampleSet.id if self.sampleSet else None
        return out

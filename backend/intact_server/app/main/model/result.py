from app.main.model.methodSet import MethodSet
from app.main.model.sample import Sample
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime as dt
import datetime
from sqlalchemy.sql.sqltypes import Boolean, Float
from sqlalchemy.orm import relationship
from . import db, User, association_result_resultSet


class Results(db.Model):
    """ sample Model for storing sample related details """
    __tablename__ = "results"

    id = db.Column(UUID(as_uuid=True), primary_key=True)
    created = db.Column(db.DateTime, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    peaks = db.Column(db.Text(), nullable=False)
    tics = db.Column(db.Text(), nullable=False)
    deconData = db.Column(db.Text(), nullable=False)

    uid = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    msid = db.Column(UUID(as_uuid=True), db.ForeignKey('method_set.id'))
    sid = db.Column(UUID(as_uuid=True), db.ForeignKey('sample.id'))

    # version
    vid = db.Column(UUID(as_uuid=True), nullable=False)
    head = db.Column(Boolean)
    version = db.Column(Float, nullable=False)
    comment = db.Column(db.String(255))

    # relations
    user = relationship("User", lazy='subquery', back_populates="results")
    result_set = relationship("ResultSet", lazy='subquery',
                              secondary=association_result_resultSet, back_populates="results")
    sample = relationship("Sample", lazy='subquery',  back_populates="results")
    methodSet = relationship("MethodSet", lazy='subquery',  back_populates="results")

    def __init__(
            self, id: uuid, name: str, user: User, peaks: str, deconData: str, tics: str, sample: Sample,
            methodSet: MethodSet, vid: str):
        self.name = name
        self.user = user
        self.id = id
        self.created = dt.now(datetime.timezone.utc).isoformat()
        self.peaks = peaks
        self.sample = sample
        self.methodSet = methodSet
        self.tics = tics
        self.vid = vid
        self.head = True
        self.deconData = deconData
        self.version = 0.1

    def as_dict(self):
        out = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        out["user"] = self.user.as_dict() if self.user else {}
        out["methodset"] = self.methodSet.as_dict() if self.methodSet else None
        out["sid"] = self.sample.id if self.sample else ""
        resultSetIds = [x.id for x in self.result_set]
        out["rsid"] = resultSetIds[0] if len(resultSetIds) > 0 else ""
        return out

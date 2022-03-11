from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from datetime import datetime as dt
import datetime
from sqlalchemy.sql.sqltypes import Boolean, Float

from . import db, association_method_methodSet, User


class MethodSet(db.Model):
    """ Method Model for storing method related details """
    __tablename__ = "method_set"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created = db.Column(db.DateTime, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    uid = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    # version control
    vid = db.Column(UUID(as_uuid=True), nullable=False)
    head = db.Column(Boolean)
    version = db.Column(Float, nullable=False)
    comment = db.Column(db.String(255), nullable=False)
    # relations
    user = relationship("User", back_populates="methodSets", lazy='subquery')
    methods = relationship("Method", secondary=association_method_methodSet,
                           back_populates="methodSet")
    samples = relationship("Sample", back_populates="methodSet")
    results = relationship("Results", back_populates="methodSet")

    def __init__(self, name: str, user: User, vid: str):
        self.name = name
        self.user = user
        self.vid = vid
        self.created = dt.now(datetime.timezone.utc).isoformat()
        self.head = True
        self.version = 0.1
        self.comment = ""

    def as_dict(self):
        out = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        out["methods"] = [x.as_dict() for x in self.methods]
        out["user"] = self.user.as_dict() if self.user else None
        return out

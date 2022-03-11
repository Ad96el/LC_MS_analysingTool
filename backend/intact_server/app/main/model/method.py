from sqlalchemy.sql.sqltypes import Boolean, Float
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from datetime import datetime as dt
import datetime

from . import db, association_method_methodSet, User


class Method(db.Model):
    """ Method Model for storing method related details """
    __tablename__ = "method"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created = db.Column(db.DateTime, nullable=False)
    type = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    uid = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    calculations = db.Column(db.Text(), nullable=False)
    components = db.Column(db.Text(), nullable=False)
    # version controll
    comment = db.Column(db.String(255), nullable=False)
    vid = db.Column(UUID(as_uuid=True), nullable=False)
    head = db.Column(Boolean, nullable=False)
    version = db.Column(Float, nullable=False)

    # relations
    user = relationship("User", back_populates="methods")
    methodSet = relationship("MethodSet", secondary=association_method_methodSet,
                             back_populates="methods")

    def __init__(self, type: str, name: str, user: User, vid: str, components: str, calculations: str):
        self.type = type
        self.name = name
        self.user = user
        self.vid = vid
        self.created = dt.now(datetime.timezone.utc).isoformat()
        self.version = 0.1
        self.head = True
        self.comment = ""
        self.components = components
        self.calculations = calculations

    def as_dict(self):
        out = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        out["user"] = self.user.as_dict()
        return out

from datetime import datetime as dt
import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid
import hashlib
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import Boolean, SmallInteger

from . import db


class User(db.Model):
    """ User Model for storing user related details """
    __tablename__ = "users"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created = db.Column(db.DateTime, nullable=False)
    role = db.Column(SmallInteger, nullable=False)
    approved = db.Column(Boolean, nullable=False)

    # relations
    projects = relationship("Project", back_populates="user")
    sampleSets = relationship("SampleSet", back_populates="user")
    samples = relationship("Sample", back_populates="user")
    methods = relationship("Method", back_populates="user")
    methodSets = relationship("MethodSet", back_populates="user")
    results = relationship("Results", back_populates="user")
    result_set = relationship("ResultSet", back_populates="user")

    def __init__(self, email, password):
        self.email = email
        self.password = hashlib.sha256(password.encode("utf-8")).hexdigest()
        self.created = dt.now(datetime.timezone.utc).isoformat()
        self.approved = False
        self.role = 1

    def validate_password(self, password):
        hashedPwd = hashlib.sha256(password.encode("utf-8")).hexdigest()
        if(hashedPwd == self.password):
            return True
        return False

    def setPassword(self, password):
        hasedpwd = hashlib.sha256(password.encode("utf-8")).hexdigest()
        self.password = hasedpwd

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    def as_dictJWT(self):
        out = {}
        out["email"] = self.email
        out["role"] = self.role
        out["id"] = self.id
        return out

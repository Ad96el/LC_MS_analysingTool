from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from datetime import datetime as dt
import datetime

from . import db, association_modification_modificationset


class ModificationSet(db.Model):
    """ Method Model for storing method related details """
    __tablename__ = "modification_set"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created = db.Column(db.DateTime, nullable=False)
    name = db.Column(db.String(255), nullable=False)

    # relations
    modifications = relationship("Modification", secondary=association_modification_modificationset,
                                 back_populates="modifications_set")

    def __init__(self, name: str, modifications):
        self.name = name
        self.created = dt.now(datetime.timezone.utc).isoformat()
        self.modifications = modifications

    def as_dict(self):
        out = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        out["modifications"] = [x.as_dict() for x in self.modifications]
        return out

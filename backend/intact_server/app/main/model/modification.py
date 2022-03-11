from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from datetime import datetime as dt
import datetime

from . import db, association_modification_modificationset


class Modification(db.Model):
    """ Modification Model for storing method related details """
    __tablename__ = "modification"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    formula_add = db.Column(db.String(255), nullable=False)
    kind = db.Column(db.String(255), nullable=False)
    formula_sub = db.Column(db.String(255))
    mass = db.Column(db.Float, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    created = db.Column(db.DateTime, nullable=False)
    # relations
    modifications_set = relationship("ModificationSet", secondary=association_modification_modificationset,
                                     back_populates="modifications")

    def __init__(self, formula_add: str, formula_sub: str,  mass: float, name: str, kind: str):
        self.formula_add = formula_add
        self.formula_sub = formula_sub
        self.mass = mass
        self.created = dt.now(datetime.timezone.utc).isoformat()
        self.name = name
        self.kind = kind

    def as_dict(self):
        out = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        return out

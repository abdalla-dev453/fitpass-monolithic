from extensions import db


class Studio(db.Model):
    __tablename__ = "studios"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    source = db.Column(db.String, default="internal")   
    external_place_id = db.Column(db.String, unique=True, nullable=True)
    claimed_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    classes = db.relationship("FitnessClass", back_populates="studio", lazy="dynamic")

    def __repr__(self):
        return f"<Studio {self.name}>"

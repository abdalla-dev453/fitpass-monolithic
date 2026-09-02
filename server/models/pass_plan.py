from extensions import db


class PassPlan(db.Model):
    __tablename__ = "pass_plans"

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String, unique=True, nullable=False)  # "10-pack"
    name = db.Column(db.String, nullable=False)
    credits = db.Column(db.Integer, nullable=False)
    price_cents = db.Column(db.Integer, nullable=False)  # never store money as float
    duration_days = db.Column(db.Integer, nullable=False)
    active = db.Column(db.Boolean, default=True, nullable=False)

    def __repr__(self):
        return f"<PassPlan {self.key}>"

    def to_dict(self):
        return {
            "key": self.key,
            "name": self.name,
            "credits": self.credits,
            "price": round(self.price_cents / 100, 2),
            "duration_days": self.duration_days,
        }

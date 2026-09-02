from enum import unique

from extensions import db


class PassPlan(db.Model):
    __tablename__ = "pass_plans"

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String, unique=True)
    name = db.Column(db.String)
    credits = db.Column(db.Integer)
    price_cents = db.Column(db.Integer)            
    duration_days = db.Column(db.Integer)
    active = db.Column(db.Boolean, default=True)
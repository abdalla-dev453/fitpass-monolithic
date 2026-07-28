from datetime import datetime
from extensions import db


class Pass(db.Model):
    """A purchased credit pass owned by a user.

    The old project split this into two tables: a MembershipPass "catalog"
    of plan options, and a PurchasedPass row per purchase. Since the catalog
    never changed per-request, the plan options now live as constants in
    PassController and each purchase just snapshots the plan's details here.
    """
    __tablename__ = "passes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    plan_name = db.Column(db.String(80), nullable=False)
    credits = db.Column(db.Integer, nullable=False)
    remaining_credits = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)

    purchased_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)

    user = db.relationship("User", back_populates="passes")

    def __repr__(self):
        return f"<Pass {self.plan_name} user_id={self.user_id} remaining={self.remaining_credits}>"
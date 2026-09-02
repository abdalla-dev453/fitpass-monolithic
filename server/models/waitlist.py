from datetime import datetime
from extensions import db


class WaitlistEntry(db.Model):
    """A user waiting for a spot in a fitness class that was full at booking time."""

    __tablename__ = "waitlist_entries"
    __table_args__ = (
        db.UniqueConstraint("user_id", "class_id", name="uq_waitlist_user_class"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey("fitness_classes.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    notified_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship("User")
    fitness_class = db.relationship("FitnessClass")

    def __repr__(self):
        return f"<WaitlistEntry user={self.user_id} class={self.class_id}>"

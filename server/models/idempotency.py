from datetime import datetime
from extensions import db


class IdempotencyKey(db.Model):
    """Records a client-supplied Idempotency-Key so a retried POST
    (double-click, flaky connection, client retry logic) can't create a
    duplicate booking or a duplicate pass purchase.
    """

    __tablename__ = "idempotency_keys"

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(128), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    scope = db.Column(db.String(64), nullable=False)  # e.g. "booking", "pass_purchase"
    response_body = db.Column(db.JSON, nullable=False)
    response_status = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("key", "user_id", "scope", name="uq_idempotency_key_user_scope"),
    )

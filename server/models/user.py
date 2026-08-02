from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)

    # Profile fields folded directly into User 
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    waiver_signed = db.Column(db.Boolean, default=False, nullable=False)

    role = db.Column(db.String(20), nullable=False, default="client")  # client, trainer, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    trainer_profile = db.relationship(
        "Trainer", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    passes = db.relationship("Pass", back_populates="user", lazy="dynamic")
    bookings = db.relationship("Booking", back_populates="user", lazy="dynamic")


    # functions for setting and checking password
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role}>"


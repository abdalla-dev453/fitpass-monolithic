from datetime import datetime
from extensions import db


class FoodLog(db.Model):
    # FIX: no __tablename__ meant SQLAlchemy defaulted to "food_log" while
    # the FK below pointed at "food_items" (now correctly matched to
    # FoodItem's __tablename__) -- previously it pointed at a table that
    # never existed, which breaks table creation and any migration.
    __tablename__ = "food_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    food_item_id = db.Column(db.Integer, db.ForeignKey("food_items.id"), nullable=False)
    quantity_g = db.Column(db.Float, nullable=False)
    meal_type = db.Column(db.String, nullable=False)  # breakfast | lunch | dinner | snack
    logged_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    user = db.relationship("User", back_populates="food_logs")
    food_item = db.relationship("FoodItem", back_populates="logs")

    def __repr__(self):
        return f"<FoodLog user={self.user_id} food={self.food_item_id} {self.quantity_g}g>"
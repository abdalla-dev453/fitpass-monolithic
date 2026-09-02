from extensions import db
from datetime import datetime


class FoodLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    food_item_id = db.Column(db.Integer, db.ForeignKey("food_items.id"))
    quantity_g = db.Column(db.Float)
    meal_type = db.Column(db.String)          # "breakfast" | "lunch" | "dinner" | "snack"
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)
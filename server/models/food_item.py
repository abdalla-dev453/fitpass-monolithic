from extensions import db


class FoodItem(db.Model):
    __tablename__ = "food_items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, index=True)
    calories_per_100g = db.Column(db.Float, nullable=False, default=0)
    protein_g = db.Column(db.Float, nullable=False, default=0)
    carbs_g = db.Column(db.Float, nullable=False, default=0)
    fat_g = db.Column(db.Float, nullable=False, default=0)
    # FIX: source table was never given a unique constraint, so repeat
    # lookups of the same USDA/Edamam record would insert duplicate rows
    # instead of reusing the cached one.
    external_source_id = db.Column(db.String, unique=True, nullable=True)

    logs = db.relationship("FoodLog", back_populates="food_item", lazy="dynamic")

    def __repr__(self):
        return f"<FoodItem {self.name}>"

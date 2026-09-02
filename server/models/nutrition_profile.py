from extensions import db


class NutritionProfile(db.Model):
    __tablename__ = "nutrition_profiles"

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    goal = db.Column(db.String, nullable=False, default="maintain")  # lose | maintain | gain | recomp
    daily_calorie_target = db.Column(db.Integer)
    protein_target_g = db.Column(db.Integer)
    carbs_target_g = db.Column(db.Integer)
    fat_target_g = db.Column(db.Integer)
    dietary_restrictions = db.Column(db.JSON, default=list)  # e.g. ["vegetarian", "gluten-free"]

    user = db.relationship("User", back_populates="nutrition_profile")

    def __repr__(self):
        return f"<NutritionProfile user={self.user_id} goal={self.goal}>"

from extensions import db


class NutritionProfile(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    goal = db.Column(db.String)              # "lose", "maintain", "gain", "recomp"
    daily_calorie_target = db.Column(db.Integer)
    protein_target_g = db.Column(db.Integer)
    carbs_target_g = db.Column(db.Integer)
    fat_target_g = db.Column(db.Integer)
    dietary_restrictions = db.Column(db.JSON) 
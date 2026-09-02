from marshmallow import fields, validate
from extensions import ma
from models.nutrition_profile import NutritionProfile
from models.food_item import FoodItem
from models.food_log import FoodLog


class NutritionProfileSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = NutritionProfile
        load_instance = False
        include_fk = True

    goal = fields.String(validate=validate.OneOf(["lose", "maintain", "gain", "recomp"]))


class UpdateNutritionProfileSchema(ma.Schema):
    goal = fields.String(validate=validate.OneOf(["lose", "maintain", "gain", "recomp"]))
    daily_calorie_target = fields.Integer(validate=validate.Range(min=0))
    protein_target_g = fields.Integer(validate=validate.Range(min=0))
    carbs_target_g = fields.Integer(validate=validate.Range(min=0))
    fat_target_g = fields.Integer(validate=validate.Range(min=0))
    dietary_restrictions = fields.List(fields.String())


class FoodItemSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = FoodItem
        load_instance = False


class FoodLogSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = FoodLog
        load_instance = False
        include_fk = True

    food_item = fields.Nested(FoodItemSchema)


class CreateFoodLogSchema(ma.Schema):
    food_item_id = fields.Integer(required=True)
    quantity_g = fields.Float(required=True, validate=validate.Range(min=0.1))
    meal_type = fields.String(
        required=True, validate=validate.OneOf(["breakfast", "lunch", "dinner", "snack"])
    )


nutrition_profile_schema = NutritionProfileSchema()
update_nutrition_profile_schema = UpdateNutritionProfileSchema()
food_item_schema = FoodItemSchema()
food_items_schema = FoodItemSchema(many=True)
food_log_schema = FoodLogSchema()
food_logs_schema = FoodLogSchema(many=True)
create_food_log_schema = CreateFoodLogSchema()

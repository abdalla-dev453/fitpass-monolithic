from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from controllers.nutrition_controller import NutritionController
from schemas.nutrition_schema import (
    nutrition_profile_schema,
    update_nutrition_profile_schema,
    food_items_schema,
    food_log_schema,
    food_logs_schema,
    create_food_log_schema,
)

nutrition_bp = Blueprint("nutrition_bp", __name__)


@nutrition_bp.get("/profile")
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    profile = NutritionController.get_or_create_profile(user_id)
    return jsonify(nutrition_profile_schema.dump(profile)), 200


@nutrition_bp.put("/profile")
@jwt_required()
def update_profile():
    json_data = request.get_json(silent=True)
    try:
        data = update_nutrition_profile_schema.load(json_data, partial=True)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "messages": err.messages}), 422

    user_id = int(get_jwt_identity())
    profile = NutritionController.update_profile(user_id, data)
    return jsonify(nutrition_profile_schema.dump(profile)), 200


@nutrition_bp.get("/foods/search")
@jwt_required()
def search_foods():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"error": "q query parameter is required"}), 400
    results = NutritionController.search_foods(query)
    return jsonify(food_items_schema.dump(results)), 200


@nutrition_bp.post("/logs")
@jwt_required()
def create_log():
    json_data = request.get_json(silent=True)
    try:
        data = create_food_log_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "messages": err.messages}), 422

    user_id = int(get_jwt_identity())
    entry, error = NutritionController.log_food(
        user_id, data["food_item_id"], data["quantity_g"], data["meal_type"]
    )
    if error:
        return jsonify({"error": error}), 400
    return jsonify(food_log_schema.dump(entry)), 201


@nutrition_bp.get("/logs")
@jwt_required()
def get_logs():
    date_param = request.args.get("date")
    try:
        date = datetime.strptime(date_param, "%Y-%m-%d") if date_param else datetime.utcnow()
    except ValueError:
        return jsonify({"error": "date must be YYYY-MM-DD"}), 400

    user_id = int(get_jwt_identity())
    logs = NutritionController.get_logs_for_date(user_id, date)
    return jsonify(food_logs_schema.dump(logs)), 200


@nutrition_bp.get("/summary")
@jwt_required()
def get_summary():
    range_param = request.args.get("range", "week")
    days = {"week": 7, "month": 30}.get(range_param, 7)

    user_id = int(get_jwt_identity())
    summary = NutritionController.summary(user_id, days=days)
    return jsonify(summary), 200


@nutrition_bp.get("/plan")
@jwt_required()
def get_meal_plan():
    meal_count = request.args.get("meals", default=3, type=int)
    user_id = int(get_jwt_identity())
    plan, error = NutritionController.suggest_meal_plan(user_id, meal_count=meal_count)
    if error:
        return jsonify({"error": error}), 400
    return jsonify({"plan": plan}), 200
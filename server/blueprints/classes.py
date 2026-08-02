from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from controllers.class_controller import ClassController
from schemas.class_schema import class_schema, classes_schema
from schemas.class_category_schema import categories_schema
from blueprints.decorators import admin_required
from models import fitness_class

classes_bp = Blueprint("classes_bp", __name__)

@classes_bp.route("/", methods=["GET"])
def get_classes():
    classes = ClassController.search_classes(
        studio_id=request.args.get("studio_id", type=int),
        category_id=request.args.get("category_id", type=int),
        trainer_id=request.args.get("trainer_id", type=int),
        q=request.args.get("q"),
    )
    return jsonify(classes_schema.dump(classes)), 200


@classes_bp.route("/categories", methods=["GET"])
def get_categories():
    categories = ClassController.get_categories()
    return jsonify(categories_schema.dump(categories)), 200


@classes_bp.route("/<int:class_id>", methods=["GET"])
def get_class(class_id):
    fitness_class =  ClassController.get_class_by_id(class_id)
    if not fitness_class:
        return jsonify({"error": "Class not found"}), 404
    return jsonify(class_schema.dump(fitness_class)), 200


# create a new class -> Admin access only
@classes_bp.route("/", methods=["POST"])
@admin_required
def create_class():
    json_data = request.get_json(silent=True)
    try:
        loaded_data = class_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "messages": err.messages}), 422

    fitness_class = ClassController.create_class(loaded_data)
    return jsonify({
        "message": "Class created successfully",
        "data": class_schema.dump(fitness_class)
    }), 201

from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from controllers.class_controller import ClassController
from schemas.class_schema import class_schema, classes_schema
from schemas.class_category_schema import categories_schema
from blueprints.decorators import admin_required, roles_required
from flask_jwt_extended import get_jwt_identity, get_jwt
from models.trainer import Trainer

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


# Administrators can create any class; trainers may create only their own.
@classes_bp.route("/", methods=["POST"])
@roles_required("admin", "trainer")
def create_class():
    json_data = request.get_json(silent=True) or {}
    if get_jwt().get("role") == "trainer":
        trainer = Trainer.query.filter_by(user_id=int(get_jwt_identity())).first()
        if not trainer:
            return jsonify({"error": "Trainer profile not found."}), 403
        # Set the owner before validation; trainer_id is required by the model.
        json_data["trainer_id"] = trainer.id
    try:
        loaded_data = class_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "messages": err.messages}), 422

    fitness_class = ClassController.create_class(loaded_data)
    return jsonify({
        "message": "Class created successfully",
        "data": class_schema.dump(fitness_class)
    }), 201


@classes_bp.route("/<int:class_id>", methods=["PUT"])
@roles_required("admin", "trainer")
def update_class(class_id):
    fitness_class = ClassController.get_class_by_id(class_id)
    if not fitness_class:
        return jsonify({"error": "Class not found"}), 404
    if get_jwt().get("role") == "trainer" and fitness_class.trainer.user_id != int(get_jwt_identity()):
        return jsonify({"error": "Trainers can only manage their own classes."}), 403
    try:
        data = class_schema.load(request.get_json(silent=True), partial=True)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "messages": err.messages}), 422
    if get_jwt().get("role") == "trainer":
        data.trainer_id = fitness_class.trainer_id
    return jsonify({"data": class_schema.dump(ClassController.update_class(fitness_class, data.__dict__))}), 200


@classes_bp.route("/<int:class_id>", methods=["DELETE"])
@roles_required("admin", "trainer")
def delete_class(class_id):
    fitness_class = ClassController.get_class_by_id(class_id)
    if not fitness_class:
        return jsonify({"error": "Class not found"}), 404
    if get_jwt().get("role") == "trainer" and fitness_class.trainer.user_id != int(get_jwt_identity()):
        return jsonify({"error": "Trainers can only manage their own classes."}), 403
    try:
        ClassController.delete_class(fitness_class)
    except ValueError:
        return jsonify({"error": "Classes with bookings cannot be deleted."}), 409
    return "", 204

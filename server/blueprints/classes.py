from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from extensions import db
from controllers.class_controller import ClassController
from controllers.booking_controller import BookingController
from schemas.class_schema import class_schema, classes_schema
from schemas.class_category_schema import categories_schema
from schemas.booking_schema import booking_schema, bookings_schema
from blueprints.decorators import admin_required, roles_required
from flask_jwt_extended import get_jwt_identity, get_jwt
from models.trainer import Trainer
from models.booking import Booking
from models.user import User

classes_bp = Blueprint("classes_bp", __name__)

@classes_bp.route("/", methods=["GET"])
def get_classes():
    page = request.args.get("page", type=int)
    per_page = request.args.get("per_page", type=int)
    classes = ClassController.search_classes(
        studio_id=request.args.get("studio_id", type=int),
        category_id=request.args.get("category_id", type=int),
        trainer_id=request.args.get("trainer_id", type=int),
        q=request.args.get("q"),
        page=page,
        per_page=per_page,
    )
    if isinstance(classes, dict):
        return jsonify({
            **classes,
            "items": classes_schema.dump(classes["items"]),
        }), 200
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


@classes_bp.route("/<int:class_id>/bookings", methods=["GET"])
@roles_required("admin", "trainer")
def get_class_bookings(class_id):
    fitness_class = ClassController.get_class_by_id(class_id)
    if not fitness_class:
        return jsonify({"error": "Class not found"}), 404
    if get_jwt().get("role") == "trainer" and fitness_class.trainer.user_id != int(get_jwt_identity()):
        return jsonify({"error": "Trainers can only view bookings for their own classes."}), 403
    bookings = Booking.query.filter_by(class_id=class_id).order_by(Booking.booked_at.asc()).all()
    return jsonify(bookings_schema.dump(bookings)), 200


@classes_bp.route("/<int:class_id>/bookings", methods=["POST"])
@roles_required("admin", "trainer")
def add_member_to_class(class_id):
    fitness_class = ClassController.get_class_by_id(class_id)
    if not fitness_class:
        return jsonify({"error": "Class not found"}), 404
    if get_jwt().get("role") == "trainer" and fitness_class.trainer.user_id != int(get_jwt_identity()):
        return jsonify({"error": "Trainers can only manage bookings for their own classes."}), 403
    json_data = request.get_json(silent=True) or {}
    email = json_data.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required."}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": f"No user registered with email {email}."}), 404
    if BookingController.already_booked(user.id, class_id):
        return jsonify({"error": "User is already booked for this class."}), 400
    if fitness_class.bookings.count() >= fitness_class.capacity:
        return jsonify({"error": "This class is at maximum capacity."}), 400
    booking = Booking(user_id=user.id, class_id=class_id)
    db.session.add(booking)
    db.session.commit()
    return jsonify({
        "message": "Member added to class successfully",
        "booking": booking_schema.dump(booking)
    }), 201


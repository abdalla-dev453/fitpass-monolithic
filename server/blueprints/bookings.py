from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from controllers.booking_controller import BookingController
from schemas.booking_schema import booking_schema, bookings_schema, create_booking_schema


bookings_bp = Blueprint("bookings_bp", __name__)

@bookings_bp.route("/", methods=["GET"])
@jwt_required()
def get_my_bookings():
    user_id = get_jwt_identity()
    user_bookings = BookingController.get_user_bookings(user_id)
    return jsonify(bookings_schema.dump(user_bookings)), 200

@bookings_bp.route("", methods=["POST"])
@jwt_required()
def create_booking():
    json_data = request.get_json(silent=True)
    try:
        data = create_booking_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "messages": err.messages}), 422

    user_id = get_jwt_identity()
    booking, error = BookingController.create_booking(user_id, data["class_id"])
    if error:
        return jsonify({"error": error}), 400
    return jsonify({
        "message": "Booking created successfully",
        "booking": booking_schema.dump(booking)
    }), 201

@bookings_bp.route("/<int:booking_id>/cancel", methods=["POST"])
@jwt_required()
def cancel_booking(booking_id):
    success = BookingController.cancel_booking(get_jwt_identity(), booking_id)
    if not success:
        return jsonify({"error": "Could not cancel booking"}), 400
    return jsonify({"message": "Booking canceled successfully"}), 200

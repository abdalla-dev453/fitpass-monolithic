from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from marshmallow import ValidationError

from extensions import db
from models.booking import Booking
from models.waitlist import WaitlistEntry
from controllers.booking_controller import BookingController
from schemas.booking_schema import booking_schema, bookings_schema, create_booking_schema
from utils.idempotency import idempotent
from blueprints.decorators import roles_required


bookings_bp = Blueprint("bookings_bp", __name__)

@bookings_bp.route("/", methods=["GET"])
@jwt_required()
def get_my_bookings():
    user_id = get_jwt_identity()
    user_bookings = BookingController.get_user_bookings(user_id)
    return jsonify(bookings_schema.dump(user_bookings)), 200

@bookings_bp.route("/", methods=["POST"])
@jwt_required()
@idempotent("booking_create")
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

@bookings_bp.route("/<int:booking_id>/review", methods=["POST"])
@jwt_required()
def review_booking(booking_id):
    user_id = int(get_jwt_identity())
    booking = BookingController.get_booking(booking_id, user_id)
    if not booking:
        return jsonify({"error": "Booking not found."}), 404
    json_data = request.get_json(silent=True) or {}
    rating = json_data.get("rating")
    if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be an integer between 1 and 5."}), 400
    review_text = json_data.get("review_text", "").strip()
    updated = BookingController.submit_review(booking, rating, review_text)
    return jsonify({
        "message": "Review submitted successfully.",
        "booking": booking_schema.dump(updated)
    }), 200

@bookings_bp.route("/<int:booking_id>", methods=["DELETE"])
@roles_required("admin", "trainer")
def delete_booking(booking_id):
    booking = db.session.get(Booking, booking_id)
    if not booking:
        return jsonify({"error": "Booking not found."}), 404
    if get_jwt().get("role") == "trainer":
        if booking.fitness_class.trainer.user_id != int(get_jwt_identity()):
            return jsonify({"error": "Trainers can only manage bookings for their own classes."}), 403
    BookingController.cancel_booking(booking.user_id, booking.id)
    return jsonify({"message": "Booking removed successfully."}), 200

@bookings_bp.route("/waitlist", methods=["GET"])
@jwt_required()
def get_my_waitlist():
    user_id = int(get_jwt_identity())
    entries = WaitlistEntry.query.filter_by(user_id=user_id).order_by(WaitlistEntry.created_at.desc()).all()
    return jsonify([{
        "id": entry.id,
        "class_id": entry.class_id,
        "class_title": entry.fitness_class.title if entry.fitness_class else "Unknown Class",
        "start_time": entry.fitness_class.start_time.isoformat() if entry.fitness_class else None,
        "studio_name": entry.fitness_class.studio.name if entry.fitness_class and entry.fitness_class.studio else "HQ Studio",
        "created_at": entry.created_at.isoformat() if entry.created_at else None,
        "notified_at": entry.notified_at.isoformat() if entry.notified_at else None,
    } for entry in entries]), 200

@bookings_bp.route("/waitlist/<int:waitlist_id>", methods=["DELETE"])
@jwt_required()
def leave_waitlist(waitlist_id):
    user_id = int(get_jwt_identity())
    entry = WaitlistEntry.query.filter_by(id=waitlist_id, user_id=user_id).first()
    if not entry:
        return jsonify({"error": "Waitlist entry not found."}), 404
    db.session.delete(entry)
    db.session.commit()
    return jsonify({"message": "Removed from waitlist successfully."}), 200


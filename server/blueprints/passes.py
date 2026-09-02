from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from controllers.pass_controller import PassController
from schemas.pass_schema import pass_schema, passes_schema, purchase_pass_schema
from utils.idempotency import idempotent

passes_bp = Blueprint("passes_bp", __name__)

@passes_bp.route("/plans", methods=["GET"])
def get_pass_plans():
    return jsonify(PassController.list_plans()), 200

@passes_bp.route("/my-passes", methods=["GET"])
@jwt_required()
def get_my_passes():
    user_id = get_jwt_identity()
    user_passes = PassController.get_user_passes(user_id)
    return jsonify(passes_schema.dump(user_passes, many=True)), 200


@passes_bp.route("/purchase", methods=["POST"])
@jwt_required()
@idempotent("pass_purchase")
def purchase_pass():
    # A retried request (double-click, client retry after a timeout) that
    # sends the same Idempotency-Key header replays the original response
    # via @idempotent instead of creating a second Pass row / double-charge.
    json_data = request.get_json(silent=True)
    try:
        data = purchase_pass_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "messages": err.messages}), 422

    user_id = get_jwt_identity()
    purchased_pass = PassController.purchase_plan(user_id, data["plan_key"])
    if not purchased_pass:
        return jsonify({"error": "Unknown pass plan"}), 400
    return jsonify({
        "message": "Pass purchased successfully",
        "pass": pass_schema.dump(purchased_pass)
    }), 201
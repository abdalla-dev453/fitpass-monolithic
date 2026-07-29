from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from controllers.pass_controller import PassController
from schemas.pass_schema import pass_schema, passes_schema

passes_bp = Blueprint("passes_bp", __name__)

@passes_bp.route("/plans", methods=["GET"])
def get_pass_plans():
    return jsonify(PassController.list_plans()), 200

@passes_bp.route("my-passes/", methods=["GET"])
@jwt_required()
def get_my_passes():
    user_id = get_jwt_identity()
    user_passes = PassController.get_passes_by_user_id(user_id)
    return jsonify(passes_schema.dump(user_passes)), 200


@passes_bp.route("/purchase", methods=["POST"])
@jwt_required()
def purchase_pass():
    json_data = request.get_json()
    try:
        data = pass_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "messages": err.messages}), 422

    user_id = get_jwt_identity()
    purchased_pass = PassController.purchase_pass(user_id, data)
    return jsonify({
        "message": "Pass purchased successfully",
        "pass": pass_schema.dump(purchased_pass)
    }), 201
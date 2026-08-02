from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token,jwt_required, get_jwt_identity
from controllers.user_controller import UserController
from schemas.user_schema import user_schema, register_schema, login_schema
from marshmallow import ValidationError

auth_bp = Blueprint("auth_bp", __name__)

# Register new user
@auth_bp.route("/register", methods=["POST"])
def register():
    json_data = request.get_json()
    try:
        data = register_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "messages": err.messages}), 400

    if UserController.email_taken(data["email"]):
        return jsonify({"error": "Email already taken"}), 400

    user = UserController.register_user(data)
    token = create_access_token(
        identity=str(user.id), 
        additional_claims={"role": user.role})
    return jsonify({
        "message": "User registered successfully",
        "access_token": token,
        "user": user_schema.dump(user)
    }), 201


# Login user
@auth_bp.route("/login", methods=["POST"])
def login():
    json_data = request.get_json()
    try:
        data = login_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "messages": err.messages}), 422

    user = UserController.authenticate_user(data["email"], data["password"])
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(
        identity=str(user.id), 
        additional_claims={"role": user.role})
    return jsonify({
        "message": "User logged in successfully",
        "access_token": token,
        "user": user_schema.dump(user)
    }), 200


# Get current user
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user = UserController.get_user_by_id(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User account no longer exists."}), 404
    return jsonify({"user": user_schema.dump(user)}), 200
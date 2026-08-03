from flask import Blueprint, request, jsonify
from controllers.studio_controller import StudioController
from schemas.studio_schema import studio_schema, studios_schema
from schemas.class_schema import classes_schema
from blueprints.decorators import admin_required
from marshmallow import ValidationError

studios_bp = Blueprint("studios_bp", __name__)

# Get all studios
@studios_bp.route("/", methods=["GET"])
def get_studios():
    studios = StudioController.get_all_studios(request.args.get("location"))
    return jsonify(studios_schema.dump(studios)), 200

@studios_bp.route("/<int:studio_id>", methods=["GET"])
def get_studio(studio_id):
    studio = StudioController.get_studio_by_id(studio_id)
    if not studio:
        return jsonify({"error": "Studio not found"}), 404
    return jsonify(studio_schema.dump(studio)), 200

@studios_bp.route("/<int:studio_id>/schedule", methods=["GET"])
def get_studio_schedule(studio_id):
    studio = StudioController.get_studio_by_id(studio_id)
    if not studio:
        return jsonify({"error": "Studio not found"}), 404
    classes = StudioController.get_upcoming_schedule(studio_id)
    return jsonify({
        "studio": studio_schema.dump(studio),
        "classes": classes_schema.dump(classes)
    }), 200


@studios_bp.route("/", methods=["POST"])
@admin_required
def create_studio():
    try:
        studio = studio_schema.load(request.get_json(silent=True))
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "messages": err.messages}), 422
    return jsonify({"data": studio_schema.dump(StudioController.create_studio(studio))}), 201


@studios_bp.route("/<int:studio_id>", methods=["PUT"])
@admin_required
def update_studio(studio_id):
    studio = StudioController.get_studio_by_id(studio_id)
    if not studio:
        return jsonify({"error": "Studio not found"}), 404
    try:
        data = studio_schema.load(request.get_json(silent=True), partial=True)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "messages": err.messages}), 422
    return jsonify({"data": studio_schema.dump(StudioController.update_studio(studio, data.__dict__))}), 200


@studios_bp.route("/<int:studio_id>", methods=["DELETE"])
@admin_required
def delete_studio(studio_id):
    studio = StudioController.get_studio_by_id(studio_id)
    if not studio:
        return jsonify({"error": "Studio not found"}), 404
    if not StudioController.delete_studio(studio):
        return jsonify({"error": "Remove or move this studio's classes before deleting it."}), 409
    return "", 204

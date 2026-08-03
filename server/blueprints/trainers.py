from flask import Blueprint, jsonify

from controllers.trainer_controller import TrainerController
from schemas.trainer_schema import trainers_schema
from blueprints.decorators import admin_required

trainers_bp = Blueprint("trainers_bp", __name__)


@trainers_bp.route("/", methods=["GET"])
@admin_required
def get_trainers():
    return jsonify(trainers_schema.dump(TrainerController.get_all_trainers())), 200

from flask import Blueprint, request, jsonify
from server.controllers.discovery_controller import DiscoveryController
from server.schemas import studio_schema

discovery_bp = Blueprint("discovery_bp", __name__)


@discovery_bp.get("/nearby")
def nearby():
    lat, lng = request.args.get("lat", type=float), request.args.get("lng", type=float)
    internal, external = DiscoveryController.nearby(lat, lng)
    return jsonify({
        "studios": studio_schema.dump(internal, many=True),
        "discovered": discovered_schema.dump(external, many=True),  # read-only shape
    })
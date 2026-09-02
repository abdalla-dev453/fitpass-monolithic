from flask import Blueprint, request, jsonify

# FIX: these two imports used a "server." prefix that doesn't match how
# every other blueprint in this codebase imports (see blueprints/passes.py,
# blueprints/bookings.py, etc. -- all import as `controllers.x`, not
# `server.controllers.x`). That prefix mismatch meant this module raised an
# ImportError the moment Flask tried to import it, which is why it was
# never registered in main.py at all.
from controllers.discovery_controller import DiscoveryController
from schemas.studio_schema import studios_schema
from schemas.discovery_schema import discovered_schema

discovery_bp = Blueprint("discovery_bp", __name__)


@discovery_bp.get("/nearby")
def nearby():
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)
    if lat is None or lng is None:
        return jsonify({"error": "lat and lng query parameters are required"}), 400

    radius_m = request.args.get("radius_m", default=5000, type=int)
    radius_m = max(500, min(radius_m, 20000))  # clamp to a sane 0.5-20km range

    internal, external = DiscoveryController.nearby(lat, lng, radius_m)

    return jsonify({
        "studios": studios_schema.dump(internal),
        # FIX: `discovered_schema` was referenced but never imported/defined
        # anywhere -- a guaranteed NameError on every request even once the
        # import path above was fixed.
        "discovered": discovered_schema.dump(external),
    }), 200
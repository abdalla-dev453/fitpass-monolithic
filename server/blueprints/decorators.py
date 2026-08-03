from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def admin_required(fn):
    """Restrict a route to users whose JWT carries the 'admin' role claim
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        if get_jwt().get('role') != "admin":
            return jsonify({"error": "Admin priviledges required"}), 403
        return fn(*args, **kwargs)
    return wrapper


def roles_required(*roles):
    """Require one of the supplied roles from the signed JWT claim."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            if get_jwt().get("role") not in roles:
                return jsonify({"error": "You do not have permission for this action."}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

from functools import wraps

from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity

from extensions import db
from models.idempotency_key import IdempotencyKey


def idempotent(scope: str):
    """Decorator for POST routes that must be safe to retry.

    If the client sends an `Idempotency-Key` header we've already seen for
    this user + scope, replay the stored response instead of re-running the
    handler (and therefore instead of double-booking / double-charging).
    Missing header = feature is opt-in per request, handler runs normally.
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            key = request.headers.get("Idempotency-Key")
            if not key:
                return fn(*args, **kwargs)

            user_id = int(get_jwt_identity())
            existing = IdempotencyKey.query.filter_by(
                key=key, user_id=user_id, scope=scope
            ).first()
            if existing:
                return jsonify(existing.response_body), existing.response_status

            response = fn(*args, **kwargs)
            body, status = response if isinstance(response, tuple) else (response, 200)
            payload = body.get_json() if hasattr(body, "get_json") else body

            record = IdempotencyKey(
                key=key,
                user_id=user_id,
                scope=scope,
                response_body=payload,
                response_status=status,
            )
            db.session.add(record)
            db.session.commit()
            return body, status

        return wrapper

    return decorator

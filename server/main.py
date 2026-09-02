import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from marshmallow import ValidationError

from extensions import db, jwt, cors, migrate, ma

# Import models so Flask-Migrate picks them up
from models import (
    user,
    studio,
    trainer,
    class_category,
    fitness_class,
    pass_model,
    booking,
)
from models.studio import Studio
from models.class_category import ClassCategory

# Import blueprints
from blueprints.auth import auth_bp
from blueprints.studios import studios_bp
from blueprints.classes import classes_bp
from blueprints.passes import passes_bp
from blueprints.bookings import bookings_bp
from blueprints.trainers import trainers_bp

load_dotenv()


def seed_default_data(app):
    with app.app_context():
        created = False

        if Studio.query.count() == 0:
            default_studios = [
                Studio(
                    name="Iron Pulse Lab (Downtown)",
                    location="789 Innovation Way, Suite A",
                    description="Premium high-energy facility equipped with modern turf yards, power racks, kettlebells, and heavy combat bags.",
                ),
                Studio(
                    name="Zen & Core Oasis (Uptown)",
                    location="432 Serenity Boulevard",
                    description="Sunlit boutique space engineered for targeted deep-core work, group athletic conditioning, and recovery flows.",
                ),
            ]
            db.session.add_all(default_studios)
            created = True

        if ClassCategory.query.count() == 0:
            default_categories = [
                ClassCategory(name="HIIT"),
                ClassCategory(name="Strength & Conditioning"),
                ClassCategory(name="Boxing"),
            ]
            db.session.add_all(default_categories)
            created = True

        if created:
            db.session.commit()


def create_app():
    app = Flask(__name__)

    app.url_map.strict_slashes = False

    # Configuration settings
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "fallback-secret")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-jwt-secret")

    # FIX: Normalize the database URL scheme. Some providers hand out
    # "postgres://" URLs, which SQLAlchemy 2.x rejects outright
    # (raises NoSuchModuleError). This guarantees we always use "postgresql://".
    db_url = os.getenv("DATABASE_URI", "sqlite:///fitpass.db")
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)

    # seed_default_data(app)

    # ONE SOURCE OF TRUTH CORS CONFIGURATION
    cors_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,https://fitpass-monolithic-t8u7.vercel.app",
    )
    allowed_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]

    # If the environment permits any origin for testing, disable credentials support.
    supports_credentials = True
    if "*" in allowed_origins:
        allowed_origins = ["*"]
        supports_credentials = False

    cors.init_app(
        app,
        resources={
            r"/*": {
                "origins": allowed_origins,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
                "expose_headers": ["Content-Type", "Authorization"],
            }
        },
        supports_credentials=supports_credentials,
    )

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(studios_bp, url_prefix="/studios")
    app.register_blueprint(classes_bp, url_prefix="/classes")
    app.register_blueprint(passes_bp, url_prefix="/passes")
    app.register_blueprint(bookings_bp, url_prefix="/bookings")
    # FIX: this blueprint was imported but never registered, so GET /trainers
    # always returned 404 in every environment.
    app.register_blueprint(trainers_bp, url_prefix="/trainers")

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(err):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(err):
        return jsonify({"error": "Internal server error"}), 500

    @app.errorhandler(ValidationError)
    def bad_request(err):
        return jsonify({"error": "Validation failed", "messages": err.messages}), 400

    # System Health check
    @app.route("/healthcheck")
    def healthcheck():
        return jsonify({"status": "online", "message": "FitPass API is active"}), 200

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)

import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from marshmallow import ValidationError

from extensions import db, jwt, cors, migrate, ma

# Import models so Flask-Migrate picks them up
import models.user         
import models.studio       
import models.trainer     
import models.class_category 
import models.fitness_class   
import models.pass_model   
import models.booking  

# Import blueprints
from blueprints.auth import auth_bp
from blueprints.studios import studios_bp
from blueprints.classes import classes_bp
from blueprints.passes import passes_bp
from blueprints.bookings import bookings_bp

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Configuration settings
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "fallback-secret")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-jwt-secret")
    database_uri = os.getenv("DATABASE_URI", "sqlite:///fitpass.db")
    # Render supplies Postgres URLs as `postgresql://...`. Explicitly select
    # Psycopg 3 (declared in requirements.txt) so SQLAlchemy does not try to
    # load the uninstalled legacy psycopg2 driver.
    if database_uri.startswith(("postgres://", "postgresql://")):
        database_uri = f"postgresql+psycopg://{database_uri.split('://', 1)[1]}"
    app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)

    # CORS origins must match the browser's Origin header exactly.  Keep the
    # deployed frontend URL in the default for a usable first deployment, and
    # configure CORS_ORIGINS in the hosting provider for other environments.
    allowed_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,https://fitpass-monolithic-t8u7.vercel.app",
    ).split(",")
    allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]
    cors.init_app(app, resources={r"/*": {"origins": allowed_origins}}, supports_credentials=True)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(studios_bp, url_prefix="/studios")
    app.register_blueprint(classes_bp, url_prefix="/classes")
    app.register_blueprint(passes_bp, url_prefix="/passes")
    app.register_blueprint(bookings_bp, url_prefix="/bookings")

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

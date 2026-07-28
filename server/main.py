import os
from functools import wraps
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from marshmallow import ValidationError
from flask_cors import CORS 

from extensions import db, jwt, cors, migrate, ma

# Import models so Flask-Migrate / SQLAlchemy metadata picks them up
from models.user import User          
from models.studio import Studio      
from models.trainer import Trainer    
from models.class_category import ClassCategory  
from models.fitness_class import FitnessClass    
from models.pass_model import Pass    
from models.booking import Booking    

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "fallback-secret")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-jwt-secret")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI", "sqlite:///fitpass.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize extensions
db.init_app(app)
jwt.init_app(app)
migrate.init_app(app, db)
ma.init_app(app)

# This permits your local React app (Vite defaults to port 5173) to read your API responses
CORS(app, resources={r"/*": {"origins": "*"}})

if __name__ == "__main__":
    app.run(debug=True)

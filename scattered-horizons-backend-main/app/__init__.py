from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config.update(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
        SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', 'sqlite:///scattered.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret'),
        JWT_TOKEN_LOCATION=['headers', 'cookies'],  # Allow both headers and cookies
        JWT_ACCESS_COOKIE_NAME='access_token',
        JWT_COOKIE_CSRF_PROTECT=False,  # Disable CSRF for development
        JWT_COOKIE_SECURE=False,  # Set to True in production
        JWT_ACCESS_TOKEN_EXPIRES=3600,
        JWT_COOKIE_SAMESITE='Lax',
        JWT_ERROR_MESSAGE_KEY="message"
    )

    # Add CORS headers to all responses
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        origin = request.headers.get('Origin')
        if origin in ['http://127.0.0.1:5500', 'http://localhost:5500']:
            response.headers.add('Access-Control-Allow-Origin', origin)
        return response

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)

    # Configure CORS with simpler settings
    CORS(app, 
        resources={
            r"/*": {
                "origins": ["http://127.0.0.1:5500", "http://localhost:5500"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True
            }
        }
    )

    @app.after_request
    def after_request(response):
        response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response

    # Handle OPTIONS requests
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = app.make_default_options_response()
            return response

    with app.app_context():
        from app.routes.auth import auth_bp
        from app.routes.index import index_bp
        
        app.register_blueprint(index_bp)
        app.register_blueprint(auth_bp)
        
        # Create database tables
        db.create_all()

    return app

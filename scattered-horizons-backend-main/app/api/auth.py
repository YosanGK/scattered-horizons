from flask import request, jsonify, make_response
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from app.models.user import User, db  # Update import to get db from models
import os
import pytz
from datetime import datetime
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import requests

def get_utc_timestamp():
    """Returns current UTC timestamp in ISO 8601 format."""
    return datetime.now(pytz.utc).isoformat()

def generate_jwt(user):
    """Generates JWT token for authentication."""
    return create_access_token(identity={"user_id": user.id, "email": user.email, "name": user.name})

@jwt_required()
def get_current_user():
    """Check if the user is logged in and return user info"""
    user_id = get_jwt_identity()  # Get user ID from JWT
    user = User.query.get(user_id)

    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    return jsonify({
        "status": "success",
        "user": {
            "name": user.name
        }
    }), 200

def google_login():
    """Authenticate user using Google OAuth2."""
    try:
        token = request.json.get("token")
        if not token:
            return jsonify({
                "status": "error",
                "message": "No token provided"
            }), 400

        # Fix the syntax error in the filter_by and add requests import
        id_info = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            os.getenv("GOOGLE_CLIENT_ID")
        )
        
        # Fix the email filter syntax
        user = User.query.filter_by(email=id_info["email"]).first()

        if not user:
            user = User(
                email=id_info["email"],
                name=id_info.get("name", ""),
                google_id=id_info["sub"],
                password=None  # Google users don't need password
            )
            db.session.add(user)
            db.session.commit()

        # Create access token with just the user ID
        access_token = create_access_token(identity=user.id)
        
        response = jsonify({
            "status": "success",
            "message": "Google login successful",
            "user": user.to_json()
        })

        # Set JWT cookie
        response.set_cookie(
            'access_token',
            access_token,
            httponly=True,
            secure=False,  # Set to True in production
            samesite='Lax',
            max_age=3600,
            path='/'
        )

        return response, 200

    except ValueError as e:
        print(f"Token verification error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Invalid token"
        }), 401
    except Exception as e:
        print(f"Google login error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Authentication failed"
        }), 500

def google_auth_callback():
    code = request.args.get('code')
    
    if not code:
        return make_response("""
            <script>
                window.opener.postMessage(
                    JSON.stringify({
                        status: 'error',
                        message: 'No authorization code received'
                    }), 
                    'http://127.0.0.1:5500'
                );
                window.close();
            </script>
        """)

    try:
        # Exchange code for tokens
        token_endpoint = 'https://oauth2.googleapis.com/token'
        data = {
            'code': code,
            'client_id': os.getenv('GOOGLE_CLIENT_ID'),
            'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
            'redirect_uri': os.getenv('GOOGLE_REDIRECT_URI'),
            'grant_type': 'authorization_code'
        }

        token_response = requests.post(token_endpoint, data=data)
        token_data = token_response.json()

        if 'error' in token_data:
            raise Exception(token_data['error_description'])

        # Verify the ID token
        idinfo = id_token.verify_oauth2_token(
            token_data['id_token'],
            requests.Request(),
            os.getenv('GOOGLE_CLIENT_ID')
        )

        # Create or update user
        user = User.query.filter_by(email=idinfo['email']).first()
        if not user:
            user = User(
                email=idinfo['email'],
                name=idinfo.get('name', 'Google User'),
                google_id=idinfo['sub'],
                password=None
            )
            db.session.add(user)
            db.session.commit()

        # Create JWT
        access_token = create_access_token(identity=user.id)

        response = make_response(f"""
            <script>
                window.opener.postMessage(
                    JSON.stringify({{
                        status: 'success',
                        user: {{
                            name: "{user.name}",
                            email: "{user.email}"
                        }}
                    }}), 
                    'http://127.0.0.1:5500'
                );
                window.close();
            </script>
        """)

        response.set_cookie(
            'access_token',
            access_token,
            httponly=True,
            secure=False,  # Set to True in production
            samesite='Lax',
            max_age=3600
        )

        return response

    except Exception as e:
        print(f"Google auth error: {str(e)}")
        return make_response(f"""
            <script>
                window.opener.postMessage(
                    JSON.stringify({{
                        status: 'error',
                        message: 'Authentication failed'
                    }}), 
                    'http://127.0.0.1:5500'
                );
                window.close();
            </script>
        """)

def register():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400

        # Validate required fields
        if not all(k in data for k in ["email", "password", "name"]):
            return jsonify({
                "status": "error",
                "message": "Missing required fields"
            }), 400

        # Check if user exists
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({
                "status": "error",
                "message": "Email already exists"
            }), 400

        # Create new user with password hash
        hashed_password = generate_password_hash(data["password"])
        new_user = User(
            email=data["email"],
            password=hashed_password,
            name=data["name"]
        )

        try:
            db.session.add(new_user)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise Exception("Database error occurred")

        # Generate access token
        access_token = create_access_token(identity=new_user.id)

        response = jsonify({
            "status": "success",
            "message": "User registered successfully",
            "user": {
                "name": new_user.name,
                "email": new_user.email
            }
        })

        # Set JWT cookie
        response.set_cookie(
            'access_token',
            access_token,
            httponly=True,
            secure=False,  # Set to True in production
            samesite='Lax',
            max_age=3600
        )

        return response, 201

    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

def login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({
                "status": "error",
                "message": "Email and password are required"
            }), 400

        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        if not check_password_hash(user.password, password):
            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        # Generate access token with user ID only
        access_token = create_access_token(identity=user.id)
        
        response = jsonify({
            "status": "success",
            "message": "Login successful",
            "user": user.to_json()
        })

        # Set JWT cookie
        response.set_cookie(
            'access_token',
            access_token,
            httponly=True,
            secure=False,  # Set to True in production
            samesite='Lax',
            max_age=3600,
            path='/'  # Add path
        )

        return response, 200

    except Exception as e:
        print(f"Login error: {str(e)}")  # Add better error logging
        return jsonify({
            "status": "error",
            "message": "An error occurred during login"
        }), 500

@jwt_required()
def logout():
    response = jsonify({
        "status": "success",
        "message": "Logged out successfully"
    })

    response.set_cookie(
        'access_token',
        '',
        httponly=True,
        secure=False,  # Set to True in production
        samesite='Lax',
        expires=0
    )

    return response, 200

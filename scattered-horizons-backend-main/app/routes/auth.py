from flask import Blueprint
from app.api import auth

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# Update routes without /auth prefix since we used url_prefix
auth_bp.route("/register", methods=["POST", "OPTIONS"])(auth.register)
auth_bp.route("/login", methods=["POST", "OPTIONS"])(auth.login)
auth_bp.route("/logout", methods=["POST", "OPTIONS"])(auth.logout)
auth_bp.route("/google/callback", methods=["GET", "OPTIONS"])(auth.google_auth_callback)
auth_bp.route("/google-login", methods=["POST", "OPTIONS"])(auth.google_login)
auth_bp.route("/me", methods=["GET", "OPTIONS"])(auth.get_current_user)

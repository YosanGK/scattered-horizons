from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=True)  # Changed to nullable
    name = db.Column(db.String(80), nullable=False)
    google_id = db.Column(db.String(256), unique=True, nullable=True)

    def __repr__(self):
        return f'<User {self.email}>'

    def get_id(self):
        """Return string id for Flask-Login"""
        return str(self.id)

    def to_json(self):
        """Convert user to JSON representation"""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name
        }
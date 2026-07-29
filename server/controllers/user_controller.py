from extensions import db
from models.user import User

class UserController:
    @classmethod
    def email_taken(cls, email):
        return db.session.query(User).filter_by(email=email).first() is not None

    @classmethod
    def register_user(cls, data):
        user = User(
            email=data["email"],
            full_name=data["full_name"],
            phone=data["phone"],
        )
        user.set_password(data["password"])
        db.session.add(user)
        db.session.commit()
        return user


    @classmethod
    def authenticate_user(cls, email, password):
        user = db.session.query(User).filter_by(email=email).first()
        if user and user.check_password(password):
            return user
        return None

    @classmethod
    def get_user_by_id(cls, user_id):
        return db.session.get(User, user_id)
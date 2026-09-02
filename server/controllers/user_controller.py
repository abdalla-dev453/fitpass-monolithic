from extensions import db
from models.user import User
from models.trainer import Trainer

class UserController:
    @classmethod
    def email_taken(cls, email):
        return db.session.query(User).filter_by(email=email).first() is not None

    @classmethod
    def register_user(cls, data):
        role = data.get("role") if data.get("role") in ("client", "trainer") else "client"

        user = User(
            email=data.get("email"),
            full_name=data.get("full_name"),
            phone=data.get("phone", None),
            role=role,
        )
        user.set_password(data.get("password"))
        db.session.add(user)
        db.session.flush()  # get user.id before commit for the Trainer FK below

        if role == "trainer":
            db.session.add(Trainer(user_id=user.id))

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

from marshmallow import fields, validate
from extensions import ma
from models.user import User
from server.models import user

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = user
        load_instance = True
        exclude = ("password_hash",)


class UserRegistrationSchema(ma.Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=8, max=100))
    full_name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    phone = fields.String(validate=validate.Length(min=7, max=20))


class UserLoginSchema(ma.Schema):
    email = fields.Email(required=True)
    password =  fields.String(required=True)


user_schema = UserSchema()
register_schema = UserRegistrationSchema()
login_schema = UserLoginSchema()
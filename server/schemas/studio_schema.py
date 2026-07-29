from marshmallow import fields, validate
from extensions import ma
from models.studio import Studio


class StudioSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Studio
        load_instance = True

    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    location = fields.String(required=True, validate=validate.Length(min=5, max=255))


studio_schema = StudioSchema()
studios_schema = StudioSchema(many=True)

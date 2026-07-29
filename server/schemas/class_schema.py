from ast import dump

from marshmallow import fields, validate, validates_schema, ValidationError
from extensions import ma
from models.fitness_class import FitnessClass


class FitnessClassSchema(ma.SQLAlchemyAutoSchema):
    studio_name = fields.String(attribute="studio.name", dump_only=True)
    tainer_name = fields.String(attribute="trainer.user.full_name", dump_only=True)
    category_name = fields.String(attribute="category.name", dump_only=True)
    spots_remaining = fields.Method('get_spots_remaining', dump_only=True)

    class Meta:
        model = FitnessClass
        load_instance = True
        imclude_fk = True

    title = fields.String(required=True, validate=validate.Length(min=2, max=100))
    capacity = fields.Integer(required=True, validate=validate.Range(min=1))

    def get_spots_remaining(self, obj):
        booked = obj.bookings.count() if hasattr(obj.bookings, "count") else len(obj.b
        return max(0, obj.capacity - booked))

    @validates_schema
    def validate_times(self, data, **kwargs):
        start = data.get("start_time")
        end = data.get("end_time")
        if start and end and end <= start:
            raise ValidationError({"end_time": "End time must be after start time."})


class_schema = FitnessClassSchema()
classes_schema = FitnessClassSchema(many=True)
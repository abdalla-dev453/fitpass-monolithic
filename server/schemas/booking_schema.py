from marshmallow import fields
from extensions import ma
from models.booking import Booking


class BookingSchema(ma.SQLAlchemyAutoSchema):
    class_title = fields.String(attribute="fitness_class.title", dump_only=True)
    start_time = fields.DateTime(attribute="fitness_class.start_time", dump_only=True)
    studio_name = fields.String(attribute="fitness_class.studio.name", dump_only=True)

    class Meta:
        model = Booking
        load_instance = True
        include_fk = True


booking_schema = BookingSchema()
bookings_schema = BookingSchema(many=True)

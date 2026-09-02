from marshmallow import Schema, fields


class DiscoveredGymSchema(Schema):
    """Read-only shape for an external (unclaimed) gym result -- deliberately
    separate from StudioSchema since these rows don't exist in our DB and
    can't be booked, only "claimed"."""

    place_id = fields.String()
    name = fields.String()
    address = fields.String()
    latitude = fields.Float()
    longitude = fields.Float()
    rating = fields.Float(allow_none=True)
    user_ratings_total = fields.Integer(allow_none=True)


discovered_schema = DiscoveredGymSchema(many=True)

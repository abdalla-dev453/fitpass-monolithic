import math

from extensions import db


class Studio(db.Model):
    __tablename__ = "studios"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    source = db.Column(db.String, default="internal")
    external_place_id = db.Column(db.String, unique=True, nullable=True)
    claimed_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    # FIX: the discovery feature needs real coordinates to do a radius query.
    # These were referenced by DiscoveryController.nearby() but never existed
    # on the model, which made query_within_radius() impossible to write.
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    classes = db.relationship("FitnessClass", back_populates="studio", lazy="dynamic")

    def __repr__(self):
        return f"<Studio {self.name}>"

    @staticmethod
    def query_within_radius(lat, lng, radius_m=5000):
        """Return internal studios within radius_m meters of (lat, lng).

        No PostGIS dependency required: a cheap bounding-box filter runs in
        SQL (cuts the row count down using indexed-ish comparisons), then an
        exact haversine distance check runs in Python on the small remaining
        set. This works identically on SQLite (dev) and Postgres (prod) --
        swap in PostGIS's ST_DWithin later if the studio table gets large
        without changing the calling code.
        """
        if lat is None or lng is None:
            return []

        # ~111.32km per degree latitude; longitude degrees shrink with cos(lat).
        lat_delta = radius_m / 111_320
        lng_delta = radius_m / (111_320 * max(math.cos(math.radians(lat)), 0.01))

        candidates = Studio.query.filter(
            Studio.latitude.isnot(None),
            Studio.longitude.isnot(None),
            Studio.latitude.between(lat - lat_delta, lat + lat_delta),
            Studio.longitude.between(lng - lng_delta, lng + lng_delta),
        ).all()

        def haversine_m(lat1, lng1, lat2, lng2):
            r = 6_371_000  # Earth radius in meters
            p1, p2 = math.radians(lat1), math.radians(lat2)
            d_p = math.radians(lat2 - lat1)
            d_l = math.radians(lng2 - lng1)
            a = (
                math.sin(d_p / 2) ** 2
                + math.cos(p1) * math.cos(p2) * math.sin(d_l / 2) ** 2
            )
            return 2 * r * math.asin(math.sqrt(a))

        return [
            s for s in candidates
            if haversine_m(lat, lng, s.latitude, s.longitude) <= radius_m
        ]


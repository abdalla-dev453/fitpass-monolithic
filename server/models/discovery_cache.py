from datetime import datetime
from extensions import db


class DiscoveredGymCache(db.Model):
    """Caches Google Places 'nearby gyms' results per ~1km geohash-ish cell
    so ten users searching from the same neighborhood don't each trigger a
    separate (billed) Places API call. Entries older than the TTL the
    controller checks against are simply overwritten.
    """

    __tablename__ = "discovered_gym_cache"

    id = db.Column(db.Integer, primary_key=True)
    cell_key = db.Column(db.String(64), unique=True, nullable=False, index=True)
    payload = db.Column(db.JSON, nullable=False)
    fetched_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

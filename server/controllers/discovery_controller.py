from datetime import datetime, timedelta

from extensions import db
from models.studio import Studio
from models.discovery_cache import DiscoveredGymCache
from services.places_client import PlacesClient

CACHE_TTL_HOURS = 36
# ~1km grid cell so nearby users share a cache entry.
CELL_PRECISION = 2


class DiscoveryController:
    @staticmethod
    def _cell_key(lat, lng, radius_m):
        return f"{round(lat, CELL_PRECISION)}:{round(lng, CELL_PRECISION)}:{radius_m}"

    @classmethod
    def _external_nearby(cls, lat, lng, radius_m):
        cell_key = cls._cell_key(lat, lng, radius_m)
        cached = DiscoveredGymCache.query.filter_by(cell_key=cell_key).first()
        if cached and cached.fetched_at > datetime.utcnow() - timedelta(hours=CACHE_TTL_HOURS):
            return cached.payload

        results = PlacesClient.search_nearby(lat, lng, radius_m, place_type="gym")

        if cached:
            cached.payload = results
            cached.fetched_at = datetime.utcnow()
        else:
            db.session.add(DiscoveredGymCache(cell_key=cell_key, payload=results))
        db.session.commit()
        return results

    @staticmethod
    def nearby(lat, lng, radius_m=5000):
        """Merge two sources at query time: our own registered (bookable)
        studios, and external "discovered" gyms (browsable, not bookable
        until claimed). We never auto-populate the Studio table from
        third-party data -- that's what keeps the real catalog clean and
        gives claim-flow its growth loop.
        """
        internal = Studio.query_within_radius(lat, lng, radius_m)

        external = DiscoveryController._external_nearby(lat, lng, radius_m)

        # Dedupe: skip external results whose place_id already matches a
        # claimed internal studio, so a claimed gym doesn't show up twice.
        claimed_ids = {s.external_place_id for s in internal if s.external_place_id}
        external = [p for p in external if p.get("place_id") not in claimed_ids]

        return internal, external
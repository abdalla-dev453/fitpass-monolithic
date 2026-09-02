from models.studio import Studio



class DiscoveryController:
    @staticmethod
    def nearby(lat, lng, radius_m=5000):
        internal = Studio.query_within_radius(lat, lng, radius_m)  # PostGIS or haversine filter

        external = PlacesClient.search_nearby(lat, lng, radius_m, type="gym")

        # dedupe: skip external results whose place_id already matches a claimed internal studio
        claimed_ids = {s.external_place_id for s in internal if s.external_place_id}
        external = [p for p in external if p["place_id"] not in claimed_ids]
        return internal, external

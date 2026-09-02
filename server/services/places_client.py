import os
import requests

GOOGLE_PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"


class PlacesClient:
    """Thin wrapper around Google Places Nearby Search, scoped to gyms.

    FIX: the original discovery_controller.py called `PlacesClient.search_nearby(...)`
    but no such class existed anywhere in the codebase -- every request to
    /discovery/nearby was guaranteed to raise a NameError. This client also
    fails soft (returns []) when no API key is configured, so local dev and
    CI don't need real Google Places credentials just to boot the feature.
    """

    @staticmethod
    def _api_key():
        return os.getenv("GOOGLE_PLACES_API_KEY")

    @classmethod
    def search_nearby(cls, lat, lng, radius_m=5000, place_type="gym"):
        api_key = cls._api_key()
        if not api_key or lat is None or lng is None:
            return []

        try:
            resp = requests.get(
                GOOGLE_PLACES_URL,
                params={
                    "location": f"{lat},{lng}",
                    "radius": radius_m,
                    "type": place_type,
                    "key": api_key,
                },
                timeout=5,
            )
            resp.raise_for_status()
            payload = resp.json()
        except (requests.RequestException, ValueError):
            # Never let a flaky third-party API 500 the whole discovery
            # endpoint -- degrade to "no external results" instead.
            return []

        results = []
        for place in payload.get("results", []):
            location = place.get("geometry", {}).get("location", {})
            results.append({
                "place_id": place.get("place_id"),
                "name": place.get("name"),
                "address": place.get("vicinity"),
                "latitude": location.get("lat"),
                "longitude": location.get("lng"),
                "rating": place.get("rating"),
                "user_ratings_total": place.get("user_ratings_total"),
            })
        return results

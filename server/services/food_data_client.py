import os
import requests

USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

# USDA FoodData Central issues a free, effectively unlimited DEMO_KEY for
# exactly this kind of light usage -- so this client works out of the box
# without requiring the developer to register for credentials first.
DEFAULT_API_KEY = "DEMO_KEY"


class FoodDataClient:
    """Looks up whole-food macro data from USDA FoodData Central.

    We only hit this on a cache miss (see NutritionController.search_foods)
    -- results get persisted into our own FoodItem table on first lookup so
    repeat searches don't hit the external API, and the app keeps working
    for already-cached foods if USDA's API is down.
    """

    @staticmethod
    def _api_key():
        return os.getenv("USDA_API_KEY", DEFAULT_API_KEY)

    @classmethod
    def search(cls, query, page_size=10):
        try:
            resp = requests.get(
                USDA_SEARCH_URL,
                params={
                    "query": query,
                    "pageSize": page_size,
                    "dataType": "Foundation,SR Legacy",
                    "api_key": cls._api_key(),
                },
                timeout=5,
            )
            resp.raise_for_status()
            payload = resp.json()
        except (requests.RequestException, ValueError):
            return []

        results = []
        for food in payload.get("foods", []):
            nutrients = {n.get("nutrientName"): n.get("value") for n in food.get("foodNutrients", [])}
            results.append({
                "external_source_id": str(food.get("fdcId")),
                "name": food.get("description", "").title(),
                "calories_per_100g": nutrients.get("Energy", 0) or 0,
                "protein_g": nutrients.get("Protein", 0) or 0,
                "carbs_g": nutrients.get("Carbohydrate, by difference", 0) or 0,
                "fat_g": nutrients.get("Total lipid (fat)", 0) or 0,
            })
        return results
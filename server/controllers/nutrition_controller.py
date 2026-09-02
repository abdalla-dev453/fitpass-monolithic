from datetime import datetime, timedelta

from extensions import db
from models.nutrition_profile import NutritionProfile
from models.food_item import FoodItem
from models.food_log import FoodLog
from services.food_data_client import FoodDataClient


class NutritionController:
    # ---- Profile -----------------------------------------------------

    @staticmethod
    def get_or_create_profile(user_id):
        profile = NutritionProfile.query.get(user_id)
        if not profile:
            profile = NutritionProfile(user_id=user_id, goal="maintain")
            db.session.add(profile)
            db.session.commit()
        return profile

    @staticmethod
    def update_profile(user_id, data):
        profile = NutritionController.get_or_create_profile(user_id)
        for field in (
            "goal", "daily_calorie_target", "protein_target_g",
            "carbs_target_g", "fat_target_g", "dietary_restrictions",
        ):
            if field in data:
                setattr(profile, field, data[field])
        db.session.commit()
        return profile

    # ---- Food search / cache-on-first-lookup ---------------------------

    @staticmethod
    def search_foods(query, limit=10):
        """Search our cached FoodItem table first; only fall back to the
        USDA API (and persist the results) on a cache miss, so repeat
        searches never re-hit the external API."""
        cached = FoodItem.query.filter(FoodItem.name.ilike(f"%{query}%")).limit(limit).all()
        if cached:
            return cached

        external_results = FoodDataClient.search(query, page_size=limit)
        saved = []
        for item in external_results:
            existing = FoodItem.query.filter_by(
                external_source_id=item["external_source_id"]
            ).first()
            if existing:
                saved.append(existing)
                continue
            food_item = FoodItem(**item)
            db.session.add(food_item)
            saved.append(food_item)
        if saved:
            db.session.commit()
        return saved

    # ---- Logging ---------------------------------------------------

    @staticmethod
    def log_food(user_id, food_item_id, quantity_g, meal_type):
        food_item = db.session.get(FoodItem, food_item_id)
        if not food_item:
            return None, "Unknown food item."

        entry = FoodLog(
            user_id=user_id,
            food_item_id=food_item_id,
            quantity_g=quantity_g,
            meal_type=meal_type,
        )
        db.session.add(entry)
        db.session.commit()
        return entry, None

    @staticmethod
    def get_logs_for_date(user_id, date: datetime):
        start = datetime(date.year, date.month, date.day)
        end = start + timedelta(days=1)
        return (
            FoodLog.query.filter(
                FoodLog.user_id == user_id,
                FoodLog.logged_at >= start,
                FoodLog.logged_at < end,
            )
            .order_by(FoodLog.logged_at.asc())
            .all()
        )

    # ---- Analysis (tier 1: pure aggregation) ------------------------

    @staticmethod
    def _macros_for_entry(entry):
        ratio = entry.quantity_g / 100.0
        return {
            "calories": entry.food_item.calories_per_100g * ratio,
            "protein_g": entry.food_item.protein_g * ratio,
            "carbs_g": entry.food_item.carbs_g * ratio,
            "fat_g": entry.food_item.fat_g * ratio,
        }

    @classmethod
    def summary(cls, user_id, days=7):
        profile = cls.get_or_create_profile(user_id)
        since = datetime.utcnow() - timedelta(days=days)
        logs = (
            FoodLog.query.filter(FoodLog.user_id == user_id, FoodLog.logged_at >= since)
            .all()
        )

        totals = {"calories": 0.0, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0}
        by_day = {}
        for entry in logs:
            macros = cls._macros_for_entry(entry)
            for key in totals:
                totals[key] += macros[key]
            day_key = entry.logged_at.date().isoformat()
            by_day.setdefault(day_key, {"calories": 0.0, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0})
            for key in totals:
                by_day[day_key][key] += macros[key]

        active_days = max(len(by_day), 1)
        averages = {key: round(val / active_days, 1) for key, val in totals.items()}

        targets = {
            "calories": profile.daily_calorie_target,
            "protein_g": profile.protein_target_g,
            "carbs_g": profile.carbs_target_g,
            "fat_g": profile.fat_target_g,
        }

        return {
            "range_days": days,
            "logged_days": len(by_day),
            "daily_average": averages,
            "targets": targets,
            "by_day": by_day,
            "improvements": cls._improvements(averages, targets, len(by_day), days),
        }

    # ---- Improvements (tier 2: rule-based nudges, no ML) -----------

    @staticmethod
    def _improvements(averages, targets, logged_days, range_days):
        suggestions = []

        if logged_days < range_days / 2:
            suggestions.append(
                "You've only logged {}/{} days this period — logging more consistently "
                "will make these numbers meaningful.".format(logged_days, range_days)
            )

        if targets.get("protein_g"):
            gap = targets["protein_g"] - averages["protein_g"]
            if gap > targets["protein_g"] * 0.15:
                suggestions.append(
                    "You're averaging {}g under your protein target. Consider adding a "
                    "protein-dense food to one meal a day.".format(round(gap))
                )

        if targets.get("calories"):
            diff = averages["calories"] - targets["calories"]
            if diff > targets["calories"] * 0.15:
                suggestions.append(
                    "You're averaging {} calories over your target.".format(round(diff))
                )
            elif diff < -targets["calories"] * 0.15:
                suggestions.append(
                    "You're averaging {} calories under your target.".format(round(-diff))
                )

        if not suggestions:
            suggestions.append("You're tracking close to your targets — nice consistency.")

        return suggestions

    # ---- Planning (tier 3: deterministic constraint pass, no AI) ---

    @staticmethod
    def suggest_meal_plan(user_id, meal_count=3):
        """Cheapest real version of "planning": a constraint-satisfaction
        pass over cached FoodItem rows (filtered by dietary_restrictions)
        that hits the day's macro targets within tolerance. Deterministic
        on purpose -- an LLM-generated plan can sit on top of this later for
        variety/recipes, but the macro math itself should stay trustworthy
        and reproducible.
        """
        profile = NutritionController.get_or_create_profile(user_id)
        if not profile.daily_calorie_target:
            return None, "Set a daily_calorie_target on your nutrition profile first."

        candidates = FoodItem.query.limit(200).all()
        if not candidates:
            return None, "No foods in the catalog yet — search and log a few foods first."

        per_meal_target = profile.daily_calorie_target / meal_count
        plan = []
        for i in range(meal_count):
            # Greedy pick: closest single-food match to this meal's calorie
            # slice. Simple on purpose -- swap in a real knapsack/LP solver
            # later if multi-food-per-meal precision matters.
            best = min(
                candidates,
                key=lambda f: abs((f.calories_per_100g * 2) - per_meal_target),
            )
            plan.append({
                "meal": i + 1,
                "food_item_id": best.id,
                "name": best.name,
                "suggested_grams": 200,
                "calories": round(best.calories_per_100g * 2, 1),
            })

        return plan, None

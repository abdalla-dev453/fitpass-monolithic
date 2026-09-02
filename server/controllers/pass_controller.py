from datetime import datetime, timedelta
from extensions import db
from models.pass_model import Pass

PASS_PLANS = {
    "drop-in": {"name": "Single Class Drop-In", "credits": 1, "price": 25.00, "duration_days": 30},
    "10-pack": {"name": "10-Class Flex Pass", "credits": 10, "price": 180.00, "duration_days": 90},
    "monthly": {"name": "Monthly Unlimited", "credits": 99, "price": 150.00, "duration_days": 30},
}


class PassController:
    @staticmethod
    def list_plans():
        return [{"key": key, **plan} for key, plan in PASS_PLANS.items()]

    @staticmethod
    def get_user_passes(user_id: int) -> list[Pass]:
        return Pass.query.filter_by(user_id=user_id).order_by(Pass.purchased_at.desc()).all()

    @staticmethod
    def purchase_plan(user_id: int, plan_key: str):
        plan = PASS_PLANS.get(plan_key)
        if not plan:
            return None

        expires_at = datetime.utcnow() + timedelta(days=plan["duration_days"])
        purchased = Pass(
            user_id=user_id,
            plan_name=plan["name"],
            credits=plan["credits"],
            remaining_credits=plan["credits"],
            price=plan["price"],
            expires_at=expires_at,
        )
        db.session.add(purchased)
        db.session.commit()
        return purchased

    @staticmethod
    def get_active_pass(user_id: int):
        now = datetime.utcnow()
        return (
            Pass.query.filter(
                Pass.user_id == user_id,
                Pass.remaining_credits > 0,
                Pass.expires_at > now,
            )
            .order_by(Pass.expires_at.asc())
            .first()
        )

from datetime import datetime, timedelta
from extensions import db
from models.pass_model import Pass
from models.pass_plan import PassPlan

# FIX: pricing used to live only as a hardcoded PASS_PLANS dict, so every
# price change was a code deploy with no audit trail and no way to run a
# promo without touching source. Plans now live in the pass_plans table
# (see PassPlan model); this list is only a one-time seed used if the table
# is empty, so a fresh environment still boots with working plans.
DEFAULT_PLANS = [
    {"key": "drop-in", "name": "Single Class Drop-In", "credits": 1, "price_cents": 2500, "duration_days": 30},
    {"key": "10-pack", "name": "10-Class Flex Pass", "credits": 10, "price_cents": 18000, "duration_days": 90},
    {"key": "monthly", "name": "Monthly Unlimited", "credits": 99, "price_cents": 15000, "duration_days": 30},
]


class PassController:
    @staticmethod
    def ensure_default_plans():
        """Seed pass_plans on first boot if the table is empty. Safe to call
        repeatedly -- it's a no-op once any plan exists."""
        if PassPlan.query.count() == 0:
            db.session.add_all(PassPlan(**plan) for plan in DEFAULT_PLANS)
            db.session.commit()

    @staticmethod
    def list_plans():
        plans = PassPlan.query.filter_by(active=True).all()
        return [plan.to_dict() for plan in plans]

    @staticmethod
    def get_user_passes(user_id: int) -> list[Pass]:
        return Pass.query.filter_by(user_id=user_id).order_by(Pass.purchased_at.desc()).all()

    @staticmethod
    def purchase_plan(user_id: int, plan_key: str):
        plan = PassPlan.query.filter_by(key=plan_key, active=True).first()
        if not plan:
            return None

        expires_at = datetime.utcnow() + timedelta(days=plan.duration_days)
        purchased = Pass(
            user_id=user_id,
            plan_name=plan.name,
            credits=plan.credits,
            remaining_credits=plan.credits,
            price=round(plan.price_cents / 100, 2),
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


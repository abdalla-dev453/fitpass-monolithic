from datetime import datetime, timedelta, timezone

from main import app
from extensions import db
from models.user import User
from models.studio import Studio
from models.trainer import Trainer
from models.class_category import ClassCategory
from models.fitness_class import FitnessClass
from models.pass_model import Pass
from models.booking import Booking


def seed_database():
    with app.app_context():
        print("Starting database seed...")
        db.create_all()

        print("Cleaning old records...")
        Booking.query.delete()
        Pass.query.delete()
        FitnessClass.query.delete()
        ClassCategory.query.delete()
        Trainer.query.delete()
        Studio.query.delete()
        User.query.delete()
        db.session.commit()

        print("Seeding users...")
        admin = User(email="admin@fitpass.com", full_name="System Admin", role="admin", waiver_signed=True)
        admin.set_password("AdminPass123!")
        db.session.add(admin)

        trainer_user1 = User(email="maya@fitpass.com", full_name="Maya Lin", role="trainer", waiver_signed=True)
        trainer_user1.set_password("TrainerPass123!")
        trainer_user2 = User(email="alex@fitpass.com", full_name="Alex Rivera", role="trainer", waiver_signed=True)
        trainer_user2.set_password("TrainerPass123!")
        db.session.add_all([trainer_user1, trainer_user2])
        db.session.flush()

        trainer1 = Trainer(
            user_id=trainer_user1.id,
            bio="10+ years teaching Vinyasa and Power Yoga with focus on alignment.",
            specialties="Vinyasa, Pilates Core",
        )
        trainer2 = Trainer(
            user_id=trainer_user2.id,
            bio="Former competitive athlete specializing in high-intensity conditioning.",
            specialties="HIIT, Strength, Boxing",
        )
        db.session.add_all([trainer1, trainer2])

        client1 = User(
            email="sarah@example.com", full_name="Sarah Connor", phone="555-0199",
            waiver_signed=True,
        )
        client1.set_password("ClientPass123!")
        client2 = User(
            email="david@example.com", full_name="David Miller", phone="555-0198",
            waiver_signed=False,  # unsigned waiver to test route protection
        )
        client2.set_password("ClientPass123!")
        db.session.add_all([client1, client2])
        db.session.flush()

        print("Seeding studios...")
        studio1 = Studio(
            name="Zen Flow Loft",
            location="123 Main St, Downtown",
            description="A calm, sunlit space built for yoga, meditation, and low-impact movement.",
        )
        studio2 = Studio(
            name="Iron Pulse Lab",
            location="456 Market Ave, Westside",
            description="High-energy facility packed with turf, kettlebells, and heavy bags.",
        )
        db.session.add_all([studio1, studio2])

        print("Seeding class categories...")
        cat_yoga = ClassCategory(name="Yoga")
        cat_hiit = ClassCategory(name="HIIT")
        cat_pilates = ClassCategory(name="Pilates")
        db.session.add_all([cat_yoga, cat_hiit, cat_pilates])
        db.session.flush()

        print("Seeding fitness classes...")
        now = datetime.now(timezone.utc)
        class1 = FitnessClass(
            title="Sunrise Vinyasa",
            description="Start your day with dynamic flows and breathwork suitable for all levels.",
            capacity=15,
            start_time=now + timedelta(days=1, hours=2),
            end_time=now + timedelta(days=1, hours=3),
            studio_id=studio1.id,
            trainer_id=trainer1.id,
            category_id=cat_yoga.id,
        )
        class2 = FitnessClass(
            title="Full-Body Burn HIIT",
            description="Heart-pumping interval training using kettlebells, rowers, and bodyweight movements.",
            capacity=10,
            start_time=now + timedelta(days=2, hours=4),
            end_time=now + timedelta(days=2, hours=5),
            studio_id=studio2.id,
            trainer_id=trainer2.id,
            category_id=cat_hiit.id,
        )
        class3 = FitnessClass(
            title="Core & Reformer Pilates",
            description="Targeted deep-core work to improve posture, balance, and stability.",
            capacity=8,
            start_time=now - timedelta(days=2, hours=3),  # past class, for review-flow testing
            end_time=now - timedelta(days=2, hours=2),
            studio_id=studio1.id,
            trainer_id=trainer1.id,
            category_id=cat_pilates.id,
        )
        db.session.add_all([class1, class2, class3])
        db.session.flush()

        print("Seeding a purchased pass...")
        user_pass1 = Pass(
            user_id=client1.id,
            plan_name="10-Class Flex Pass",
            credits=10,
            remaining_credits=8,
            price=180.00,
            purchased_at=now - timedelta(days=10),
            expires_at=now + timedelta(days=80),
        )
        db.session.add(user_pass1)

        print("Seeding bookings...")
        booking_upcoming = Booking(
            user_id=client1.id, class_id=class1.id, booked_at=now - timedelta(days=1),
        )
        booking_past = Booking(
            user_id=client1.id, class_id=class3.id, booked_at=now - timedelta(days=5),
            attended=True, rating=5,
            review_text="Maya is an incredible instructor! Great cueing and music.",
        )
        db.session.add_all([booking_upcoming, booking_past])

        db.session.commit()
        print("Database seeded successfully!")


if __name__ == "__main__":
    seed_database()

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

        print("Wiping all existing database records...")
        Booking.query.delete()
        Pass.query.delete()
        FitnessClass.query.delete()
        ClassCategory.query.delete()
        Trainer.query.delete()
        Studio.query.delete()
        User.query.delete()
        db.session.commit()

        print("Seeding targeted users...")
        # 1. Admin Account
        admin = User(
            email="mse@gmail.com", 
            full_name="Msema Abdalla", 
            role="admin", 
            waiver_signed=True
        )
        admin.set_password("AdminPass123!")
        
        # 2. Trainer Account
        trainer_user = User(
            email="collo@gmail.com", 
            full_name="Collo", 
            role="trainer", 
            waiver_signed=True
        )
        trainer_user.set_password("TrainerPass123!")
        
        # 3. Client Account
        client_user = User(
            email="naim@gmail.com", 
            full_name="Naim", 
            role="client", 
            waiver_signed=True
        )
        client_user.set_password("ClientPass123!")
        
        db.session.add_all([admin, trainer_user, client_user])
        db.session.flush()

        # Profile extension details for Collo the Trainer
        trainer_profile = Trainer(
            user_id=trainer_user.id,
            bio="Elite fitness coach specializing in advanced strength conditioning, HIIT transformations, and athletic mobility.",
            specialties="HIIT, Powerlifting, Calisthenics, Boxing Conditioning",
        )
        db.session.add(trainer_profile)
        db.session.flush()

        print("Seeding diverse fitness venues...")
        studio_downtown = Studio(
            name="Iron Pulse Lab (Downtown)",
            location="789 Innovation Way, Suite A",
            description="Premium high-energy facility equipped with modern turf yards, power racks, kettlebells, and heavy combat bags.",
        )
        studio_uptown = Studio(
            name="Zen & Core Oasis (Uptown)",
            location="432 Serenity Boulevard",
            description="Sunlit boutique space engineered for targeted deep-core work, group athletic conditioning, and recovery flows.",
        )
        db.session.add_all([studio_downtown, studio_uptown])
        db.session.flush()

        print("Seeding class categories...")
        cat_hiit = ClassCategory(name="HIIT")
        cat_strength = ClassCategory(name="Strength & Conditioning")
        cat_boxing = ClassCategory(name="Boxing")
        db.session.add_all([cat_hiit, cat_strength, cat_boxing])
        db.session.flush()

        print("Seeding rich schedule matrix for Collo's classes...")
        now = datetime.now(timezone.utc)
        
        # Class 1: Active upcoming class tomorrow
        class_upcoming_1 = FitnessClass(
            title="Next-Level HIIT Burn",
            description="Ignite your cardiovascular conditioning with explosive interval tracking designed to maximize raw power output.",
            capacity=20,
            start_time=now + timedelta(days=1, hours=2),
            end_time=now + timedelta(days=1, hours=3),
            studio_id=studio_downtown.id,
            trainer_id=trainer_profile.id,
            category_id=cat_hiit.id,
        )
        
        # Class 2: Active upcoming class in two days
        class_upcoming_2 = FitnessClass(
            title="Heavy Iron Barbell Strength",
            description="Focus on fundamental compound lifting mechanics including compound deadlifts, squats, and functional presses.",
            capacity=12,
            start_time=now + timedelta(days=2, hours=4),
            end_time=now + timedelta(days=2, hours=5),
            studio_id=studio_downtown.id,
            trainer_id=trainer_profile.id,
            category_id=cat_strength.id,
        )
        
        # Class 3: Past class for testing historic review/attendance view
        class_past_1 = FitnessClass(
            title="Championship Boxing Conditioning",
            description="High-octane shadow boxing combinations, heavy bag circuits, and fundamental core stability drills.",
            capacity=15,
            start_time=now - timedelta(days=3, hours=2),
            end_time=now - timedelta(days=3, hours=1),
            studio_id=studio_uptown.id,
            trainer_id=trainer_profile.id,
            category_id=cat_boxing.id,
        )
        
        # Class 4: Additional past class for deep history data
        class_past_2 = FitnessClass(
            title="Explosive Calisthenics Core",
            description="Master your own bodyweight with progressive gymnastic adjustments, pull configurations, and stability flows.",
            capacity=10,
            start_time=now - timedelta(days=6, hours=5),
            end_time=now - timedelta(days=6, hours=4),
            studio_id=studio_uptown.id,
            trainer_id=trainer_profile.id,
            category_id=cat_hiit.id,
        )
        
        db.session.add_all([class_upcoming_1, class_upcoming_2, class_past_1, class_past_2])
        db.session.flush()

        print("Seeding active fitness passes for Naim...")
        naim_pass = Pass(
            user_id=client_user.id,
            plan_name="All-Access Elite 20-Class Pass",
            credits=20,
            remaining_credits=16,
            price=320.00,
            purchased_at=now - timedelta(days=7),
            expires_at=now + timedelta(days=83),
        )
        db.session.add(naim_pass)

        print("Seeding historic and upcoming bookings for Naim...")
        # Booking 1: Naim booked into the upcoming HIIT class tomorrow
        booking_future = Booking(
            user_id=client_user.id, 
            class_id=class_upcoming_1.id, 
            booked_at=now - timedelta(days=1),
        )
        
        # Booking 2: Naim attended the Boxing class and left a review
        booking_historic_1 = Booking(
            user_id=client_user.id, 
            class_id=class_past_1.id, 
            booked_at=now - timedelta(days=5),
            attended=True, 
            rating=5,
            review_text="Collo brings unmatched energy to the floor! The heavy bag structure was absolutely brutal and satisfying.",
        )

        # Booking 3: Naim attended the Calisthenics class
        booking_historic_2 = Booking(
            user_id=client_user.id, 
            class_id=class_past_2.id, 
            booked_at=now - timedelta(days=7),
            attended=True, 
            rating=4,
            review_text="Great progression scales provided for advanced movements. My posture felt awesome afterwards.",
        )
        
        db.session.add_all([booking_future, booking_historic_1, booking_historic_2])

        db.session.commit()
        print("Database seeded with isolated target test data successfully!")


if __name__ == "__main__":
    seed_database()

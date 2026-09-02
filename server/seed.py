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
        db.drop_all()
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
            email="mse@gmail.com", full_name="Msema Abdalla", role="admin", waiver_signed=True
        )
        admin.set_password("AdminPass123!")

        # 2. Trainer Account
        trainer_user = User(
            email="collo@gmail.com", full_name="Collo", role="trainer", waiver_signed=True
        )
        trainer_user.set_password("TrainerPass123!")

        # 3. Client Account
        client_user = User(
            email="naim@gmail.com", full_name="Naim", role="client", waiver_signed=True
        )
        client_user.set_password("ClientPass123!")

        # 4. Additional trainer account
        trainer2_user = User(
            email="nova@gmail.com", full_name="Nova Pulse", role="trainer", waiver_signed=True
        )
        trainer2_user.set_password("TrainerNova123!")

        # 5. Additional client accounts
        client_user2 = User(
            email="maya@gmail.com", full_name="Maya", role="client", waiver_signed=True
        )
        client_user2.set_password("ClientMaya123!")

        client_user3 = User(
            email="rory@gmail.com", full_name="Rory", role="client", waiver_signed=True
        )
        client_user3.set_password("ClientRory123!")

        db.session.add_all(
            [admin, trainer_user, trainer2_user, client_user, client_user2, client_user3]
        )
        db.session.flush()

        # Profile extension details for Collo the Trainer
        trainer_profile = Trainer(
            user_id=trainer_user.id,
            bio="Elite fitness coach specializing in advanced strength conditioning, HIIT transformations, and athletic mobility.",
            specialties="HIIT, Powerlifting, Calisthenics, Boxing Conditioning",
        )
        trainer_profile2 = Trainer(
            user_id=trainer2_user.id,
            bio="Recovery specialist focused on mobility, restorative yoga, and functional movement for long-term performance.",
            specialties="Yoga, Mobility, Recovery, Mind-Body",
        )
        db.session.add_all([trainer_profile, trainer_profile2])
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
        studio_riverfront = Studio(
            name="Riverfront Movement Studio",
            location="104 Riverside Drive",
            description="Open-air conditioning lab with rower bays, mobility zones, and recovery pods.",
        )
        studio_foundry = Studio(
            name="Steel Foundry Fitness",
            location="221 Industrial Ave",
            description="Urban strength warehouse with heavy rigs, sled tracks, and a dedicated boxing ring.",
        )
        db.session.add_all([studio_downtown, studio_uptown, studio_riverfront, studio_foundry])
        db.session.flush()

        print("Seeding class categories...")
        cat_hiit = ClassCategory(name="HIIT")
        cat_strength = ClassCategory(name="Strength & Conditioning")
        cat_boxing = ClassCategory(name="Boxing")
        cat_yoga = ClassCategory(name="Yoga")
        cat_recovery = ClassCategory(name="Recovery")
        db.session.add_all([cat_hiit, cat_strength, cat_boxing, cat_yoga, cat_recovery])
        db.session.flush()

        print("Seeding rich schedule matrix for Collo's classes...")
        now = datetime.now(timezone.utc)

        # Class 1: Active upcoming class tomorrow
        class_upcoming_1 = FitnessClass(
            title="Next-Level HIIT Burn",
            description="Ignite your cardiovascular conditioning with explosive interval tracking designed to maximize raw power output.",
            image_url="https://source.unsplash.com/1200x800/?hiit,workout",
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
            image_url="https://source.unsplash.com/1200x800/?weightlifting,barbell",
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
            image_url="https://source.unsplash.com/1200x800/?boxing,bag",
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
            image_url="https://source.unsplash.com/1200x800/?calisthenics,bodyweight",
            capacity=10,
            start_time=now - timedelta(days=6, hours=5),
            end_time=now - timedelta(days=6, hours=4),
            studio_id=studio_uptown.id,
            trainer_id=trainer_profile.id,
            category_id=cat_hiit.id,
        )

        class_upcoming_3 = FitnessClass(
            title="Recovery Flow and Stretch",
            description="A guided recovery session with mobility drills, foam rolling, and restorative movement for better performance.",
            image_url="https://source.unsplash.com/1200x800/?recovery,yoga",
            capacity=18,
            start_time=now + timedelta(days=3, hours=1),
            end_time=now + timedelta(days=3, hours=2),
            studio_id=studio_riverfront.id,
            trainer_id=trainer_profile2.id,
            category_id=cat_recovery.id,
        )

        class_upcoming_4 = FitnessClass(
            title="Core Fusion Strength",
            description="Blend foundational strength with core-specific conditioning in a fast-paced, full-body class.",
            image_url="https://source.unsplash.com/1200x800/?core,fitness",
            capacity=22,
            start_time=now + timedelta(days=4, hours=2),
            end_time=now + timedelta(days=4, hours=3),
            studio_id=studio_foundry.id,
            trainer_id=trainer_profile.id,
            category_id=cat_strength.id,
        )

        class_past_3 = FitnessClass(
            title="Boxing Fundamentals Circuit",
            description="Technical boxing work combined with conditioning stations for a full-body boxing circuit.",
            image_url="https://source.unsplash.com/1200x800/?boxing,training",
            capacity=16,
            start_time=now - timedelta(days=2, hours=3),
            end_time=now - timedelta(days=2, hours=2),
            studio_id=studio_downtown.id,
            trainer_id=trainer_profile.id,
            category_id=cat_boxing.id,
        )

        class_past_4 = FitnessClass(
            title="Yoga Strength Sculpt",
            description="Strength-based yoga flow designed to build muscular endurance, balance, and flexibility.",
            image_url="https://source.unsplash.com/1200x800/?yoga,strength",
            capacity=14,
            start_time=now - timedelta(days=4, hours=1),
            end_time=now - timedelta(days=4),
            studio_id=studio_riverfront.id,
            trainer_id=trainer_profile2.id,
            category_id=cat_yoga.id,
        )

        db.session.add_all(
            [
                class_upcoming_1,
                class_upcoming_2,
                class_upcoming_3,
                class_upcoming_4,
                class_past_1,
                class_past_2,
                class_past_3,
                class_past_4,
            ]
        )
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

        # Add additional passes for sample clients
        maya_pass = Pass(
            user_id=client_user2.id,
            plan_name="10-Class Flex Pack",
            credits=10,
            remaining_credits=6,
            price=180.00,
            purchased_at=now - timedelta(days=14),
            expires_at=now + timedelta(days=46),
        )

        rory_pass = Pass(
            user_id=client_user3.id,
            plan_name="Monthly Unlimited Membership",
            credits=999,
            remaining_credits=999,
            price=250.00,
            purchased_at=now - timedelta(days=3),
            expires_at=now + timedelta(days=27),
        )

        db.session.add_all([naim_pass, maya_pass, rory_pass])

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

        # Additional bookings for sample clients
        booking_maya_future = Booking(
            user_id=client_user2.id,
            class_id=class_upcoming_3.id,
            booked_at=now - timedelta(days=1, hours=2),
        )

        booking_rory_future = Booking(
            user_id=client_user3.id,
            class_id=class_upcoming_4.id,
            booked_at=now - timedelta(hours=20),
        )

        booking_maya_past = Booking(
            user_id=client_user2.id,
            class_id=class_past_4.id,
            booked_at=now - timedelta(days=5),
            attended=True,
            rating=4,
            review_text="Perfect strength-focused flow with restorative balance. Ideal for athletes needing mobility support.",
        )

        booking_rory_past = Booking(
            user_id=client_user3.id,
            class_id=class_past_3.id,
            booked_at=now - timedelta(days=3),
            attended=True,
            rating=5,
            review_text="Excellent fundamentals and pacing. The boxing circuit was structured and challenging.",
        )

        db.session.add_all(
            [
                booking_future,
                booking_historic_1,
                booking_historic_2,
                booking_maya_future,
                booking_rory_future,
                booking_maya_past,
                booking_rory_past,
            ]
        )

        db.session.commit()
        print("Database seeded with isolated target test data successfully!")


if __name__ == "__main__":
    seed_database()
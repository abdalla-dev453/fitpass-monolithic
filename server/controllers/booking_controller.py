from datetime import datetime
from extensions import db
from models.booking import Booking
from models.pass_model import Pass
from models.fitness_class import FitnessClass
from controllers.pass_controller import PassController


class BookingController:
    @classmethod
    def get_user_bookings(cls, user_id):
        return Booking.query.filter_by(user_id=int(user_id)).order_by(Booking.id.desc()).all()

    @classmethod
    def get_booking(cls, booking_id, user_id):
        return Booking.query.filter_by(id=booking_id, user_id=user_id).first()

    @classmethod
    def already_booked(cls, user_id, class_id):
        return Booking.query.filter_by(user_id=user_id, class_id=class_id).first() is not None

    @classmethod
    def create_booking(cls, user_id, class_id):
        """Spends one credit from the user's soonest-expiring active pass."""
        user_id = int(user_id)
        fitness_class = db.session.get(FitnessClass, class_id)
        if not fitness_class:
            return None, "Class not found."
        if fitness_class.start_time <= datetime.utcnow():
            return None, "This class has already started."
        if cls.already_booked(user_id, class_id):
            return None, "You already have a booking for this class."
        if fitness_class.bookings.count() >= fitness_class.capacity:
            return None, "This class is full."

        active_pass = PassController.get_active_pass(user_id)
        if not active_pass:
            return None, "No valid pass with available credits. Please purchase a pass first."

        active_pass.remaining_credits -= 1
        booking = Booking(user_id=user_id, class_id=class_id)
        db.session.add(booking)
        db.session.commit()
        return booking, None

    @classmethod
    def cancel_booking(cls, user_id, booking_id):
        booking = cls.get_booking(booking_id, int(user_id))
        if not booking:
            return False

        # Refund a credit to the user's most recently-expiring pass if the
        # class hasn't started yet.
        if booking.fitness_class.start_time > datetime.utcnow():
            active_pass = (
                Pass.query.filter_by(user_id=booking.user_id)
                .order_by(Pass.expires_at.desc())
                .first()
            )
            if active_pass:
                active_pass.remaining_credits += 1

        db.session.delete(booking)
        db.session.commit()
        return True

    @classmethod
    def submit_review(cls, booking, rating, review_text):
        booking.rating = rating
        booking.review_text = review_text
        booking.attended = True
        db.session.commit()
        return booking

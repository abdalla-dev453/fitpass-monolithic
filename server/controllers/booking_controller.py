from datetime import datetime, timezone
from extensions import db
from models.booking import Booking
from models.pass_model import Pass
from controllers.pass_controller import PassController


class BookingController:
    @classmethod
    def get_user_bookings(cls, user_id):
        return Booking.query.filter_by(user_id=user_id).order_by(Booking.id.desc()).all()

    @classmethod
    def get_booking(cls, booking_id, user_id):
        return Booking.query.filter_by(id=booking_id, user_id=user_id).first()

    @classmethod
    def already_booked(cls, user_id, class_id):
        return Booking.query.filter_by(user_id=user_id, class_id=class_id).first() is not None

    @classmethod
    def create_booking(cls, user_id, class_id):
        """Spends one credit from the user's soonest-expiring active pass."""
        active_pass = PassController.get_active_pass(user_id)
        if not active_pass:
            return None, "No valid pass with available credits. Please purchase a pass first."

        active_pass.remaining_credits -= 1
        booking = Booking(user_id=user_id, class_id=class_id)
        db.session.add(booking)
        db.session.commit()
        return booking, None

    @classmethod
    def cancel_booking(cls, booking):
        # Refund a credit to the user's most recently-expiring pass if the
        # class hasn't started yet.
        if booking.fitness_class.start_time.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc):
            active_pass = (
                Pass.query.filter_by(user_id=booking.user_id)
                .order_by(Pass.expires_at.desc())
                .first()
            )
            if active_pass:
                active_pass.remaining_credits += 1

        db.session.delete(booking)
        db.session.commit()

    @classmethod
    def submit_review(cls, booking, rating, review_text):
        booking.rating = rating
        booking.review_text = review_text
        booking.attended = True
        db.session.commit()
        return booking
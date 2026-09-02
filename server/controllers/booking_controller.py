from datetime import datetime
from extensions import db
from models.booking import Booking
from models.pass_model import Pass
from models.fitness_class import FitnessClass
from models.waitlist import WaitlistEntry
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
        """Spends one credit from the user's soonest-expiring active pass.

        FIX: the original capacity check (`fitness_class.bookings.count() >=
        fitness_class.capacity`) reads the count, then a *separate* request
        later writes the new Booking row. Two requests hitting this at once
        can both read "9 of 10 taken" and both proceed, overbooking the
        class -- a classic TOCTOU race. We now lock the FitnessClass row
        with SELECT ... FOR UPDATE so concurrent requests for the same class
        serialize on the count-then-insert, and everything commits in one
        transaction.
        """
        user_id = int(user_id)

        fitness_class = (
            db.session.query(FitnessClass)
            .filter_by(id=class_id)
            .with_for_update()
            .first()
        )
        if not fitness_class:
            return None, "Class not found."
        if fitness_class.start_time <= datetime.utcnow():
            return None, "This class has already started."
        if cls.already_booked(user_id, class_id):
            return None, "You already have a booking for this class."

        if fitness_class.bookings.count() >= fitness_class.capacity:
            # Class is full -- offer a waitlist spot instead of a bare error.
            existing_wait = WaitlistEntry.query.filter_by(
                user_id=user_id, class_id=class_id
            ).first()
            if not existing_wait:
                db.session.add(WaitlistEntry(user_id=user_id, class_id=class_id))
                db.session.commit()
            return None, "This class is full. You've been added to the waitlist."

        active_pass = PassController.get_active_pass(user_id)
        if not active_pass:
            db.session.rollback()
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

        class_id = booking.class_id
        starts_in_future = booking.fitness_class.start_time > datetime.utcnow()

        # Refund a credit to the user's most recently-expiring pass if the
        # class hasn't started yet.
        if starts_in_future:
            active_pass = (
                Pass.query.filter_by(user_id=booking.user_id)
                .order_by(Pass.expires_at.desc())
                .first()
            )
            if active_pass:
                active_pass.remaining_credits += 1

        db.session.delete(booking)
        db.session.commit()

        # A seat just opened up -- promote the longest-waiting person off
        # the waitlist so they know to book. We don't auto-book for them
        # (they may no longer want it / may not have credits), we just
        # clear their waitlist entry and flag it as notified so the
        # frontend/notification job can pick it up.
        if starts_in_future:
            next_in_line = (
                WaitlistEntry.query.filter_by(class_id=class_id, notified_at=None)
                .order_by(WaitlistEntry.created_at.asc())
                .first()
            )
            if next_in_line:
                next_in_line.notified_at = datetime.utcnow()
                db.session.commit()

        return True

    @classmethod
    def submit_review(cls, booking, rating, review_text):
        booking.rating = rating
        booking.review_text = review_text
        booking.attended = True
        db.session.commit()
        return booking

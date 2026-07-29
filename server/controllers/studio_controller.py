from datetime import datetime
from models.studio import Studio
from models.fitness_class import FitnessClass


class StudioController:
    @classmethod
    def get_all_studios(cls, location=None):
        query = Studio.query
        if location:
            query.filter(Studio.location.ilike(f"%{location}"))
        return query.all()

    @classmethod
    def get_studio_by_id(cls, studio_id):
        return Studio.query.get(studio_id)

    @classmethod
    def get_upcoming_schedule(cls, studio_id):
        return (
            FitnessClass.query.filter(
                FitnessClass.studio_id == studio_id,
                FitnessClass.start_time >= datetime.utcnow(),
            )
            .order_by(FitnessClass.start_time.asc())
            .all()
        )
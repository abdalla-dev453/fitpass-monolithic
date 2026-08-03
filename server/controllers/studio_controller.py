from datetime import datetime
from models.studio import Studio
from models.fitness_class import FitnessClass
from extensions import db


class StudioController:
    @classmethod
    def get_all_studios(cls, location=None):
        query = Studio.query
        if location:
            query = query.filter(Studio.location.ilike(f"%{location.strip()}%"))
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

    @classmethod
    def create_studio(cls, studio):
        db.session.add(studio)
        db.session.commit()
        return studio

    @classmethod
    def update_studio(cls, studio, data):
        for field in ("name", "location", "description"):
            if field in data:
                setattr(studio, field, data[field])
        db.session.commit()
        return studio

    @classmethod
    def delete_studio(cls, studio):
        if studio.classes.count():
            return False
        db.session.delete(studio)
        db.session.commit()
        return True

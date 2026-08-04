from datetime import datetime
from sqlalchemy import or_
from extensions import db
from models.fitness_class import FitnessClass
from models.class_category import ClassCategory


class ClassController:
    @classmethod
    def search_classes(
        cls,
        studio_id=None,
        category_id=None,
        trainer_id=None,
        q=None,
        start_date=None,
        end_date=None,
    ):
        """Search fitness classes with optional filtering."""
        query = FitnessClass.query

        query = query.filter(FitnessClass.start_time >= (start_date or datetime.utcnow()))
        if end_date:
            query = query.filter(FitnessClass.start_time <= end_date)
        if studio_id:
            query = query.filter(FitnessClass.studio_id == studio_id)
        if category_id:
            query = query.filter(FitnessClass.category_id == category_id)
        if trainer_id:
            query = query.filter(FitnessClass.trainer_id == trainer_id)
        if q:
            like = f"%{q}%"
            query = query.filter(
                or_(FitnessClass.title.ilike(like), FitnessClass.description.ilike(like))
            )

        return query.order_by(FitnessClass.start_time.asc()).all()

    @classmethod
    def get_class_by_id(cls, class_id):
        """Retrieve a single fitness class by ID."""
        try:
            return db.session.get(FitnessClass, class_id)
        except Exception as e:
            db.session.rollback()
            raise ValueError(f"Failed to retrieve class {class_id}: {str(e)}")

    @classmethod
    def create_class(cls, fitness_class):
        """Create and persist a new fitness class."""
        try:
            db.session.add(fitness_class)
            db.session.commit()
            return fitness_class
        except Exception as e:
            db.session.rollback()
            raise ValueError(f"Failed to create class: {str(e)}")

    @classmethod
    def update_class(cls, fitness_class, data):
        try:
            for field in (
                "title",
                "description",
                "image_url",
                "capacity",
                "start_time",
                "end_time",
                "studio_id",
                "trainer_id",
                "category_id",
            ):
                if field in data:
                    setattr(fitness_class, field, data[field])
            db.session.commit()
            return fitness_class
        except Exception as e:
            db.session.rollback()
            raise ValueError(f"Failed to update class: {str(e)}")

    @classmethod
    def delete_class(cls, fitness_class):
        try:
            db.session.delete(fitness_class)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise ValueError(f"Failed to delete class: {str(e)}")

    @classmethod
    def count_bookings(cls, fitness_class):
        """Get booking count for a fitness class."""
        return len(fitness_class.bookings) if fitness_class.bookings else 0

    @classmethod
    def get_categories(cls):
        """Retrieve all fitness class categories."""
        try:
            return ClassCategory.query.all()
        except Exception as e:
            raise ValueError(f"Failed to retrieve categories: {str(e)}")

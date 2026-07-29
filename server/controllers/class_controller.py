from datetime import datetime
from sqlalchemy import or_
from extensions import db
from models.fitness_class import FitnessClass
from models.class_category import ClassCategory


class ClassController:
    @classmethod
    def search_classes(cls, studio_id=None, category_id=None, trainer_id=None, q=None,
                        start_date=None, end_date=None):
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
        return db.session.get(FitnessClass, class_id)

    @classmethod
    def create_class(cls, fitness_class):
        db.session.add(fitness_class)
        db.session.commit()
        return fitness_class

    @classmethod
    def count_bookings(cls, fitness_class):
        return fitness_class.bookings.count()

    @classmethod
    def get_categories(cls):
        return ClassCategory.query.all()
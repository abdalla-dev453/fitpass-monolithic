from extensions import ma
from models.class_category import ClassCategory


class ClassCategorySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ClassCategory
        load_instance = True


category_schema = ClassCategorySchema()
categories_schema = ClassCategorySchema(many=True)

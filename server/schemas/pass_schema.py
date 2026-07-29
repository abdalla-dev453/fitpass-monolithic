from extensions import ma
from models.pass_model import Pass


class PassSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Pass
        load_instance = True
        include_fk = True


pass_schema = PassSchema()
passes_schema = PassSchema(many=True)

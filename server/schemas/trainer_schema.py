from marshmallow import fields
from extensions import ma
from models.trainer import Trainer


class TrainerSchema(ma.SQLAlchemyAutoSchema):
    full_name = fields.String(attribute="user.full_name", dump_only=True)

    class Meta:
        model = Trainer
        load_instance = True
        include_fk = True


trainer_schema = TrainerSchema()
trainers_schema = TrainerSchema(many=True)

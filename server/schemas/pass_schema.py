from extensions import ma
from models.pass_model import Pass
from marshmallow import fields


class PassSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Pass
        load_instance = True
        include_fk = True

class PurchasePassSchema(ma.Schema):
    """Input schema for POST /passes/purchase - the client senda a plan key ( e.g. 'drop-in', '10-pack', 'monthly'), not a full Pass row """
    plan_key = fields.String(required=True)

pass_schema = PassSchema()
passes_schema = PassSchema(many=True)
purchase_pass_schema = PurchasePassSchema()
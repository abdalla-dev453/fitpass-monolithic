from models.trainer import Trainer


class TrainerController:
    @classmethod
    def get_all_trainers(cls):
        return Trainer.query.all()

    @classmethod
    def get_trainer_by_id(cls, trainer_id):
        return Trainer.query.get(trainer_id)

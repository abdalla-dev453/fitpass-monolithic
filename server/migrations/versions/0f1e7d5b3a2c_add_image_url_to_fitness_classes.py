"""add image_url to fitness_classes

Revision ID: 0f1e7d5b3a2c
Revises: f42c2481b4d6
Create Date: 2026-08-04 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0f1e7d5b3a2c'
down_revision = 'f42c2481b4d6'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'fitness_classes',
        sa.Column('image_url', sa.String(length=512), nullable=True),
    )


def downgrade():
    op.drop_column('fitness_classes', 'image_url')

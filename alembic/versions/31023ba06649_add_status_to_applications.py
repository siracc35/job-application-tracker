"""add status to applications

Revision ID: 31023ba06649
Revises: f9ae43c261d8
Create Date: 2026-01-22 23:03:43.003330

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '31023ba06649'
down_revision: Union[str, Sequence[str], None] = 'f9ae43c261d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "applications",
        sa.Column("status", sa.String(length=50), nullable=False, server_default="APPLIED"),
    )
    op.alter_column("applications", "status", server_default=None)



def downgrade() -> None:
    op.drop_column("applications", "status")


"""Initial revision

Revision ID: 1743941273
Revises: 
Create Date: 2025-04-06 14:07:53.623203

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1743941273'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = ('default',)
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
	"""Upgrade schema."""
	pass


def downgrade() -> None:
	"""Downgrade schema."""
	pass

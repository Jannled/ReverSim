
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import ( 
	Mapped,
	mapped_column
)

from app.storage.database import LEN_LEVEL_PATH, db


class TutorialStatus(db.Model):
	"""Store the state of the Camou/Covert Tutorials. Will be added for every tutorial that could get shown."""
	id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
	name: Mapped[str] = mapped_column(String(LEN_LEVEL_PATH))
	pseudonym: Mapped[str] = mapped_column(ForeignKey("participant.pseudonym"))
	shown: Mapped[bool] = mapped_column(default=False) # -1 if never displayed, 0 if displayed, > 0 to store progress

	def __init__(self, name: str):
		self.name = name

from random import randint

from sqlalchemy import ForeignKey, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column

from app.storage.database import db


class SwitchState(db.Model):
	"""Store the state of a single switch inside a level

	- `id`: The unique id inside the database
	- `level`: Foreign key pointing to the level containing this switch
	- `circuitID`: The id of the element inside the level file
	- `currentState`: Store the last state assigned to by the player
	- `initialState`: If the switch is set to random, this will contain the randomly assigned state
	"""
	id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
	level: Mapped[int] = mapped_column(ForeignKey('level.id'))
	circuitID: Mapped[int] = mapped_column(SmallInteger, default=-1)
	currentState: Mapped[bool] = mapped_column(default=False)
	initialState: Mapped[bool] = mapped_column(default=False)


	def __init__(self, circuitID: int, randomInitialState: bool = False):
		self.circuitID = circuitID
		self.initialState = bool(randint(0,1)) if randomInitialState else bool(0)
		self.currentState = self.initialState

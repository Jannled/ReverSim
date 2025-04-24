
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from sqlalchemy import select
import sqlalchemy.sql.functions as func

import app.config as gameConfig
from app.storage.database import LEN_GROUP, db


class GroupStats(db.Model):
	name: Mapped[str] = mapped_column(String(LEN_GROUP), primary_key=True)
	initialCount: Mapped[int] = mapped_column()
	playersStarted: Mapped[int] = mapped_column(default=0)
	playersFinished: Mapped[int] = mapped_column(default=0)
	playersPostSurvey: Mapped[int] = mapped_column(default=0)
	playersStartedDebugging: Mapped[int] = mapped_column(default=0)


	def __init__(self, name: str, initialCount: int = 0):
		self.name = name
		self.initialCount = initialCount


	@classmethod
	def createGroupCounters(cls):
		# Create Group Counters
		# Track the player count for the group. Will do nothing if the group already exists
		for name, settings in gameConfig.groups().items():
			GroupStats.createGroup(name, settings['ctr'])

		db.session.commit()


	@staticmethod
	def increasePlayersStarted(name: str, isDebug: bool) -> int:
		"""Increase the counter for how many player have started this group."""
		g = db.session.get_one(GroupStats, name)

		if not isDebug:
			g.playersStarted += 1
		else:
			g.playersStartedDebugging += 1

		return g.playersStarted
	

	@staticmethod
	def increasePlayersFinished(name: str, isDebug: bool) -> int:
		"""Increase the counter for how many players have reached the FinalScene."""
		if isDebug: return 0

		g = db.session.get_one(GroupStats, name)
		g.playersFinished += 1
		return g.playersFinished


	@staticmethod
	def increasePlayersPostSurvey(name: str, isDebug: bool) -> int:
		"""Increase the counter for how many players clicked the Post Survey Button"""
		if isDebug: return 0
		
		g = db.session.get_one(GroupStats, name)
		g.playersPostSurvey += 1
		return g.playersPostSurvey


	@staticmethod
	def createGroup(name: str, initialCount: int) -> bool:
		"""Create a group if it does not exist yet, otherwise do nothing.
		
		Returns `True` if a new group was created.
		"""
		g = db.session.get(GroupStats, name)

		if g is None:
			g = GroupStats(name, initialCount)
			db.session.add(g)
			return True

		# Ensure that the database value reflects the current config value
		g.initialCount = initialCount
		return False


	@staticmethod
	def getAutomaticGroup() -> str:
		"""Return the group with the lowest player count"""
		stmtGroupSelect = select(GroupStats.name, func.min(GroupStats.initialCount + GroupStats.playersFinished))
		group = db.session.execute(stmtGroupSelect).scalar_one()
		return group


	@staticmethod
	def getPlayerCountFinished(name: str) -> int:
		"""Get the actual amount of players which have completed the game (reached the FinalScene)
		
		(without the initial offset from the config file)
		"""
		g = db.session.get_one(GroupStats, name)
		return g.playersFinished
	
	
	@staticmethod
	def getPlayerCountPostSurvey(name: str) -> int:
		"""Get the actual amount of players which clicked on the post survey link
		
		(without the initial offset from the config file)
		"""
		g = db.session.get_one(GroupStats, name)
		return g.playersPostSurvey

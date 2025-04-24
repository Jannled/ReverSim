from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column

from app.utilsGame import ClientTime

class TimerMixin():
	timeLoaded: Mapped[ClientTime] = mapped_column(default=-1)
	timeStarted: Mapped[ClientTime] = mapped_column(default=-1)
	timeReloaded: Mapped[ClientTime] = mapped_column(default=-1)
	timeFinished: Mapped[ClientTime] = mapped_column(default=-1)
	timeLimit: Mapped[int] = mapped_column(default=-1)


	def	timerLoad(self, clientTime: int) -> bool:
		"""Called once the Phase/Level etc. is first requested from the server"""
		if self.timeLoaded > 0:
			return False
		
		self.timeLoaded = clientTime
		return True


	def timerStart(self, clientTime: int):
		"""Called whenever the Level/Phase/... is actually shown to the player.
		
		This might be called again on page reload.
		"""
		self.timeReloaded = clientTime

		if self.timeStarted > 0:
			return False
		
		self.timeStarted = clientTime
		return True


	def timerEnd(self, clientTime: int):
		"""Called once the Level/Phase/... was finished solving to stop the currently running timer."""
		if self.timeFinished > 0:
			return False
		
		self.timeFinished = clientTime
		return True


	def getStartTime(self) -> int:
		return self.timeStarted


	def getTimeLimit(self) -> Optional[int]:
		"""Return the time limit in milliseconds or `None` if the Phase/Level/... has no time limit."""
		if self.timeLimit <= 0:
			return None
		
		return self.timeLimit


	def getRemaining(self, clientTime: int) -> Optional[int]:
		"""Get the time that remains for this Phase/Level/... or `None` if the solving time is set to infinite."""
		timeLimit = self.getTimeLimit()
		if timeLimit == None:
			return None

		return max(0, clientTime - self.timeStarted - timeLimit)


	def getTimeSpend(self) -> int:
		"""Get the time the player spend on this Phase/Level/... in milliseconds."""
		return self.timeFinished - self.timeStarted


	def timerHasEnded(self) -> bool:
		"""True if the time for this Phase/Level/... has run out."""
		return self.timeFinished > 0

from typing import Any, Dict, List, Optional

class LogfileInfo:
	__activeInstance: Optional['LogfileInfo'] = None

	def __init__(self, pseudonym: str, outline: List[Dict[str, Any]], version: str = "None") -> None:
		LogfileInfo.__activeInstance = self
		self.pseudonym = pseudonym
		self.outline = outline
		self.version = version
		self.eventIndex = -1
		self.activeEvent: Optional[Dict[str, Any]] = None

	def getOriginLine(self) -> int:
		if self.activeEvent != None:
			return self.activeEvent['_originLine']
		else:
			return -1

	@classmethod
	def isActive(cls) -> bool:
		return isinstance(cls.__activeInstance, LogfileInfo)

	@classmethod
	def getActive(cls) -> 'LogfileInfo':
		if not isinstance(cls.__activeInstance, LogfileInfo):
			raise KeyError("Can't get info about the current logfile, because none is active!")
		return cls.__activeInstance

	@classmethod
	def getShortPseudo(cls) -> str:
		if cls.isActive():
			return cls.getActive().pseudonym[:8]
		else:
			return "None"

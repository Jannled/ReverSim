from typing import Any, Callable, Dict, List, Tuple


# ----------------------------------------
#              Alt Tasks
# ----------------------------------------
class AltTaskParser():
	def handleAltEvent(self, e: Dict[str, Any]):
		"""Override this method to sort the AltTask methods to your own implemented handlers. 
		The event will always look similar to the event below:
		
		```
		Time: 1705597257633
		§Event: AltTask
		§Payload Key: Payload Value
		```
		"""
		pass


	def generateAltTaskLevels(self, levelType: str) -> List[Tuple[str, str]]:
		"""A level with type `url` or `iframe` will always be added to the level outline, 
		however your AltTask may introduce own levels, these can be generated with this method.
		"""
		return []


	@staticmethod
	def getEvents(participant: Any) -> List[Tuple[Dict[str, Any], Callable[[Dict[str, Any]], None]]]:
		return []

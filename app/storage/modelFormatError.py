class ModelFormatError(ValueError):
	"""Something is misconfigured, therefore an operation on the participant failed.
	
	Propably due to a Syntax/Logic Error in gameConfig.json or in one of the level lists.
	"""
	pass
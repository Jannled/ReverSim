from enum import Enum
from typing import Optional

JSONRPC_VERSION = "2.0"

class JsonRPC_Errcode(Enum):
	"""JsonRPC error Codes

	Prefixes:
	 - No prefix: Error defined in the specification
	 - S_: Server specific error
	 - I_: Implementation specific error
	"""
	PARSE_ERROR 		= (-32700, "Parse error")
	INVALID_REQUEST 	= (-32600, "Invalid Request")
	METHOD_NOT_FOUND	= (-32601, "Method not found")
	INVALID_PARAMS		= (-32602, "Invalid params")
	INTERNAL_ERROR		= (-32603, "Internal error")
	SERVER_ERROR_LOW	= (-32000, "Server error")
	SERVER_ERROR_HIGH	= (-32099, "Server error")
	S_AUTH_ERROR		= (-32001, "Authentication failed") # The request is missing a required header ui.
	S_INVALID_TIME		= (-32002, "Invalid field time") # The JsonRPC object should contain a field time.
	S_PACKET_ORDER		= (-32003, "Wrong packet index") # participantDict stored a different packet index
	S_DROPPED			= (-32004, "Packet dropped") # The packet was dropped, usually because it was send twice
	S_SESSION_MISMATCH 	= (-32005, "Session mismatch") # A new session was started, this session is now outdated.
	I_INVALID_STATE		= (-30001, "Invalid state") # No/wrong phase or level active

class JsonRPC_BaseError(Exception):
	def __init__(self, errorCode: int, errorMessage: str, errorDescription: Optional[str] = None, \
				 id: Optional[int] = None):
		"""An error that occurred either during parsing or execution of the JsonRPC."""
		self.errorCode = errorCode
		self.errorMessage = errorMessage
		self.errorDescription = errorDescription
		self.requestID = id


	def getResponseText(self):
		return ('{"jsonrpc": "' + JSONRPC_VERSION + '", "error": {"code": ' + str(self.errorCode) + 
		', "message": "' + self.errorMessage + '"}, "id": ' + self.getID() + '}')


	def getResponse(self) -> dict[str, Optional[dict[str, str|int]|str|int]]:
		return {
			"jsonrpc": JSONRPC_VERSION,
			"error": {
				"code": self.errorCode,
				"message": self.errorMessage
			},
			"id": None if self.requestID == None else int(self.requestID)
		}


	def getID(self):
		return "null" if self.requestID is None else str(self.requestID)


class JsonRPC_Error(JsonRPC_BaseError):
	def __init__(self, errorCode: JsonRPC_Errcode, desc: Optional[str] = None, id: Optional[int] = None):
		code, message = errorCode.value
		super().__init__(code, message, desc, id)


# ----------------------------------
# - Standard JsonRPC error objects -
# ----------------------------------
class JsonRPC_PARSE_ERROR(JsonRPC_Error):
	"""Invalid JSON was received by the server.
	An error occurred on the server while parsing the JSON text.
	"""
	def __init__(self, description: Optional[str] = None, id: Optional[int] = None) -> None:
		super().__init__(JsonRPC_Errcode.PARSE_ERROR, desc=description, id=id)


class JsonRPC_INVALID_REQUEST(JsonRPC_Error):
	"""The JSON sent is not a valid Request object."""
	def __init__(self, description: Optional[str] = None, id: Optional[int] = None) -> None:
		super().__init__(JsonRPC_Errcode.INVALID_REQUEST, desc=description, id=id)


class JsonRPC_METHOD_NOT_FOUND(JsonRPC_Error):
	"""The method does not exist / is not available."""
	def __init__(self, description: Optional[str] = None, id: Optional[int] = None) -> None:
		super().__init__(JsonRPC_Errcode.METHOD_NOT_FOUND, desc=description, id=id)


class JsonRPC_INVALID_PARAMS(JsonRPC_Error):
	"""Invalid method parameter(s)."""
	def __init__(self, description: Optional[str] = None, id: Optional[int] = None) -> None:
		super().__init__(JsonRPC_Errcode.INVALID_PARAMS, desc=description, id=id)


class JsonRPC_INTERNAL_ERROR(JsonRPC_Error):
	"""Internal JSON-RPC error."""
	def __init__(self, description: Optional[str] = None, id: Optional[int] = None) -> None:
		super().__init__(JsonRPC_Errcode.INTERNAL_ERROR, desc=description, id=id)


class JsonRPC_SERVER_ERROR(JsonRPC_Error):
	def __init__(self, description: Optional[str] = None, id: Optional[int] = None) -> None:
		"""Range -32000 to -32099 is reserved for implementation-defined server-errors."""
		super().__init__(JsonRPC_Errcode.SERVER_ERROR_LOW, desc=description, id=id)

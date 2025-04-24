/**
 * 
 */
class LogData
{
	static index = 0

	/**
	 * Send an event to the server to be logged. The timestamp is added by this function, @see Rq.now()
	 * @param {string} eventDict The event data 
	 */
	static sendData(eventDict, eventPath = 'None:None')
	{
		throw "sendData() is deprecated. Use the new JsonRPC.send() system!";

		/*if(!gamerules.enableLogging)
			return "Logging is disabled"

		// send log information as post
		var data = {
			'logEntry': eventDict,
			'pseudonym': pseudonym,
			'timeStamp': Rq.now(),
			'index': LogData.index++,
			'epath': eventPath
		};
		Rq.post('/addLogEntry', () => {}, data);*/
	}

	/**
	 * Take a screenshot of the current canvas (this will not include any HTML overlays) and send it to the server.
	 */
	static sendCanvasPNG()
	{
		if(!gamerules.enableLogging)
			return "Logging is disabled"

		// get canvas as image
		var htmlCollection = document.getElementsByTagName('canvas');
		var canvas = htmlCollection[0];
		var imgData = canvas.toDataURL("image/png", 1.0);

		let data = {
			canvasImage: imgData,
			'pseudonym': pseudonym,
			'timeStamp': Rq.now()
		};

		Rq.post('/canvasImage', () => {}, data, "application/x-www-form-urlencoded; charset=UTF-8");
	}
}
/**
 * Class to abstract away the unnecessary details when sending a GET/POST Request to the server. 
 * This class will also take care of retries.
 */
class Rq
{
	static get(url, onsuccess, requestMimeType, onerror)
	{
		return this.request(url, "GET", onsuccess, Rq.getData(), requestMimeType, onerror);
	}

	static post(url, onsuccess, data = Rq.getData(), requestMimeType, onerror)
	{
		return this.request(url, "POST", onsuccess, data, requestMimeType, onerror);
	}

	/**
	 * General purpose request method. Currently just a wrapper around jQuery. 
	 * This method has an aggressive retry policy to make sure no data is lost.
	 * @param {string} url 
	 * @param {string} method GET / POST / etc.
	 * @param {function} onsuccess Callback if the request was successful.
	 * @param {*} reqData The data to send. Usually a string.
	 * @param {string} requestMimeType 
	 * @param {function} onerror Callback if the request failed. 
	 */
	static request(url, method, onsuccess, reqData = Rq.getData(), requestMimeType="text/plain; charset="+config.LEVEL_ENCODING, onerror)
	{
		function tryToSend()
		{
			$.ajax({
				type: method,
				url: url,
				data: reqData,
				contentType: requestMimeType,
				success: function (respData, textStatus, request)
				{
					onsuccess(respData, 200, request.getResponseHeader);
				},
				// Retry on error
				error: function (request, textStatus, errorThrown)
				{
					if(typeof onerror === 'function')
						onerror(errorThrown);
						
					setTimeout(tryToSend, 1000); // 1000ms = 1 second
					console.error("Network error during " + method + " \"" + url + "\" (" +  errorThrown + ")");
				}
			});
		};

		tryToSend();
	}

	/**
	 * Get the standard payload, that will be send with every request. This is useful if you want to add aditional data to the payload. 
	 * You then need to pass this data structure to `Rq.get()`, `Rq.post()` or `Rq.request()`.
	 * @returns A struct containing the pseudonym and a time stamp.
	 */
	static getData()
	{
		return {"pseudonym": pseudonym, "timeStamp": Rq.now()}
	}

	/**
	 * Get the current time
	 * @returns Elapsed milliseconds since 01.01.1970 0:00 UTC. On Firefox the last 2 digits might be zero to prevent fingerprinting.
	 */
	static now()
	{
		return Date.now()
	}

	/*static request(url, method, onsuccess, charset="windows-1252", onerror)
	{
		function tryToSend()
		{
			let xhttp = new XMLHttpRequest();
			xhttp.overrideMimeType("text/plain; charset=" + charset);
			xhttp.onload = e => {
				// http status code: e.status
				
				onsuccess(xhttp.responseText, e.status, xhttp.getResponseHeader, e);
			}
			
			// Retry on error
			xhttp.onerror = function(e) {
				onerror(e);
				setTimeout(tryToSend(), 1000); // 1000ms = 1 Sekunde

				console.error("Network error while accessing \"" + url + "\" (" + method + ")");
			}
			
			xhttp.open(method, url, true);
			xhttp.send();
		}

		tryToSend();
	}*/
}
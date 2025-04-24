class JsonRPC
{
	static counter = 0;
	static sessionID = '';
	static messageQue = [];

	static callbacks = {};
	static statelessCallback = null;

	/**
	 * Add an RPC call to the JsonObject. Will be send either by `JsonRPC.flush()` or `JsonRPC.send()`.
	 * @param {string} method The function to remotely call.
	 * @param {*} params A list/dict of parameters to pass to the remotely called function.
	 * @param {*} callback Will be called with the result/error after the request is finished.
	 */
	static que(method, params, callback)
	{
		let message = this._createPayload(method, params);
		this.messageQue.push(message);

		if(typeof callback === "function")
			JsonRPC.callbacks[message["id"]] = callback;
	}

	/**
	 * Add an RPC call to the JsonObject and send it immediately.
	 * @param {string} method The function to remotely call.
	 * @param {*} params A list/dict of parameters to pass to the remotely called function.
	 * @param {*} callback Will be called with the result/error after the request is finished.
	 */
	static send(method, params, callback)
	{
		this.que(method, params, callback);
		this.flush();
	}

	/**
	 * Send all JsonRPC calls which are in the cue. Does nothing if the cue is empty.
	 * @returns Nothing
	 */
	static flush()
	{
		// Don't send empty message ques
		if(this.messageQue.length < 1)
			return;

		// Omit the `[]` brackets if only one event is send as required by the jsonRPC spec
		this._sendRPC((this.messageQue.length == 1 ? this.messageQue[0] : this.messageQue));
		this.messageQue = [];
	}

	/**
	 * Add an RPC call to the JsonObject and send it immediately. Packet index validation and session validation are
	 * disabled for this call (no packet index and session id are send).
	 * @param {string} method The function to remotely call.
	 * @param {*} params A list/dict of parameters to pass to the remotely called function.
	 * @param {*} callback Will be called with the result/error after the request is finished.
	 */
	static sendStateless(method, params, callback)
	{
		let message = this._createPayloadStateless(method, params);
		this.messageQue.push(message);

		if(typeof callback === "function" && this.statelessCallback == null)
			JsonRPC.statelessCallback = callback;

		this.flush();
	}

	static _createPayload(method, params)
	{
		return {
			"jsonrpc": "2.0",
			"method": method,
			"params": params,
			"id": this.counter++,
			"time": Rq.now(),
			"session": this.sessionID
		};
	}

	static _createPayloadStateless(method, params)
	{
		return {
			"jsonrpc": "2.0",
			"method": method,
			"params": params,
			"time": Rq.now(),
		};
	}

	static _sendRPC(payload, jsonRPC_url = '/action')
	{
		const url = jsonRPC_url;
		const data = JSON.stringify(payload);
		const method = 'POST';
		const contentType = 'application/json; charset=utf-8';
		const dataType = 'json';
		let retryCounter = 0;

		let tryToSend = function()
		{
			$.ajax({
				type: 'POST',
				url: jsonRPC_url,
				data: data,
				contentType: contentType,
				dataType: dataType,
				timeout: 30000, // ms
				beforeSend: (xhr) => {
					xhr.setRequestHeader("ui", pseudonym);
					xhr.setRequestHeader("time", String(Rq.now()));
				},
				success: function(data, textStatus, jqxhr)
				{
					let response = Array.isArray(data) ? data : [data];
					let resendPackets = false;
					
					for(let r of response)
					{
						// Check if response is valid
						if(r["jsonrpc"] != "2.0")
						{
							console.error("Malformed JsonRPC: ");
							console.error(r);
							continue;
						}

						// Retry if the packet arrives at the server out of order
						if("error" in r)
						{
							console.error('JsonRPC: ' + r.error.code + ' "' + r.error.message + '" (' + r.id + ')')
							console.error(payload);

							// S_PACKET_ORDER the packet was received in the wrong order, resend em
							if(r.error.code == JsonRPC.ERROR_PACKET_ORDER)
								resendPackets = true;

							if(r.error.code == JsonRPC.ERROR_SESSION_MISMATCH)
								JsonRPC.session_invalid = true;
						}
						
						// Run a callback for this message, but only if this message will not be resend due to an error
						if(!resendPackets && r["id"] in JsonRPC.callbacks)
						{
							let callback = JsonRPC.callbacks[r["id"]];
							if("result" in r)
								callback(r["result"], true);
							else if("error" in r)
								callback(r["error"], false);
							else
								console.error("Invalid response from server, it must contain either result or error!");
							
							// Remove the callback
							delete JsonRPC.callbacks[r["id"]];
						}
						else if(typeof JsonRPC.statelessCallback == 'function')
						{
							if("result" in r)
								JsonRPC.statelessCallback(r["result"], true);
							else if("error" in r)
								JsonRPC.statelessCallback(r["error"], false);
							else
								console.error("Invalid response from server, it must contain either result or error!");
							
							JsonRPC.statelessCallback = null;
						}
					}

					// If one of the packets was out of order, resend em
					if(resendPackets)
					{
						retryCounter += 1;
						setTimeout(tryToSend, JsonRPC.incrementalBackoff(retryCounter));
					}
				},
				// Retry on error
				error: function(request, textStatus, errorThrown)
				{
					retryCounter += 1;

					// Only try to resend packet, if the pseudonym is still valid
					if(reversim_pseudonymValid)
						setTimeout(tryToSend, JsonRPC.incrementalBackoff(retryCounter));

					console.error("Network error (" + textStatus + ") while accessing \"" + url + "\" (" + method + ") " + retryCounter);

					if(textStatus == "error")
						console.error(errorThrown);

					// Pseudonym is unknown, probably be due to a server restart
					if(request.responseJSON && request.responseJSON.error.code == -32001)
						pseudonymRejected();
				}
			});
		}

		tryToSend();
	}

	/**
	 * Slowly increase the time before resending the request. This way we don't accidentally DDOS the server if 
	 * something goes wrong. 
	 * @param {*} retryCounter The number of times the client tried to send this packet to the server
	 * @returns A time in milliseconds
	 */
	static incrementalBackoff(retryCounter)
	{
		const minTime = 90 // ms
		const variance = 0.2 // 20%
		const times = [100, 1000, 2000, 10000];
		const counters = [1, 5, 20, 50];
		console.assert(minTime > 0);
		console.assert(variance >= 0);
		console.assert(times.length == counters.length);

		for(var i=0; i<counters.length-1; i++)
		{
			if(retryCounter <= counters[i])
				break;
		}

		return Math.max(Math.ceil(times[i] + (Math.random() - 0.5) * times[i] * variance), minTime);
	}
}


/** 
 * If true, the session was invalidated due to the game being opened in a new window.
 * Checked by game.js@testConnection()
 */
JsonRPC.session_invalid = false;

// Magic numbers for the JsonRPC Error codes
JsonRPC.ERROR_PACKET_ORDER = -32003
JsonRPC.ERROR_SESSION_MISMATCH = -32005

class LevelFile
{
	/**
	 * Create a level file.
	 * @param {string} fileName 
	 * @param {string} fileContent 
	 */
	constructor(fileName = "unnamedLevel", fileContent = LevelFile.createEmpty())
	{
		this.fileName = fileName;
		this.fileContent = fileContent;
		this._isDirty = false;
		
		this.parseFile(fileContent);
	}

	/**
	 * 
	 * @param {string} fileContent 
	 */
	parseFile(fileContent)
	{
		this.parsedLines = [];
		this._isDirty = false;
		let ids = [];
		let levelDuration = null;

		for(let l of fileContent.split('\n'))
		{
			let pl = LevelLine.createFromLine(l, this);
			if(pl instanceof LevelElement)
			{
				if(isNaN(pl.id))
					throw new CircuitError('Invalid id in line "' + l + '"', -1);

				else if(ids.includes(pl.id))
					throw new CircuitError("Element IDs must be unique in the circuit, however " + pl.id + " is not!", pl.id);

				ids.push(pl.id);
			}
			else if(pl.key == 'time')
				levelDuration = Number(pl.params[0])
			this.parsedLines.push(pl);
		}

		if(levelDuration == null || isNaN(levelDuration))	
			throw new CircuitError("Missing required key 'time' ", -1);
	}

	static createEmpty()
	{
		return "time§0";
	}

	/**
	 * 
	 * @param {LevelLine} component 
	 */
	appendComponent(component)
	{
		this.parsedLines.push(component);
		this.fileContent += component.serializeComponent();
		this._isDirty = true;
	}

	/**
	 * 
	 * @param {LevelLine} component 
	 */
	deleteComponent(component)
	{
		const componentIndex = this.parsedLines.indexOf(component);
		const removedElement = this.parsedLines.splice(componentIndex, 1)[0]; // Store the element and then remove it

		// Also cut the connections from/to `removedElement`
		if(removedElement instanceof LevelElement)
			this.deleteAllConnectionsWithID(removedElement.id)
		
		this.writeFile();
	}

	/**
	 * Helper method to delete all `LevelConnection`s where `idToRemove` is either the start, or the endpoint.
	 * 
	 * NOTE: This method does not write to file, since it is only used by `deleteComponent()` which will do the writing
	 * 
	 * If the connection has more than one endpoint and `idToRemove` is one of them, it will only be removed from the
	 * list instead of the entire connection being deleted.
	 * @param {number} idToRemove 
	 */
	deleteAllConnectionsWithID(idToRemove)
	{
		let linesToRemove = [];

		// Iterate over all connections
		for(let idx=0; idx<this.parsedLines.length; idx++)
		{
			// Skip `value` if it is not a `LevelConnection`
			const value = this.parsedLines[idx];
			if(!(value instanceof LevelConnection))	
				continue;

			// Remove entire connection if the element was the origin of the connection
			if(value.fromElement.id == idToRemove)
				linesToRemove.push(idx);

			// Remove entire connection if `removedElement` was the only endpoint of that connection
			if(value.toElements.length == 1 && value.toElements[0].id == idToRemove)
			{
				linesToRemove.push(idx);
				continue;
			}

			// Cut the connection to `removedElement` if any
			value.toElements = value.toElements.filter((toElement) => {
				return toElement.id != idToRemove;
			});
		}
		
		// Delete all lines marked for removal in reverse order *after* iterating
		linesToRemove.reverse().forEach((l) => {
			this.parsedLines.splice(l, 1)}
		);

		var a = -1337;
	}

	deleteWire(startID, endID)
	{
		// Iterate over all connections
		for(let idx=0; idx<this.parsedLines.length; idx++)
		{
			// Skip anything that is not a `LevelConnection`
			const value = this.parsedLines[idx];
			if(!(value instanceof LevelConnection))	
				continue;

			// Filter any connection that does not start at `startID`
			if(value.fromElement.id != startID)
				continue;

			// Filter any connection that does not end at `endID`. The index will be -1 if the endpoint is not found
			const indexOfEndpoint = value.toElements.findIndex((toEl) => toEl.id == endID);
			if(indexOfEndpoint < 0)
				continue;
			
			// Delete entire connection if the only endpoint was endID, otherwise only cut the connection to that endpoint
			if(value.toElements.length == 1)
				this.parsedLines.splice(idx, 1);
			else
				value.toElements.splice(indexOfEndpoint, 1);
		}

		this.writeFile();
	}

	/**
	 * Helper method that finds the next smallest element id which is still available
	 * @returns Number
	 */
	nextElementID()
	{
		// There will always be a free id in the range 0 to `parsedLines.length`
		let ids = Array(this.parsedLines.length);
		
		// Set all ids to unoccupied
		for(let i=0; i<ids.length; i++)
			ids[i] = false;
		
		// Go through all `LevelLine`s skipping everything that is not a `LevelElement`
		for(let l of this.parsedLines)
		{
			if(!(l instanceof LevelElement))
				continue;
			
			// Prevent ArrayIndexOutOfBounds when id is larger than the number of components
			if(l.id >= ids.length)
				continue;
			
			// Sanity check for duplicate ids (ids that are larger than ids.length are not checked tho)
			if(ids[l.id])
				throw new LevelValidationError(l, "Duplicate ID " + l.id + " in level file!");
			
			// Mark the id as occupied
			ids[l.id] = true;
		}

		// Return the first free id within the range 0 to `ids.length`
		for(let i=0; i<ids.length; i++)
		{
			if(!ids[i])
				return i;
		}

		// No id was skipped (due to a deleted element etc.), return a new id
		return ids.length;
	}

	writeFile()
	{
		let connections = [];

		this.fileContent = "";
		this._isDirty = true;

		// Add everything that is not a `LevelConnection` to the output
		for(let l of this.parsedLines)
		{
			if(l instanceof LevelConnection)
				connections.push(l);
			else
				this.fileContent += l.serializeComponent();
		}

		// Append all connections at the end of the file
		for(let c of connections)
			this.fileContent += c.serializeComponent();

		this.fileContent = this.fileContent.trim();
		return this.fileContent;
	}

	saveFile()
	{
		this._isDirty = false;
		return this.fileContent;
	}

	getConnections()
	{
		let connections = [];

		for(let e of this.parsedLines)
		{
			if(e instanceof LevelConnection)
				connections.push(e);
		}

		return connections;
	}

	/**
	 * 
	 * @param {number} startID 
	 * @returns 
	 */
	getConnectionByStartID(startID)
	{
		for(let e of this.parsedLines)
		{
			if(e instanceof LevelConnection)
			{
				if(e.fromElement.id == startID)
					return e;
			}
		}

		return null;
	}

	/**
	 * 
	 * @param {number} id 
	 */
	getById(id)
	{
		for(let e of this.parsedLines)
		{
			if(e instanceof LevelElement && e.id == id)
				return e;
		}
	}

	/**
	 * Get the element closest to the clicked position within the specified radius.
	 * @param {number} xPos X-coordinate in level coords.
	 * @param {number} yPos Y-coordinate in level coords.
	 * @param {number} radius The radius in which the element must be. Must be a number >= 0
	 * @returns The logic element with the smallest distance to the cursor or `null`, if distance is too big
	 */
	getByPosition(xPos, yPos, radius = 40)
	{
		let bestRadius = radius;
		let bestCandidate = null;

		for(let e of this.parsedLines)
		{
			if(!(e instanceof LevelElement))
				continue;

			const ep = e.getPosition();
			const distance = Math.sqrt(Math.pow(ep.xPos - xPos, 2) + Math.pow(ep.yPos - yPos, 2));
			if(distance <= bestRadius)
			{
				bestCandidate = e;
				bestRadius = distance;
			}
		}

		return bestCandidate;
	}

	/**
	 * 
	 * @param {LevelConnection} connection 
	 * @returns 
	 */
	isCovertWireCandidate(connection)
	{
		if(connection.toElements.length != 1)
			return false;

		return connection.toElements[0].type == 'CovertGate';
	}

	isDirty()
	{
		return this._isDirty;
	}
}
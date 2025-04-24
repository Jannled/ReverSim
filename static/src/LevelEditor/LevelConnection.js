class LevelConnection extends LevelLine
{
	/**
	 * 1 to N Connection 
	 * @param {LevelElement} fromElement 
	 * @param {LevelElement[]} toElements 
	 * @param {boolean} isCovertWire
	 */
	constructor(fromElement, toElements, isCovertWire = false)
	{
		let ids = [fromElement.id, toElements[0].id];
		for(let i=1; i<toElements.length; i++)
			ids.push(toElements[i].id);
		super(isCovertWire ? LevelConnection.KEY_COVERT_CONNECTION : LevelConnection.KEY_NORMAL_CONNECTION, ids);

		this.fromElement = fromElement;
		this.toElements = toElements;
	}

	serializeComponent()
	{
		// The from and to element must always be present, add them first
		let ids = [this.fromElement.id, this.toElements[0].id];

		// Some elements like splitters might have more than one output, add them too
		for(let i=1; i<this.toElements.length; i++)
			ids.push(this.toElements[i].id);

		return super.serializeComponent(ids);
	}

	/**
	 * 
	 * @param {LevelElement} component 
	 */
	addConnection(component)
	{
		this.toElements.push(component);
	}

	/**
	 * 
	 * @returns {boolean} True if the connection is an actual covert gate connection, false if it is a normal connection.
	 */
	isCovertGate()
	{
		return this.key == LevelConnection.KEY_COVERT_CONNECTION;
	}

	/**
	 * 
	 * @param {boolean} isCovertCon True if the wire is an actual covert gate connection, false if it is a normal wire
	 */
	setConnectionType(isCovertCon)
	{
		if(isCovertCon)
			this.key = LevelConnection.KEY_COVERT_CONNECTION
		else
			this.key = LevelConnection.KEY_NORMAL_CONNECTION;
	}

	/**
	 * 
	 * @return A list of A and B coordinates in level space
	 */
	getConnectionCoords()
	{
		let coords = [];
		let fromE = this.fromElement.getPosition();
		for(let e of this.toElements)
		{
			let toE = e.getPosition();
			coords.push({'x1': fromE.xPos, 'y1': fromE.yPos, 'x2': toE.xPos, 'y2': toE.yPos, 'id1': this.fromElement.id, 'id2': e.id});
		}
		return coords;
	}
}

LevelConnection.KEY_COVERT_CONNECTION = 'effectiveCovertGateConnection';
LevelConnection.KEY_NORMAL_CONNECTION = 'connection';
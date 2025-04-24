class LevelLine
{
	/**
	 * 
	 * @param {string} key 
	 * @param {(string|number)[]} params
	 */
	constructor(key, params = [])
	{
		this.key = key;
		this.params = params;
	}

	/**
	 * Create a level line representing this component
	 * @param {(string | number)[]} values 
	 * @returns string
	 */
	serializeComponent(values = this.params)
	{
		// Generate standard element line
		let line = '\n' + this.key;

		// Append additional params to line
		for(let p of values)
			line += `§${p}`;

		return line;
	}

	/**
	 * Deserialize a component created by `this.serializeComponent()`
	 * @param {string} line 
	 * @param {LevelFile} levelFile
	 */
	static createFromLine(line, levelFile)
	{
		if(line.includes('Â') || line.includes('ï') || line.includes('¿') || line.includes('½')) // Âï¿½
			throw new CircuitError("The file was saved with the wrong encoding!", -1);

		const splitted = line.trim().split('§');
		const requiredParams = splitted.slice(1);
		if(splitted[0] == 'element')
		{
			const optionalParams = requiredParams.slice(5);

			return new LevelElement(requiredParams[1], Number(requiredParams[0]), Number(requiredParams[2]), 
				Number(requiredParams[3]), Number(requiredParams[4]), optionalParams
			);
		}
		else if([LevelConnection.KEY_NORMAL_CONNECTION, LevelConnection.KEY_COVERT_CONNECTION].includes(splitted[0]))
		{
			const isCovertWire = splitted[0] == LevelConnection.KEY_COVERT_CONNECTION;
			let toElements = [];
			for(let o of requiredParams.slice(1))
				toElements.push(levelFile.getById(Number(o)));

			return new LevelConnection(levelFile.getById(Number(requiredParams[0])), toElements, isCovertWire);
		}
		else
			return new LevelLine(splitted[0], requiredParams);
	}
}

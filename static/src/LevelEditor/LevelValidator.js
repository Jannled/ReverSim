class LevelValidator
{
	/**
	 * 
	 * @param {LevelFile} levelFile 
	 */
	static check(levelFile)
	{
		let coords = new Set();

		for(let l of levelFile.parsedLines)
		{
			if(l instanceof LevelElement)
			{
				LevelValidator.checkInView(l);
				
				const loc = Math.floor(l.getPosition().xPos) + "x" + Math.floor(l.getPosition().yPos);

				if(coords.has(loc))
					throw new CircuitError("Two elements overlap at " + loc + ".", l.id);
					//throw new LevelValidationError(l, "Two elements overlap at " + loc.toString() + ".");
				coords.add(loc);
			}
		}
	}

	/**
	 * 
	 * @param {LevelElement} levelElement 
	 */
	static checkInView(levelElement)
	{
		if(levelElement.xPos < 0 
			|| levelElement.yPos < 0 
			|| levelElement.xPos > LevelEditor.gridWidth 
			|| levelElement.yPos > LevelEditor.gridHeight
		)
			throw new LevelValidationError(levelElement, 
				`Element is out of view`
			);
	}

	/**
	 * 
	 * @param {LevelElement} levelElement 
	 * @param {LevelFile} levelFile
	 */
	static checkCovertValid(levelElement, levelFile)
	{
		if(levelElement.type != 'CovertGate')
			return;

		const visualGate = levelElement.getProperty('visualGate');
		const actualGate = levelElement.getProperty('actualGate');
		
		// Check if type is camouflaged gate
		if(visualGate == 'camouflaged')
		{

		}

		// Else type is a covert gate
		else
		{

		}
	}
}

class CircuitError extends Error
{
	/**
	 * 
	 * @param {string} message 
	 * @param {number} elementID Unique element ID in circuit
	 */
	constructor(message, elementID)
	{
		super(message);
		this.elementID = elementID;
	}
}

class LevelValidationError
{
	/**
	 * 
	 * @param {LevelElement} levelLine 
	 * @param {string} message 
	 */
	constructor(levelLine, message)
	{
		this.levelLine = levelLine;
		this.message = message;
	}

	toString()
	{
		return `#${this.levelLine.id} (${this.levelLine.xPos}, ${this.levelLine.yPos}): "${this.message}"`
	}
}
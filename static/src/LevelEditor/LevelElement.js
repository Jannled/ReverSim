class LevelElement extends LevelLine
{
	/**
	 * 
	 * @param {string} type 
	 * @param {number} id 
	 * @param {number} rotation If a number < 0 is specified, use the default rotation instead
	 * @param {number} xPos The midpoint x-coordinate of this element in level space
	 * @param {number} yPos The midpoint y-coordinate of this element in level space
	 * @param {string[]} params 
	 */
	constructor(type, id, rotation, xPos, yPos, params = [])
	{
		super('element', params);
		this.type = type;
		this.rotation = rotation < 0 ? LevelElement.getDefaultRotation(type) : rotation;
		this.xPos = xPos;
		this.yPos = yPos;
		this.id = id;

		const numParamsExpected = LevelElement.getNumAdditionalParams(type);

		if(numParamsExpected != params.length)
		{
			// TextBoxes use the § char for line breaks, therefore join the overflowing params together
			if(LevelElement.allowsLineBreaks(type))
			{
				const removed = params.splice(numParamsExpected);
				params[numParamsExpected - 1] += '§' + removed.join('§');
			}
			// The number of params didn't match, throw a warning
			else
				console.error(`LevelElement of type ${type} got ${params.length} params, but expected ${numParamsExpected}!`);	
		}

		this.params = params;
	}

	rotate()
	{
		this.rotation = (this.rotation + 1) % 3;
	}

	serializeComponent()
	{
		// Check preconditions
		if(!(this.type in LevelElement.elementTypes))
			throw "Unexpected type " + this.type;

		if(typeof this.rotation != 'number' || this.rotation < 0 || this.rotation > 3)
			throw "Invalid element rotation: " + this.rotation;

		return super.serializeComponent([this.id, this.type, this.rotation, this.xPos, this.yPos].concat(this.params));
	}

	/**
	 * Get the default image handle for a level element. 
	 * 
	 * The element might have multiple representations and effects, depending on its state.
	 * These are not taken into account by this method!
	 * @returns The Phaser resource handle for this image
	 */
	getComponentIcon()
	{
		return LevelElement.getComponentIcon(this.type);
	}

	getPosition()
	{
		return {'xPos': this.xPos, 'yPos': this.yPos, 'rotation': this.rotation};
	}

	getProperty(name)
	{
		const editableProperties = ['type', 'rotation', 'xPos', 'yPos'];
		const additionalParams = LevelElement.elementTypes[this.type]["params"];

		// Requested param is one of the normal params
		if(editableProperties.includes(name))
			return this[name];
		
		// If this element got some additional params, get em
		else if(Array.isArray(additionalParams))
		{
			for(let i=0; i<additionalParams.length; i++)
			{
				const pName = additionalParams[i][0];

				if(pName != name)
					continue;

				return this.params[i];
			}
		}
	}

	setProperty(name, value)
	{
		const editableProperties = ['type', 'rotation', 'xPos', 'yPos'];
		const additionalParams = LevelElement.elementTypes[this.type]["params"];

		if(editableProperties.includes(name))
			this[name] = PropertiesPanel.toNum(value);
		
		// If this element got some additional params, set em
		else if(Array.isArray(additionalParams) && additionalParams.length)
		{
			for(let i=0; i<additionalParams.length; i++)
			{
				const pName = additionalParams[i][0];
				const pType = additionalParams[i][1];

				if(pName != name)
					continue;

				switch(pType)
				{
					case "number": this.params[i] = String(PropertiesPanel.toNum(value)); break;
					case "boolean": this.params[i] = String(PropertiesPanel.toBool(value)); break;
					case "string": this.params[i] = String(value); break;
					case "enum": this.params[i] = String(value); break;
					default: console.error("Type " + pType + " unknown!"); break;
				}
			}
		}
	}

	static getComponentIcon(elementType)
	{
		return LevelElement.elementTypes[elementType]['icon'];
	}

	/**
	 * Get the default rotation for this element in the level file so that:
	 * 
	 * - Text fields are upright
	 * - The gates are oriented, so that the signal flows from left to right
	 * - The input port if the output gates is at the bottom
	 * 
	 * Note that these are historically grown to not be 0 for the default rotation and to
	 * differ from the 90° steps the image icon has to be rotated.
	 * 
	 * @param {string} elementType One of `LevelElement.elementTypes`
	 * @returns 
	 */
	static getDefaultRotation(elementType)
	{
		return LevelElement.elementTypes[elementType]['rot'];
	}

	/**
	 * Get the amount of 90° steps the level element icon has to be rotated to match the level file.
	 * 
	 * Note that these will be different from the rotation stored in the level file.
	 * @param {string} elementType One of `LevelElement.elementTypes`
	 * @returns 
	 */
	static getDefaultIconRotation(elementType)
	{
		try {
			const iconRot = LevelElement.elementTypes[elementType]['iconRot'];
			if(typeof iconRot != "number")
				return 0;
			return iconRot;
		} catch(e) {
			return 0;
		}
	}

	static getDefaultParams(elementType)
	{
		const additionalParams = LevelElement.elementTypes[elementType].params;

		// No additional params, return empty array
		if(!Array.isArray(additionalParams))
			return [];

		// Collect all default values
		let defaultVals = [];
		for(let [pName, pType, pDefaultValue] of additionalParams)
		{
			if(pType == 'enum')
				defaultVals.push(pDefaultValue[0]);
			else
				defaultVals.push(pDefaultValue);
		}

		return defaultVals;
	}

	/**
	 * Get the number of additional params, expected for this type of LevelElement .
	 * @param {string} elementType One of the types defined in `LevelElement.elementTypes`
	 * @returns 
	 */
	static getNumAdditionalParams(elementType)
	{
		const elementInfo = LevelElement.elementTypes[elementType];

		if('params' in elementInfo)
			return elementInfo.params.length;
		else
			return 0;
	}

	/**
	 * True if the last param of the element uses '§' chars to split lines
	 * @param {string} elementType One of the types defined in `LevelElement.elementTypes`
	 * @returns Right now this will only return true for `TextBox`es but other elements might be added in the future
	 */
	static allowsLineBreaks(elementType)
	{
		return elementType == 'TextBox';
	}
}

LevelElement.elementTypes = {
	"VCC": {
		"icon": "battery",
		"rot": 2,
		"iconRot": 1
	},
	"GND": {
		"icon": "battery_empty",
		"rot": 2,
		"iconRot": 1
	},
	"Inverter": {
		"icon": "inverter",
		"rot": 2,
		"iconRot": 1
	},
	"AndGate": {
		"icon": "and",
		"rot": 2,
		"iconRot": 1
	},
	"OrGate": {
		"icon": "or",
		"rot": 2,
		"iconRot": 1
	},
	"Splitter": {
		"icon": "splitter",
		"rot": 0
	},
	"Switch": {
		"icon": "switch_off",
		"rot": 2,
		"params": [
			["isClosed", "enum", ["false", "true", "random"]]
		]
	},
	"DangerSign": {
		"icon": "skullsign",
		"rot": 1
	},
	"LightBulb": {
		"icon": "bulb_on",
		"rot": 1
	},
	"CovertGate": {
		"icon": "camouflaged",
		"params": [
			["visualGate", "enum", ["camouflaged", "and", "or", "inverter", "splitter"]],
			["actualGate", "enum", ["and", "or", "inverter", "identity"]],
		],
		"rot": 2,
		"iconRot": 1
	},
	"TextBox": {
		"icon": "text",
		"rot": 0,
		"params": [
			["content", "string", "Hello World!"]
		]
	},
	//"Image": {
	//	"icon": "",
	//	"rot": 0,
	//	"params": [
	//		["imgName", "string", "not implemented yet"]
	//	]
	//}
};

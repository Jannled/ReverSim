/**
 * Container for all logic gates. Instantiated by Circuit.
 */
class LogicElementManager
{
	constructor(scene, levelFile, splittersAlwaysVisible = false)
	{
		this.scene = scene;
		this.levelFile = levelFile;
		this.splittersAlwaysVisible = splittersAlwaysVisible;

		/** Time limit in seconds for this level. 0 to disable. */
		this.timeLimit = 0;

		// create arrays to store all elements and subsets
		this.levelElements = {};
		this.vccs = new Array();
		this.gnds = new Array();
		this.switches = new Array();
		this.lightBulbs = new Array();
		this.dangerSigns = new Array();
		this.splitters = new Array();
		this.andGates = new Array();
		this.orGates = new Array();
		this.inverters = new Array();
		this.covertGates = new Array();

		// Wrap everything in a try catch: When an exception occurs in the constructor, the class attributes
		// are all deleted, therefore we have to clean up all resources beforehand, because otherwise we will
		// never be able to access them again.
		try {
			// function creates the instances for all objects and displays them
			this.displayElements();
		}
		catch(e) {
			this.cleanUp();
			throw e;
		}
	}


	/**
	 * Parse the level file and setup all elements and connections (logic gates, connections, etc)
	 */
	displayElements()
	{
		var fileEntries = this.levelFile.split(/\r?\n/);

		// process every line
		let line = 0;
		try
		{
			for(; line < fileEntries.length; line++)
			{
				// get first word of line
				let arrayEntry = fileEntries[line].split('§');
				switch(arrayEntry[0])
				{
					case "time": this.createTimer(arrayEntry); break; // read the time specified for this level
					case "element": this.createElement(arrayEntry); break; // subfunction determines the element type ;
					case "connection": this.createInOutputs(arrayEntry); break; // update connections of the elements ;
					case "effectiveCovertGateConnection": this.createEffectiveConnection(arrayEntry); break;
					case "": break; // ignore empty line or comment
					default: throw ("Invalid entry '" + arrayEntry + "'");
				}
			} // end of for-loop  
		} catch(error)
		{
			console.log(error);
			throw ({
				message: `An error occurred during level parsing in line ${line}: ${error}`,
				lineNumber: line,
				levelFile: fileEntries,
				origError: error,
			});
		}
	}


	/**
	 * Create a single element (switch, logic gate, lightbulb)
	 * @param {Array<string>} elementEntry The according level line in the level file, splitted into an array with § as the delimiter. There should at least be 6 entries.
	 */
	createElement(elementEntry)
	{
		// attributes of the element
		let idNmbr = parseInt(elementEntry[1]);
		let elementName = elementEntry[2];
		let rotation = parseInt(elementEntry[3]);
		let x = parseInt(elementEntry[4]);
		let y = parseInt(elementEntry[5]);

		// take action according to element type
		switch(elementName)
		{
			case "VCC": let newVCC = new VCC(this.scene, idNmbr, rotation, x, y);
				this.levelElements[idNmbr] = newVCC;
				this.vccs.push(newVCC);
				break;
			case "GND": let newGND = new GND(this.scene, idNmbr, rotation, x, y);
				this.levelElements[idNmbr] = newGND;
				this.gnds.push(newGND);
				break;
			case "Inverter": let newInverter = new Inverter(this.scene, idNmbr, rotation, x, y);
				this.levelElements[idNmbr] = newInverter;
				this.inverters.push(newInverter);
				break;
			case "AndGate": let newAndGate = new AndGate(this.scene, idNmbr, rotation, x, y);
				this.levelElements[idNmbr] = newAndGate;
				this.andGates.push(newAndGate);
				break;
			case "OrGate": let newOrGate = new OrGate(this.scene, idNmbr, rotation, x, y);
				this.levelElements[idNmbr] = newOrGate;
				this.orGates.push(newOrGate);
				break;
			case "Splitter": let newSplitter = new Splitter(this.scene, idNmbr, rotation, x, y, true, 
					this.splittersAlwaysVisible
				);
				this.levelElements[idNmbr] = newSplitter;
				this.splitters.push(newSplitter);
				break;
			case "Switch": let state = elementEntry[6];
				let newSwitch = new Switch(this.scene, idNmbr, rotation, x, y, state);
				this.levelElements[idNmbr] = newSwitch;
				this.switches.push(newSwitch);
				break;
			case "DangerSign": let newDangerSign = new DangerSign(this.scene, idNmbr, rotation, x, y, true);
				this.levelElements[idNmbr] = newDangerSign;
				this.dangerSigns.push(newDangerSign);
				break;
			case "LightBulb": let newLightBulb = new LightBulb(this.scene, idNmbr, rotation, x, y, true);
				this.levelElements[idNmbr] = newLightBulb;
				this.lightBulbs.push(newLightBulb);
				break;
			case "TextBox": var textString = [];
				for(var i = 6; i < elementEntry.length; i++)
				{
					textString = textString.concat(elementEntry[i]);
				}
				let newTextBox = new TextBox(this.scene, idNmbr, rotation, x, y, textString);
				this.levelElements[idNmbr] = newTextBox;
				break;
			case "CovertGate": let camouflageElement = elementEntry[6];
				let effectiveElement = elementEntry[7];
				let newCovertGate = new CovertGate(this.scene, idNmbr, rotation, x, y, camouflageElement, effectiveElement);
				this.levelElements[idNmbr] = newCovertGate;
				this.covertGates.push(newCovertGate);
				break;
			case "Image": // var image = this.scene.add.image();
				break;
			default: 
				if(LogicElementManager.strictParser)
					throw ("In Level file: unknown type of element '" + elementName + "'");
				else
					console.warn("[Level Parser]: unknown type of element '" + elementName + "'")	
		}
	}

	/** 
	 * Do this only if one input is a dummy = effective Element is inverter or identity
	 */
	createEffectiveConnection(connectionEntry)
	{
		try
		{
			var start_id = connectionEntry[1];
			var dest_id = connectionEntry[2];
			this.levelElements[start_id].addOutput(this.levelElements[dest_id]);
			this.levelElements[dest_id].setEffectiveInput(this.levelElements[start_id]);
		} catch(err)
		{
			throw ("Effective In-/Outputs could not be assigned to elements: " + err);
		}
		this.createInOutputs(connectionEntry);
	}


	createInOutputs(connectionEntry)
	{
		try
		{
			var start_id = connectionEntry[1];
			for(var i = 2; i < connectionEntry.length; i++)
			{
				var dest_id = connectionEntry[i];
				this.levelElements[start_id].addOutput(this.levelElements[dest_id]);
				this.levelElements[dest_id].addInput(this.levelElements[start_id]);
			}
		} catch(err)
		{
			throw ("In-/Outputs could not be assigned to elements: " + err);
		}
	}

	/**
	 * Read the level time limit in seconds. 0 seconds mean the timer is disabled.
	 * The string is parsed as a number and values below zero are clamped.
	 * The value is only stored, the actual timer logic resides inside GameScene
	 * @see GameScene
	 * @param {String[]} timeEntry Time limit in seconds, fractional numbers are allowed.
	 */
	createTimer(timeEntry)
	{
		const time = Number(timeEntry[1]);

		if(isNaN(time) || time < 0)
			console.error('Invalid time in level file: "' + timeEntry[1] + '"');

		this.timeLimit = Math.max(0, time);
	}


	getLogicElements()
	{
		return this.levelElements;
	}


	getSwitches()
	{
		return this.switches;
	}


	getLightBulbs()
	{
		return this.lightBulbs;
	}


	getDangerSigns()
	{
		return this.dangerSigns;
	}


	getSplitters()
	{
		return this.splitters;
	}


	getAndGates()
	{
		return this.andGates;
	}


	getOrGates()
	{
		return this.orGates;
	}


	getInverters()
	{
		return this.inverters;
	}

	getNumGates()
	{
		return this.getAndGates().length 
			+ this.getOrGates().length
			+ this.getInverters().length
			+ this.covertGates.length;
	}


	getSolvingState()
	{
		// check if difficulty is easy
		var valid = true;
		checkVal: if(true)
		{
			// check if every Bulb is on
			for(const bulb of this.lightBulbs)
			{
				if(!(bulb.getOutputState()))
				{
					valid = false;
					break checkVal;
				}
			}

			// check if every DangerSign is off
			for(const dangerSign of this.dangerSigns)
			{
				if(dangerSign.getOutputState())
				{
					valid = false;
					break checkVal;;
				}
			}
		}

		return valid;
	}


	/**
	 * Control the visualization of the logic states.
	 * @param {boolean} showWireState True if Splitters shall display their state to the user, false otherwise.
	 * @param {boolean} showOutputState True if LightBulbs & DangerSigns shall display their state to the user, false otherwise.
	 */
	setShowState(showWireState, showOutputState)
	{
		const outputElements = [].concat(this.splitters, this.lightBulbs, this.dangerSigns);

		// set showState
		for(const element of outputElements)
			element.setShowState(showOutputState);

		for(const splitter of this.splitters)
			splitter.setShowState(showWireState);
	}


	cleanUp()
	{
		for(const key in this.levelElements)
		{
			const element = this.levelElements[key];

			element.destroyAssets();
			element.destroy();
		}

		// create arrays to store all elements and subsets
		this.levelElements = {};
		this.vccs = [];
		this.gnds = [];
		this.switches = [];
		this.lightBulbs = [];
		this.dangerSigns = [];
		this.splitters = [];
		this.andGates = [];
		this.orGates = [];
		this.inverters = [];
		this.covertGates = [];
	}
}

LogicElementManager.strictParser = false;
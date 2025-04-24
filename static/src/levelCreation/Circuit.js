/**
 * 
 */
class Circuit
{
	constructor(scene, str, splittersAlwaysVisible = false)
	{
		this.scene = scene;
		this.file = str;
		this.splittersAlwaysVisible = splittersAlwaysVisible;

		this.loadElements();
	}


	loadElements()
	{
		// create LogicElements
		this.elementsManager = new LogicElementManager(this.scene, this.file, this.splittersAlwaysVisible);
		this.elementsManager.setShowState(true, true);

		// add wires
		var layouter = new Layouter(this.scene, this.elementsManager.getLogicElements());
		var wires = layouter.computeOutputWire();

		// draw wires
		this.wireDrawer = new LineDrawer(this.scene, wires, true);
	}

	/**
	 * Control the visualization of the logic states.
	 * @param {boolean} showWireState True if Wires & Splitters shall display their state to the user, false otherwise.
	 * @param {boolean} showOutputState True if LightBulbs & DangerSigns shall display their state to the user, false otherwise.
	 */
	setShowState(showWireState, showOutputState)
	{
		this.wireDrawer.setShowState(showWireState);
		this.elementsManager.setShowState(showWireState, showOutputState);
	}

	/**
	 * Set if the circuit is interactive or not 
	 * @param {boolean} state If true, the switches can be clicked, if false the switches ignore user input. 
	 */
	setInteractive(state)
	{
		let switches = this.elementsManager.getSwitches();
		if(state)
		{
			for(var switchObj of switches)
				switchObj.setInteractive();
		}
		else
		{
			for(var switchObj of switches)
				switchObj.disableInteractive();
		}
	}

	cleanUp()
	{
		this.elementsManager.cleanUp();
		this.wireDrawer.destroyAssets();
	}

	
	getSwitches()
	{
		return this.elementsManager.getSwitches();
	}


	getBulbs()
	{
		return this.elementsManager.getLightBulbs();
	}
	

	getDangerSigns()
	{
		return this.elementsManager.getDangerSigns();
	}


	getSolvingState()
	{
		// test wether all bulbs are turned on
		var state = 1;
		for(const endPoint of this.getBulbs())
		{
			state *= state * endPoint.getOutputState();
		}
		if(state != 1) return 0;

		// test wether all danger signs are turned off
		state = 0;
		for(const endPoint of this.getDangerSigns())
		{
			state += state + endPoint.getOutputState();
		}
		if(state != 0) return 0;

		// all danger signs are turned off and all bulbs are turned on
		return 1;
	}

	/**
	 * Calculate the possible solutions for the circuit.
	 * @param {boolean} firstSolution True if we are looking for a solution with minimal hamming weight.
	 * @param {number[]} initialSwitchStates The initial switch states used for hamming distance calculation.
	 * @returns 
	 */
	calculateAllSolutions(firstSolution, initialSwitchStates)
	{
		let switches = this.getSwitches();
		var storeStates = [];
		var nmbrSwitches = switches.length;
		let correctSolutions = [];
		console.assert(initialSwitchStates.length == this.getSwitches().length);
		
		// capture circuit state
		for(var i = 0; i < nmbrSwitches; i++)
			storeStates.push(switches[i].switchState);

		var minHD = Math.pow(2, nmbrSwitches);

		// try all switch combinations
		for(let ctr = 0; ctr < Math.pow(2, nmbrSwitches); ctr++)
		{
			// pick switch states
			let states = ctr.toString(2).padStart(nmbrSwitches, '0');
			
			// calculate Hamming distance to initial states
			let hd = 0;
			for (let i = 0; i < nmbrSwitches; i++) {
				// @ts-ignore
				if (states.charAt(nmbrSwitches - i - 1) != initialSwitchStates[i]) {
					hd++;
				}
			}

			// early exit if we know a more efficient solution (and `firstSolution` is set to true)
			if (firstSolution && (hd > minHD))
				continue;

			// assign values to switches
			for(var i = 0; i < nmbrSwitches; i++)
				switches[i].switchState = states.charAt(nmbrSwitches - i - 1);

			this.calculateOutputs();

			// If this is a correct solution, update hamming weight and list of correct solutions
			if(this.getSolvingState())
			{
				minHD = hd;
				// Invert the order, since the states are applied to the switches also in reverse order
				correctSolutions.push(Array.from(states).reverse().join(''));
			}
		}

		// restore circuit state
		for(var i = 0; i < nmbrSwitches; i++)
			switches[i].switchState = storeStates[i];
		this.calculateOutputs();

		return {
			switchIDs: switches.map(s => s.getID()), // Legend for the correct solution
			initialSwitchStates: initialSwitchStates, // Includes random switch states (without player interaction)
			correctSolutions: correctSolutions,
			minHD: minHD, // Minimal hamming distance to initial switch state
		};
	}

	calculateOutputs()
	{
		let endPoint = null;

		try 
		{
			// set OutputState of all elements recursively
			for(endPoint of this.getBulbs())
			{
				endPoint.setOutputState();
			}

			// set OutputState of all elements recursively
			for(endPoint of this.getDangerSigns())
			{
				endPoint.setOutputState();
			}
		}
		catch(error)
		{
			// Circuit errors already contain all relevant information, bubble up
			if(error instanceof CircuitError)
				throw error;
			
			// Make a guess which element might have caused the error and trow the original exception
			error.faultyElement = Number(endPoint);
			throw error;
		}
	}


	getElementStates()
	{
		// Log Switch Click
		var str = '\n§Switch_States [ID, click state, outputstate]: ';

		// get all Switches
		for(const switchElement of this.elementsManager.getSwitches())
		{
			str += '[' + switchElement.id.toString() + ', ' + switchElement.switchState + ', ' + switchElement.getOutputState().toString() + ']';
		}

		if(this.elementsManager.getLightBulbs().length != 0) str += '\n§Bulb_States [ID, output state]: ';
		// get all bulb states
		for(const bulb of this.elementsManager.getLightBulbs())
		{
			str += '[' + bulb.id.toString() + ', ' + bulb.getOutputState().toString() + ']';
		}

		if(this.elementsManager.getDangerSigns().length != 0) str += '\n§DangerSign_States [ID, output state]: ';
		// get all danger sign states
		for(const dangerSign of this.elementsManager.getDangerSigns())
		{
			str += '[' + dangerSign.id.toString() + ', ' + dangerSign.getOutputState().toString() + ']';
		}

		if(this.elementsManager.getInverters().length != 0) str += '\n§Inverter_States [ID, output state]: ';
		// get all danger sign states
		for(const inverter of this.elementsManager.getInverters())
		{
			str += '[' + inverter.id.toString() + ', ' + inverter.getOutputState().toString() + ']';
		}

		if(this.elementsManager.getAndGates().length != 0) str += '\n§And-Gate_States [ID, output state]: ';
		// get all danger sign states
		for(const andGate of this.elementsManager.getAndGates())
		{
			str += '[' + andGate.id.toString() + ', ' + andGate.getOutputState().toString() + ']';
		}

		if(this.elementsManager.getOrGates().length != 0) str += '\n§Or-Gate_States [ID, output state]: ';
		// get all danger sign states
		for(const orGate of this.elementsManager.getOrGates())
		{
			str += '[' + orGate.id.toString() + ', ' + orGate.getOutputState().toString() + ']';
		}

		return str;
	}

	getElementState(logicElements)
	{
		let output = {};
		
		for(let le of logicElements)
			output["" + le.id] = le.getOutputState() ? 1 : 0;

		return output;
	}

	getElementStatesJson()
	{
		let output = {"s_switch": this.getElementState(this.elementsManager.getSwitches())};

		if(this.elementsManager.getLightBulbs().length != 0)
			output["s_bulb"] = this.getElementState(this.elementsManager.getLightBulbs());
		if(this.elementsManager.getDangerSigns().length != 0)
			output["s_danger"] = this.getElementState(this.elementsManager.getDangerSigns());
		if(this.elementsManager.getInverters().length != 0)
			output["s_not"] = this.getElementState(this.elementsManager.getInverters());
		if(this.elementsManager.getAndGates().length != 0)
			output["s_and"] = this.getElementState(this.elementsManager.getAndGates());
		if(this.elementsManager.getOrGates().length != 0)
			output["s_or"] = this.getElementState(this.elementsManager.getOrGates());

		return output;
	}

	disableVisibilityOfEndElements()
	{
		for(var element of this.elementsManager.dangerSigns)
		{
			element.setVisible(false);
		}

		for(var element of this.elementsManager.lightBulbs)
		{
			element.setVisible(false);
		}
	}

	setVisible()
	{
		const levelElements = this.elementsManager.getLogicElements();

		// set visibility of elements
		for(var key in levelElements)
		{
			levelElements[key].setVisible(false);
		}

		// set visibility of wires 
	}

	setMask(mask)
	{
		const levelElements = this.elementsManager.getLogicElements();

		// set visibility of elements
		for(var key in levelElements)
		{
			levelElements[key].setMask(mask);
		}

		// set mask for wires 
		this.wireDrawer.setMask(mask);
	}

	setScale(scaleFactor)
	{
		const levelElements = this.elementsManager.getLogicElements();

		for(const key in levelElements)
		{
			var element = levelElements[key];
			element.setScale(scaleFactor);
		}

		this.wireDrawer.setScale(scaleFactor);
	}


	setDepth(depth)
	{
		const levelElements = this.elementsManager.getLogicElements();

		for(const key in levelElements)
		{
			var element = levelElements[key];
			element.setDepth(depth);
		}
		this.wireDrawer.setDepth(depth - 1);
	}

	disableVisibilityOfSourceElements()
	{
		for(var element of this.elementsManager.vccs)
		{
			element.setVisible(false);
		}

		for(var element of this.elementsManager.gnds)
		{
			element.setVisible(false);
		}
	}
}

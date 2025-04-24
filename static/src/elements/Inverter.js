/**
 * 
 */
class Inverter extends Component
{
	constructor(scene, id, rotation, x, y)
	{
		super(scene, id, rotation, x, y);
		this.setName("Inverter (" + id + ")");

		// add image
		this.addImage('inverter');
	}


	getOutputPort()
	{
		return this.layoutOutputPort();
	}


	layoutOutputPort()
	{
		return Component.layoutPort(this.x, this.y, this.rotation);
	}


	layoutInputPort()
	{
		var inputElements = Array.from(this.inputs);
		if(inputElements.length != 1)
		{
			throw new CircuitError("An Inverter must have at most 1 input!", this.id);
		}

		var inputPort = Component.layoutPort(this.x, this.y, this.rotation);
		this.inputPortMap.set(inputElements[0], inputPort);

		return this.inputPortMap;
	}


	setOutputState()
	{
		var inputs = Array.from(this.inputs);
		
		try
		{
			// Invert the output state
			this.outputState = inputs[0].setOutputState() ? 0 : 1;
		}
		catch(e)
		{
			// Throw a helpful error message for usage in the level editor
			if(!(inputs[0] instanceof Component))
				throw new CircuitError("The inverter input is unconnected!", this.id);
			else
				throw e;
		}

		return this.outputState;
	}
}

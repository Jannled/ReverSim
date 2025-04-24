/**
 * 
 */
class OrGate extends Component
{
	constructor(scene, id, rotation, x, y)
	{
		super(scene, id, rotation, x, y);
		this.setName("OR-Gate (" + id + ")");

		this.addImage('or');
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
		const inputSize = this.getInputs().size;
		const inputSet = this.getInputs();
		const inputElements = Array.from(inputSet);

		const points = Component.layoutMultiport(this.x, this.y, this.rotation, inputSize);
		this.inputPortMap = Component.multiInputPortAssignment(this.inputPortMap, inputElements, points);

		return this.inputPortMap;
	}


	setOutputState()
	{
		var outputState = 0;
		for(var element of this.getInputs())
		{
			outputState = outputState + element.setOutputState();
		}
		this.outputState = outputState > 0 ? 1 : 0;
		return this.outputState;
	}
}

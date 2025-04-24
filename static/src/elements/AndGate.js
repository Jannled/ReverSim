/**
 * 
 */
class AndGate extends Component
{
	constructor(scene, id, rotation, x, y)
	{
		super(scene, id, rotation, x, y);
		this.setName("AND-Gate (" + id + ")");

		// add images
		this.addImage('and');
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
		var inputSize = this.getInputs().size;
		var inputSet = this.getInputs();
		var inputElements = Array.from(inputSet);

		const points = Component.layoutMultiport(this.x, this.y, this.rotation, inputSize);
		this.inputPortMap = Component.multiInputPortAssignment(this.inputPortMap, inputElements, points);

		return this.inputPortMap;
	}


	setOutputState()
	{
		var outputState = 1;
		for(var element of this.getInputs())
		{
			outputState = outputState * element.setOutputState();
		}
		this.outputState = outputState;
		return this.outputState;

	}
}

/**
 * 
 */
class GND extends Component
{
	constructor(scene, id, rotation, x, y)
	{
		super(scene, id, rotation, x, y);
		this.setName("InputLow (" + id + ")");

		this.addImage('battery_empty');
	}

	getOutputPort()
	{
		return this.layoutOutputPort();
	}


	layoutOutputPort()
	{
		return Component.layoutPort(this.x, this.y, this.rotation, 0, -20);
	}

	getOutputState()
	{
		return 0;
	}


	setOutputState()
	{
		// update outputState
		this.outputState = 0;
		return this.outputState;
	}
}

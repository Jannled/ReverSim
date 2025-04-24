/**
 * 
 */
class VCC extends Component
{
	constructor(scene, id, rotation, x, y)
	{
		super(scene, id, rotation, x, y);
		this.setName("InputHigh (" + id + ")");

		this.addImage('battery');
		
		this.scene.events.on('update', this.update, this);
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
		return 1;
	}


	setOutputState()
	{
		// update outputState
		this.outputState = 1;
		return this.outputState;
	}


}

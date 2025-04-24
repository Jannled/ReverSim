/**
 * 
 */
class LightBulb extends Component
{
	constructor(scene, id, rotation, x, y, showState)
	{
		super(scene, id, rotation, x, y);
		this.setName("LightBulb (" + id + ")");

		// determines wether the state of the light bulb can be interpreted via the image
		this.showState = showState;

		// add images
		this.addImage('bulb_off', false);
		this.addImage('bulb_on', false);

		// activates the render function for this image
		this.scene.events.on('render', this.render, this);
	}


	layoutInputPort()
	{
		var inputElements = Array.from(this.inputs);
		if(inputElements.length != 1)
		{
			throw new CircuitError("A light bulb needs exactly one connection", this.id);
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
			this.outputState = inputs[0].setOutputState();
		} 
		catch(e) 
		{
			// Throw a helpful error message for usage in the level editor
			if(!(inputs[0] instanceof Component))
				throw new CircuitError("A light bulb needs exactly one connection", this.id);
			else
				throw e;
		}
		
		return this.outputState;
	}


	renderImage()
	{

		if(this.showState == false)
		{
			this.pic[0].visible = true;
			this.pic[1].visible = false;
			return;
		}

		if(this.outputState == 1)
		{
			this.pic[0].visible = false;
			this.pic[1].visible = true;
		} else
		{
			this.pic[0].visible = true;
			this.pic[1].visible = false;
		}
	}


	getShowState()
	{
		return this.showState;
	}

	setShowState(bool)
	{
		this.showState = bool;
	}


	render()
	{
		this.renderImage();
	}

	// @Override
	getActiveImage()
	{
		if(this.showState == true && this.outputState == 1)
			return this.pic[1]; // Light Bulb is glowing
		else
			return this.pic[0]; // Light Bulb is off
	}
}

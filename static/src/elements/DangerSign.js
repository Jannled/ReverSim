/**
 * 
 */
class DangerSign extends Component
{
	constructor(scene, id, rotation, x, y, showState)
	{
		super(scene, id, rotation, x, y);
		this.setName("Danger-Sign (" + id + ")");

		this.showState = showState;

		// add images
		var imageDangerSignOff = this.addImage('shocksign_gray')
			.setAlpha(1);

		var imageDangerSignOn = this.addImage('skullsign')
			.setAlpha(1);

		// create lightning effect
		let lightningPos = scene.levelToScreenCoords(this.x, this.y);
		this.lightning = new Lightning(this.scene, lightningPos.x, lightningPos.y);
		this.lightning.createImage();

		// activate the render function for this object
		this.scene.events.on('render', this.render, this);

	}


	layoutInputPort()
	{
		var inputElements = Array.from(this.inputs);
		if(inputElements.length != 1)
		{
			throw new CircuitError("A danger sign needs exactly one connection", this.id);
		}

		var inputPort = Component.layoutPort(this.x, this.y, this.rotation, 0, 18);
		this.inputPortMap.set(inputElements[0], inputPort);

		return this.inputPortMap;
	}


	render()
	{
		this.renderImage();
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
				throw new CircuitError("A danger sign needs exactly one connection", this.id);
			else
				throw e;
		}

		return this.outputState;

	}


	renderImage()
	{
		if(this.pic[0].visible == false && this.pic[1].visible == false)
		{
			return;
		}

		if(this.showState == false)
		{
			this.pic[0].visible = true;
			this.pic[1].visible = false;
			// stop lightning animation if not stopped yet
			if(this.lightning.timedEvent != null)
			{
				this.lightning.stopAnimation();
			}
			return;
		}

		if(this.outputState == 1)
		{
			this.pic[0].visible = false;
			this.pic[1].visible = true;
			// start lightning animation if not started yet
			if(this.lightning.timedEvent == null)
			{
				this.lightning.startAnimation();
			}
		} else
		{
			this.pic[0].visible = true;
			this.pic[1].visible = false;
			// stop lightning animation if nit stopped yet
			if(this.lightning.timedEvent != null)
			{
				this.lightning.stopAnimation();
			}
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


	destroyAssets()
	{
		super.destroyAssets();
		this.showState = false;

		this.lightning.cleanUp();
		this.lightning.destroy();
	}

	setScale(scaleFactor)
	{
		for(var image of this.pic)
		{
			image.setScale(scaleFactor, scaleFactor);

			// scale lightning
			this.lightning.setScale(scaleFactor);

		}
	}

	// @Override
	getActiveImage()
	{
		if(this.showState == true && this.outputState == 1)
			return this.pic[1]; // Danger sign is flashing
		else
			return this.pic[0]; // Danger sign is off
	}
}

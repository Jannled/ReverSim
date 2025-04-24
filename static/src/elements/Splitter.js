/**
 * 
 */
class Splitter extends Component
{
	constructor(scene, id, rotation, x, y, showState, forceVisible=false)
	{
		super(scene, id, rotation, x, y);
		this.setName("Splitter (" + id + ")");

		this.showState = showState;
		this.forceVisible = forceVisible;

		let pos = this.scene.levelToScreenCoords(this.x, this.y);
		var circleYellow = this.scene.add.circle(pos.x, pos.y, 5, LineDrawer.wireOnColor);
		var circleGrey = this.scene.add.circle(pos.x, pos.y, 5, LineDrawer.wireOffColor);

		// create a 'pen'
		this.graphics = this.scene.add.graphics();

		circleYellow.setDepth(20);
		circleGrey.setDepth(20);

		circleGrey.setVisible(false);
		circleYellow.setVisible(false);

		this.pic = [circleGrey, circleYellow];

		this.scene.events.on('render', this.render, this);
	}



	renderImage()
	{
		var nmbrOutputs = this.outputs.size;
		if(nmbrOutputs <= 1 && !this.forceVisible)
		{
			this.pic[0].setVisible(false);
			this.pic[1].setVisible(false);
			return;
		}

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

	render()
	{
		this.renderImage();
	}


	getShowState()
	{
		return this.showState;
	}


	setShowState(bool)
	{
		this.showState = bool;
	}


	setOutputState()
	{
		// update outputState
		var inputs = Array.from(this.inputs);

		try
		{
			this.outputState = inputs[0].setOutputState();
		}
		catch(e)
		{
			// Throw a helpful error message for usage in the level editor
			if(!(inputs[0] instanceof Component))
				throw new CircuitError("The splitter input is unconnected!", this.id);
			else
				throw e;
		}
		
		return this.outputState;
	}


	destroyAssets()
	{
		super.destroyAssets();
		
		this.graphics.destroy();
	}


	layoutOutputPort()
	{
		return this.Pos;
	}


	layoutInputPort()
	{
		var inputElements = Array.from(this.inputs);
		if(inputElements.length != 1)
		{
			throw new CircuitError("A splitter must have at most one input!", this.id)
		}

		var inputPort = this.Pos;
		this.inputPortMap.set(inputElements[0], inputPort);

		return this.inputPortMap;
	}
}

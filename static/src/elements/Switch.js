/**
 * 
 */
class Switch extends Component
{
	constructor(scene, id, rotation, x, y, switchState)
	{
		super(scene, id, rotation, x, y);
		this.setName("Switch (" + id + ")");

		// possible values are "true", "false", "random";
		// in the random case, the server generates the random position and
		// sends us a switchOverride state, which is replayed onto the level
		// later; hence it's OK to just pretend the switch is off here
		this.switchState = (switchState == 'true' ? 1 : 0);
		this._switchStateInitial = switchState // The switch state from the level file

		// create a classical switch
		this.switchOn = this.addImage(Switch.imageClosed, false)
			.setInteractive()
			.setAngle((this.rotation - 2) * 90)
			.setData('type', 'Switch')
			.setData('element', this)
			.setData('id', id.toString());

		this.switchOff = this.addImage(Switch.imageOpen, false)
			.setInteractive()
			.setAngle((this.rotation - 2) * 90)
			.setData('type', 'Switch')
			.setData('element', this)
			.setData('id', id.toString());

		this.changeSwitchPic();

		this.scene.events.on('update', this.update, this);
	}

	changeSwitchPic()
	{
		if(this.switchState)
		{
			this.switchOn.setVisible(true);
			this.switchOff.setVisible(false);
		} else
		{
			this.switchOn.setVisible(false);
			this.switchOff.setVisible(true);
		}
	}

	switchClicked(switchState = !this.switchState)
	{
		this.switchState = switchState ? 1 : 0;
		this.changeSwitchPic();
	}

	setOutputState()
	{
		// update outputState
		var inputs = Array.from(this.inputs);

		try
		{
			this.outputState = inputs[0].setOutputState() * this.switchState;
		}
		catch(e)
		{
			// Throw a helpful error message for usage in the level editor
			if(!(inputs[0] instanceof Component))
				throw new CircuitError("The switch input is unconnected!", this.id);
			else
				throw e;
		}
		
		return this.outputState;
	}

	getOutputPort()
	{
		return this.layoutOutputPort();
	}

	layoutOutputPort()
	{
		return Component.layoutPort(this.x, this.y, this.rotation - 1, 25, 0);
	}

	layoutInputPort()
	{
		var inputElements = Array.from(this.inputs);
		if(inputElements.length != 1)
			throw new CircuitError("A switch must have at most one input!", this.id);

		var inputPort = Component.layoutPort(this.x, this.y, this.rotation - 1, -25, 0);
		this.inputPortMap.set(inputElements[0], inputPort);

		return this.inputPortMap;
	}

	setInteractive()
	{
		super.setInteractive();

		for(const pic of this.pic)
		{
			pic.setInteractive();
			pic.setAlpha(1);
		}

		return this;
	}

	disableInteractive()
	{
		super.disableInteractive();
		
		for(const pic of this.pic)
		{
			pic.disableInteractive();
			pic.setAlpha(0.5);
		}

		return this;
	}

	// @Override
	getActiveImage()
	{
		if(this.switchState)
			return this.switchOn;
		else
			return this.switchOff;
	}
}

Switch.imageOpen = 'switch_off'
Switch.imageClosed = 'switch_on'
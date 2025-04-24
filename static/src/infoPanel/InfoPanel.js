class Panel
{
	/**
	 * Overlay over the scene. Usually used to display screen filling information.
	 * @param {BaseScene} scene 
	 */
	constructor(scene)
	{
		this.scene = scene;

		// store all class objects
		this.classObjects = [];
	}

	/**
	 * Add a bigger smaller animation to the button
	 * @param {RectButton} button 
	 */
	highlightButton(button, targetSize = 1.1, duration = 1500)
	{
		AniLib.scaleUpDownAnimation(button.getObjects(), targetSize, targetSize, duration, this.scene);
	}

	/**
	 * Clear all objects created by this panel. This method should be called after the user closes the panel.
	 */
	cleanUp()
	{
		for(const obj of this.classObjects)
		{
			try
			{
				if(obj.cleanUpAssets)
					obj.cleanUpAssets();
				if(obj.cleanUp)
					obj.cleanUp();
			} catch(e) {
				console.error(e);
			}

			if(obj.destroy)
				obj.destroy();
		}
	}
}

/**
 * Normal info panels, will be shown when an info screen is configured in the level list
 */
class InfoPanel extends Panel
{
	/**
	 * 
	 * @param {BaseScene} scene 
	 * @param {string} file 
	 */
	constructor(scene, file)
	{
		super(scene);
		this.file = file;

		let labels = LangDict.load(file);
		console.assert(labels.length > 0, "ERROR: The InfoPanel is empty!");
		for(var label of labels)
		{
			let txtObject = AddText.addTextFromInfoPanel(this.scene, label);
			txtObject.setStyle({
				wordWrap: { width: config.width * 0.9, useAdvancedWrap: true }
			});
			this.classObjects.push(txtObject);
		}

		var x = config.width / 2;

		var lastTextObj = this.classObjects[this.classObjects.length - 1].getBottomCenter()
		var y = lastTextObj['y'] + 20;

		this.continueButton = new RectButton(this.scene, x, y, 'continue', 'center', 'Continue');
		this.classObjects.push(this.continueButton);
	}

	disableInteractive() {
		this.continueButton.disableInteractive();
	}

	setInteractive(interactive) {
		this.continueButton.setInteractive(interactive);
	}
}

/**
 * Tutorial Panel, used by IntroduceCamouflageOptionOne and IntroduceCamouflageOptionThree
 */
class TutorialPanel extends Panel
{
	/**
	 * Create a new TutorialPanel
	 * @param {*} scene The parent Scene
	 * @param {*} phase Name for this TutorialPanel
	 */
	constructor(scene, phase = 'TutorialPanel')
	{
		super(scene);
		this.phase = phase;
		this.circuit = null;

		// create continue button
		this.button = new RectButton(this.scene, 0, 0, 'continue', 'right', 'ContinueTut');
		this.button.setVisible(false);
		AniLib.scaleUpDownAnimation(this.button.getObjects(), 1.1, 1.1, 2000, this.scene);
		this.classObjects.push(this.button);

		this.scene.registerClickListener('ContinueTut', this.onTutContinueButtonPressed.bind(this))
	}

	/**
	 * Continue to the following level/info slide (whatever is next in the que)
	 */
	onTutContinueButtonPressed()
	{
		this.scene.next();
	}

	/**
	 * Called when the user interacted witch a switch.
	 * @param {Component} gameObject Reference to the switch that was clicked.
	 */
	onSwitchClick(gameObject)
	{
		if(!(this.circuit instanceof Circuit))
			return;

		// change switch state
		var element = gameObject.getData('element');
		element.switchState = !element.switchState;

		// change switch pic
		element.changeSwitchPic();

		// calculate outputs
		this.circuit.calculateOutputs();
		this.circuit.wireDrawer.drawWires();

		var solvedState = this.circuit.getSolvingState()
		JsonRPC.send("switch", {"id": gameObject.getData('id'), "solved": solvedState})

		// if solution correct then display information
		if(solvedState)
			this.onLevelSolved();
		else
			this.onLevelFailed();
	}

	onLevelSolved() 
	{

	}

	onLevelFailed()
	{

	}

	disableInteractive() 
	{
		this.button.disableInteractive();

		if(this.circuit instanceof Circuit)
			this.circuit.setInteractive(false);
	}

	/**
	 * Clean up all resources used by this Panel
	 */
	cleanUp()
	{
		super.cleanUp();
		if("circuit" in this)
			this.circuit.cleanUp();
	}
}
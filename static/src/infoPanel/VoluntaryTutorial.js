class VoluntaryTutorial extends InfoPanel
{
	/**
	 * Allow the player to voluntarily repeat the IntroduceElements, if he/she feels insecure.
	 * @param {BaseScene} scene The Base scene in which this slide is shown.
	 * @param {string} infoContent Same content as if this was an info panel.
	 */
	constructor(scene, infoContent)
	{
		super(scene, infoContent);

		if(!(this.scene instanceof QualiScene))
			console.error("The voluntary tutorial slide should only be used inside the Quali Phase!");

		const hCenter = config.width/2;
		const hOffset = 150;
		const vPos = 500;
		const marginFac = 0.9

		// Add choice buttons
		this.buttonRept = new RectButton(this.scene, hCenter - hOffset, vPos, 'repeatTutorial', 'center', 'RepeatTutorial');
		this.classObjects.push(this.buttonRept);
		this.continueButton.setPosition(hCenter + hOffset, vPos);
		
		// 'Continue' event should already be registered in BaseScene, 'RepeatTutorial' however is new
		this.scene.registerClickListener('RepeatTutorial', this.onRepeatTutorial.bind(this));
	}

	/**
	 * Send a quali failed event to the server and request the next level/phase
	 */
	onRepeatTutorial()
	{
		JsonRPC.que("qualiState", {"failed": true});
		this.scene.next();
	}

	// @Override
	disableInteractive()
	{
		super.disableInteractive();
		this.buttonRept.setInteractive(false);
	}
}

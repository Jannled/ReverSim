class IntroduceCamouflageOptionThree extends ObfuscatedGateIntro
{
	/**
	 * Intro slide for the covert gate.
	 * @param {BaseScene} scene The scene where this slide will be shown
	 */
	constructor(scene)
	{
		super(
			scene, 'IntroduceCamouflageOptionThree',
			'assets/levels/elementIntroduction/introduce_camouflage_option_3.txt',
			'assets/levels/elementIntroduction/challenge_introduction_camouflage_option_3.txt',
			'camouflage_option_3_Title',
			'camouflage_option_3_Desc',
			'camouflage_option_3_Task',
			true
		);
	}

	// @Override
	picturesForSolvedState()
	{
		// pictures for left circuit
		this.strikeOut = this.scene.add.image(350, 635, 'strikeOut').setVisible(false);
		this.dummy = this.scene.add.image(380, 680, 'dummy').setVisible(false);
		this.arrow_to_strikeOut = this.scene.add.image(360, 660, 'arrow_handdrawn').setVisible(false);
		this.arrow_to_strikeOut.setAngle(+180);

		this.wireConnection = this.scene.add.image(400, 618, 'wireConnection').setVisible(false);
		this.wireConnection.setDepth(30);

		// pictures for right circuit
		this.strikeOut2 = this.scene.add.image(960, 615, 'strikeOut').setVisible(false);
		this.dummy2 = this.scene.add.image(990, 550, 'dummy').setVisible(false);
		this.arrow_to_strikeOut2 = this.scene.add.image(980, 580, 'arrow_handdrawn').setVisible(false).setDepth(30);
		this.arrow_to_strikeOut2.setFlipX(true);
		this.arrow_to_strikeOut3 = this.scene.add.image(1015, 665, 'arrow_handdrawn').setVisible(false);
		this.arrow_to_strikeOut3.setAngle(155);

		this.inverter = this.scene.add.image(1060, 670, 'inverter').setVisible(false);
		this.inverter.setAngle(90);

		this.line = this.scene.add.image(1000, 625, 'line').setVisible(false);
		this.line.setAngle(90);
		this.line.setDepth(30);

		// Push all items for cleanup later
		this.itemsForSolvedState.push(this.strikeOut, this.dummy, this.wireConnection, this.arrow_to_strikeOut, 
			this.strikeOut2, this.dummy2, this.arrow_to_strikeOut2, this.arrow_to_strikeOut3, this.inverter, this.line
		);
	}
}

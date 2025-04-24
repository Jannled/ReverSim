class IntroduceCamouflageOptionOne extends ObfuscatedGateIntro
{
	/**
	 * Intro slide for the camouflage gate.
	 * @param {BaseScene} scene The scene where this slide will be shown
	 */
	constructor(scene)
	{
		super(
			scene, 'IntroduceCamouflageOptionOne',
			'assets/levels/elementIntroduction/introduce_camouflage_option_1.txt',
			'assets/levels/elementIntroduction/challenge_introduction_camouflage_option_1.txt',
			'camouflage_option_1_Title',
			'camouflage_option_1_Desc',
			'camouflage_option_1_Task',
			true
		);
	}

	// @Override
	picturesForSolvedState()
	{
		// pictures for left circuit
		this.arrow = this.scene.add.image(410, 560, 'arrow_handdrawn').setVisible(false);
		this.arrow.setFlipX(true);

		this.and = this.scene.add.image(450, 550, 'and').setVisible(false);
		this.and.setAngle(90);

		// pictures for right circuit
		this.arrow2 = this.scene.add.image(1015, 665, 'arrow_handdrawn').setVisible(false);
		this.arrow2.setAngle(155);

		this.or = this.scene.add.image(1060, 670, 'or').setVisible(false);
		this.or.setAngle(90);

		// Push all items for cleanup later
		this.itemsForSolvedState.push(this.arrow, this.and, this.arrow2, this.or);
	}
}
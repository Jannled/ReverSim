class LevelStatusOverlay
{
	/**
	 * The score and level progress overlay.
	 * @param {GameScene} parentScene The scene where this overlay was added. Must not be undefined.
	 */
	constructor(parentScene)
	{
		this.parentScene = parentScene;

		this.initScore();
	}

	/**
	 * Init step 3
	 */
	initScore()
	{
		// display number of switch and confirm clicks
		this.switchClicksText = AddText.addTextFromLib(this.parentScene, 30, 20, 'switchClicks');
		this.switchClicksText.setText(LangDict.get('switchClicks') + ' ');
		this.switchClicksText.setVisible(false);

		this.confirmClicksText = AddText.addTextFromLib(this.parentScene, 30, this.switchClicksText.displayHeight + 20 + 10, 'confirmClicks');
		this.confirmClicksText.setText(LangDict.get('confirmClicks') + ' ');
		this.confirmClicksText.setVisible(false);

		// display number of confirm button clicks
		if(this.parentScene.gameMode != DIFFICULTY.EASY)
			this.confirmClicksText.setVisible(true);

		// display the player score
		this.scoreText = AddText.addTextFromLib(this.parentScene, 1000, 20, 'score');
		this.scoreText.setText(LangDict.get('score') + ' ');
		this.scoreText.setVisible(false);

		// display the level numbers
		this.progressText = AddText.addTextFromLib(this.parentScene, 1000, 60, 'levelProgress');
		this.progressText.setVisible(false);
	}

	/**
	 * Something was loaded where the level overlay should not be displayed.
	 */
	infoTutLoaded()
	{
		// do not show clicks ctr
		this.switchClicksText.setVisible(false);
		this.confirmClicksText.setVisible(false);
		this.scoreText.setVisible(false);
		this.progressText.setVisible(false);
	}

	/**
	 * Something was loaded where the level overlay should be displayed, update the current state.
	 * @param {Level} level 
	 * @param {number} currentLevelNo 
	 * @param {number} levelCount 
	 */
	levelLoaded(level, currentLevelNo, levelCount)
	{
		// Display the number of levels to go
		console.log("Level number: " + currentLevelNo + " / " + levelCount);
		let rawProgressText = LangDict.get('levelProgress');
		rawProgressText = rawProgressText.replace("%d", "" + currentLevelNo);
		rawProgressText = rawProgressText.replace("%d", "" + levelCount);
		this.progressText.setText(rawProgressText);

		// Reset statistics
		this.updateConfirmClicks(level.stats.confirmClickCtr);
		this.updateSwitchClicks(level.stats.switchClickCtr);
		this.updateScore(level.stats.score);

		this.scoreText.setVisible(true);
		this.progressText.setVisible(true);
		this.switchClicksText.setVisible(true);
		this.confirmClicksText.setVisible(true);
	}

	updateScore(score)
	{
		this.scoreText.setText(LangDict.get('score') + ' ' + score);
	}

	updateSwitchClicks(numSwitchClicks)
	{
		this.switchClicksText.setText(LangDict.get('switchClicks') + ' ' + numSwitchClicks);
	}

	updateConfirmClicks(numConfirmClicks)
	{
		this.confirmClicksText.setText(LangDict.get('confirmClicks') + ' ' + numConfirmClicks);
	}
}
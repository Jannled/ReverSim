/**
 * Scene for the Skill Assessment
 */
class SkillScene extends CompetitionScene
{
	constructor()
	{
		super('Skill');
		this.statsPhase = {
			'switchClicks': 0,
			'confirmClicks': 0,
			'levelsSolved': 0,
			'levelsSkipped': 0
		};
	}

	// @Override
	initChildren()
	{
		super.initChildren();
	}

	// @Override
	onSwitchClicked(gameObject)
	{
		super.onSwitchClicked(gameObject);

		this.statsPhase["switchClicks"] += 1;
	}

	// @Override
	onConfirmButtonClicked(gameObject)
	{
		let solved = super.onConfirmButtonClicked(gameObject);

		this.statsPhase["confirmClicks"] += 1;

		if(solved)
			this.statsPhase["levelsSolved"] += 1;

		return solved;
	}

	// @Override
	onSkipLevelButtonClicked(gameObject)
	{
		super.onSkipLevelButtonClicked();

		this.statsPhase["levelsSkipped"] += 1;
	}

	// @Override
	onTimerEnd()
	{
		this.calculateScore();
		super.onTimerEnd();
	}

	// @Override
	introduceSkipLevelButton()
	{
		// Only show the skip level button, if enabled
		if(gamerules.skillShowSkipButton == "never")
			return

		super.introduceSkipLevelButton();
	}

	/**
	 * Calculate the Final Score for the Skill Assessment, to assign the player to a new group
	 */
	calculateScore()
	{
		console.log(`Score: ${this.statsPhase}`);
	}
}
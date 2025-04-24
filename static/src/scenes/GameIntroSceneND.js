/**
 * This Scene acts as the main menu. The main menu itself displays the name of
 * the game, shows a simple circuit and owns a button which leads to the
 * trainingpase when pressed.
 * 
 * This scene will not show the disclaimer (No Disclaimer)
 */
class GameIntroductionSceneND extends GameIntroductionScene
{
	constructor(phase = 'GameIntroND')
	{
		super(phase);
	}

	preload()
	{
		// No need to load the disclaimer
	}

	showDisclaimer()
	{
		// Do not show the disclaimer, go to next scene immediately
		this.languageButtons.forEach(b => b.disableInteractive());
		this.next();
	}
}

/**
 * PopUp that is displayed after the level was solved correctly.
 * 
 * The keys for the langDict are hardcoded inside here, except for the confirm Button, this one can be changed via a parameter.
 */
class LevelFeedback extends Alert
{
	/**
	 * Create a new Level Feedback Dialog.
	 * @param {Phaser.Scene} scene Parent scene for this popup.
	 * @param {*} levelStats An object containing switchClickCTR, confirmClickCtr, simulateCtr and score
	 * @param {string} interactiveLabel The label that is used to identify this event
	 * @param {string} buttonLabel The langDict key to use for the button description
	 */
	constructor(scene, levelStats, interactiveLabel, buttonLabel = 'onWeGo')
	{
		super(scene, 'feedbackClicks'); // The langDict key is obsolete, the text will be overridden anyways
	}

	/**
	 * Recalculate the position and size
	 */
	repositionAndResize()
	{
		super.repositionAndResize();
	}
}
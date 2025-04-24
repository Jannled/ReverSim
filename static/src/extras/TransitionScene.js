/**
 * Fades in to a black screen or faides out of a black screen.
 */
class TransitionScene
{
	/**
	 * Creates a black Screen in 2 sec.
	 */
	static darkenScreen(scene)
	{
		scene.cameras.main.fadeOut(2000, 0, 0, 0, () => { }, this);
	}

	/**
	 * Fades out of black screen.
	 */
	static showScreen(scene)
	{
		scene.cameras.main.fadeIn(2500, 0, 0, 0, () => { }, this);
	}


	/**
	 * Creates a black Screen.
	 */
	static blackScreen(scene)
	{
		scene.cameras.main.fadeOut(0, 0, 0, 0, () => { }, this);
	}
}

/**
 * The last scene that is shown, after the user played the quali and competition phase. (No Post-Survey)
 * 
 * This scene will NOT display the post survey redirect stuff and was created for the expert study to ask them to return back to the Zoom Meeting.
 */
class FinalSceneNPS extends FinalScene
{
	constructor(phase = 'FinalSceneNPS')
	{
		super(phase, "Zoom");
	}

	createElements(setting)
	{
		super.createElements(setting);
	}
}
/**
 * The last scene that is shown, after the user played the quali and competition phase. 
 * 
 * This scene will redirect the user to the post-survey.
 */
class FinalScene extends BaseScene
{
	constructor(phase = 'FinalScene', postSurvey = gamerules.urlPostSurvey)
	{
		super(phase);
		this.postSurvey = postSurvey;
	}

	// @Override
	createElements(setting)
	{
		super.createElements(setting);
		
		// Display thanks
		this.add.dom(config.width/2, 150, 'div', 'font-size: 30pt; width: 1000px; text-align: center;', LangDict.get('gameOver'));

		// Display group and ui notice
		this.add.dom(300, 660, 'div', 'color: gray; font-size: 11pt;', `Group: ${group} \nPseudonym: ${pseudonym}`);

		this.add.dom(1000, 650, 'div', 'color: gray; font-size: 10pt; width: 500px', LangDict.get('dataDeletionNotice'));

		// Show either a redirect to the post survey, the notice to return back to Zoom, or nothing
		if(typeof this.postSurvey == "string")
		{
			if(this.postSurvey.toLocaleLowerCase() == "zoom")
				this.createZoomNotice();
			else
				this.createPostSurvey();
		}

		// Stop the calls to /testConnection
		endGame();

		// Hide the Git Hash to make sure the player won't confuse it for the pseudonym
		try{ this.informationBar.gameHash.style.display = 'none'; } catch{ console.error("Can't hide git hash"); };
	}

	createPostSurvey()
	{
		// Display The request to enter the post survey
		this.add.dom(config.width/2, 300, 'div', 'font-size: 20pt; width: 1000px; text-align: center;', LangDict.get(gamerules.textPostSurveyNotice));

		// Display redirect button
		let postSurveyBtn = document.createElement('a');
		postSurveyBtn.classList.add('button');
		postSurveyBtn.href = `/post_survey?ui=${pseudonym}&lang=${LangDict.gameLanguage.toLowerCase()}&timeStamp=${Rq.now()}`;
		postSurveyBtn.onclick = this.onContinueButtonPressed.bind(this);
		postSurveyBtn.innerText = LangDict.get('continueToSurvey');
		this.add.dom(config.width/2, 450).setElement(postSurveyBtn, '-webkit-appearance: button; -moz-appearance: button; appearance: button;')

		// Register the button event handlers
		/*this.continueButton = new RectButton(this, config.width / 2, 450, 'continueToSurvey', 'center', 'Continue');
		this.registerClickListener('Continue', this.onContinueButtonPressed);*/
	}

	createZoomNotice()
	{
		this.add.dom(config.width/2, 300, 'div', 'font-size: 20pt; width: 1000px; text-align: center;', LangDict.get('noPostSurveyMsg'));
	}

	onContinueButtonPressed(e)
	{
		displayLeavePopup = false;

		JsonRPC.send("next", {})

		if(this.popUpNotice == null)
			this.popUpNotice = this.add.dom(config.width/2, 500, 'div', 'font-size: 11pt; width: 1000px; color: gray; text-align: center;', LangDict.get('popupNotice'));
	}

	// @Override
	onAlertTimer()
	{

	}

	// @Override
	onTimerEnd()
	{
		this.add.dom(
			config.width/2, config.height - 150, 
			'div', 'font-size: 15pt; width: 1000px; text-align: center; color: #4A6677', 
			LangDict.get('timerEnd')
		);
	}
}

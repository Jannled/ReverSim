class PausePanel extends InfoPanel
{
	/**
	 * Insert a small break for the player to relax
	 * @param {BaseScene} scene The Base scene in which this slide is shown.
	 * @param {string} infoContent Same content as if this was an info panel.
	 * @param {number} duration The duration the player has to wait in seconds.
	 * @param {number} levelStart Timestamp in millis > 0 if the countdown has been started before
	 */
	constructor(scene, infoContent, duration, levelStart = 0)
	{
		super(scene, infoContent);
		this.continueButton.disableInteractive();
		this.waitDuration = duration;

		// Set level start to zero on first run
		if(typeof levelStart == "number" && levelStart > 1 && !isNaN(levelStart))
			this.countdown = Math.max(duration - Math.round((Rq.now() - levelStart)/1000), 0);
		else
			this.countdown = duration;

		console.log(levelStart);

		// Only start the update timer if the duration is > 0
		if(this.countdown > 0)
			this.timerHandle = setInterval(this.onUpdateTimer.bind(this), 1000);

		// Build a list of all gameObjects containing the current time
		this.textTemplates = [];
		this.textGameObjects = [];
		for(let goj of this.classObjects)
		{
			if(goj instanceof Phaser.GameObjects.Text && goj.text.includes(PausePanel.TEMPLATE_STRING))
			{
				this.textTemplates.push(goj.text);
				this.textGameObjects.push(goj);
			}
		}
		
		// Add a second safety timer that will fire one second after the time has run out if not cleared
		this.timerHandleSafety = setTimeout(this.onTimerEnd.bind(this), (duration + 1)*1000);
		
		// Update the timer at least once, to initialize the text and disable the next button
		this.onUpdateTimer();
	}

	onUpdateTimer()
	{
		// Make sure that `onTimerEnd()` is called even if the text templates fail to update, see #102
		try 
		{
			// Update the text templates with the current time
			const currTime = Math.floor(this.countdown / 60) + ":" + String(this.countdown % 60).padStart(2, '0');

			for(let i=0; i<this.textTemplates.length; i++)
				this.textGameObjects[i].text = this.textTemplates[i].replaceAll(PausePanel.TEMPLATE_STRING, currTime);
		} 
		catch(e) {
			console.error(e);
		}

		// Check if countdown has ended
		if(this.countdown <= 0)
			return this.onTimerEnd();

		// Decrement countdown time
		this.countdown--;
	}

	onTimerEnd()
	{
		console.log("Pause ended");
		try {
			this.continueButton.setInteractive();
			this.highlightButton(this.continueButton);
		} 
		catch(e) {
			console.error(e);
		}
		
		try {
			clearInterval(this.timerHandle);
			clearTimeout(this.timerHandleSafety);
		} catch(e) {
			console.error(e);
		}
	}

	// @Override
	disableInteractive()
	{
		super.disableInteractive();
	}

	cleanUp()
	{
		super.cleanUp();
		clearTimeout(this.timerHandle);
	}
}

PausePanel.TEMPLATE_STRING = "{XX:XX}"
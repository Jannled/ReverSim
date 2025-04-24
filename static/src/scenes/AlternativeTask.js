class AlternativeTask extends GameScene
{
	/**
	 * Alternative task, this class will display the configured html
	 */
	constructor()
	{
		super('Alternative');
		this.taskWidth = 900;
		this.taskHeight = 600;
	}

	// @Override
	initChildren()
	{
		const x = config.width/2
		const y = (config.height - InformationBar.getHeight())/2 - 20 // subtract 20 to prevent overlap with nextLevelButton
		const style = `width: ${this.taskWidth}px; height: ${this.taskHeight}px; pointer-events: none;`
		this.altTaskContainer = this.add.dom(x, y, 'div', style);
		this.altTaskContainer.node.id = "altTask";

		// NOTE Make child objects clickable (the parent div must be transparent to mouse clicks)
		this.altTaskContainer.node.classList.add('enableInput');

		this.draw.setVisible(true);
		this.setDrawingEnabled(true);

		AlternativeTask.nextLevelGameObject = this.nextLevelButton;
	}

	// @Override
	initScore()
	{
		// Do not initialize the level score overlay

		// However we need an html popup window
		if(AlternativeTask.popUpGameObject instanceof Phaser.GameObjects.DOMElement)
			return;

		const popupDiv = document.createElement('div');
		popupDiv.id = hregame_popup_id;
		popupDiv.classList.add('popUpAlt');
		AlternativeTask.popUpGameObject = this.add.dom((config.width) / 2, (config.height) / 2, popupDiv);
		AlternativeTask.popUpGameObject.setDepth(9000);
		AlternativeTask.popUpGameObject.setVisible(false);

		this.timerReminderText = AddText.addTextFromLib(this, config.width - 50, 600, 'timeRemaining');
		this.timerReminderText.setOrigin(1, 0);
		this.timerReminderText.setVisible(false);
	}

	// @Override
	loadWhatever(fileType, levelName)
	{
		switch(fileType)
		{
			case 'url':
				this.loadAltTask(levelName, false);
				break;
	
			case 'iframe':
				this.loadAltTask(levelName, true);
				break;
	
			default:
				this.nextLevelButton.setVisible(true);
				this.nextLevelButton.setInteractive(true);
				console.error("Unrecognized file type: " + fileType + "!")
				break;
		}
	}

	/**
	 * Load the given url into the game. The loaded content/iframe will be in a div 
	 * @see AlternativeTask.altTaskContainer.node
	 * @param {string} url The url that will be loaded by JQuery or the IFrame.
	 * @param {boolean} inIframe True if the content should be loaded by/in an IFrame, otherwise it will be loaded by JQuery.
	 */
	loadAltTask(url, inIframe)
	{
		// If a timer is active, deactivate the gotoNextPhase/level Button
		this.showNextButton(!this.hasTimeLimit());

		// Hide unused ui
		this.confirmButton.setVisible(false);
		this.setDrawingEnabled(false);
		this.draw.setVisible(false);

		// Fill the container with the Alternative Task
		if(inIframe)
		{
			let iframe = document.createElement('iframe');
			iframe.setAttribute('src', url);
			this.altTaskContainer.node.replaceChildren(iframe);
		}
		else
		{
			$(this.altTaskContainer.node).load(url);
		}
		
		// Start the countdown if this level has a time limit
		if(this.hasTimeLimit())
		{
			// Hide the continue button while the timer is running
			this.nextLevelButton.setVisible(false);
			this.nextLevelButton.setInteractive(false);
			this.startCountdown();
		}
	}

	// @Override
	onConfirmButtonClicked(gameObject)
	{
		// Should never be called, but return true just to be sure
		return true;
	}

	// @Override
	onAlertTimer()
	{
		const timeRemaining = Math.max(Math.min(
			this.timerEnd != null ? (this.timerEnd - Rq.now())/1000 : gamerules.reminderTime, 
			gamerules.reminderTime
		), 0);

		// NOTE Not calling the super method here, because of the alert/popup
		console.log("Timer: " + timeRemaining + " seconds remaining!");

		if(false) // Switched from modal timer warn dialogue to a message in the corner
		{	
			// Make sure to only show the modal popup once
			if(this.slidesShown.timerWarning)
				return;

			// Show a popup to the user
			let alertText = LangDict.get('timerWarning');
			alertText = alertText.replace("%d", Math.floor(timeRemaining));
			AlternativeTask.createPopup(alertText);
		}
		else
		{
			// Create a message in the bottom right corner
			let currentTime = Math.floor(timeRemaining);
			let updateText = () => {
				let rawText = LangDict.get('timeRemaining');
				rawText = rawText.replace("%d", String(Math.max(0, currentTime--)));
				
				// @ts-ignore
				this.timerReminderText.setText(rawText);
			};
			updateText(); 
			// @ts-ignore
			this.timerReminderText.setVisible(true);
			this.timerHandle.reminderText = setInterval(updateText.bind(this), 1000);
		}

		JsonRPC.send('popup', {"content": "timeRemaining", "action": "show", "a": gamerules.reminderTime});
		this.slidesShown.timerWarning = true;
	}

	// @Override
	onTimerEnd()
	{
		// NOTE Not calling the super method here, because of the alert/popup

		// Write to the logfile
		JsonRPC.que("chrono", ["countdown", this.phase, "stop", Rq.now()], () => {
			// Only enable the next level button, after the server has received the end of SkillAssessment notification.
			this.nextLevelButton.setInteractive(true);
		});
		JsonRPC.send("popup", {"content": "timerEnd", "action": "show"});

		// Show the nextLevelButton, disable drawing
		this.nextLevelButton.setVisible(true);
		this.nextLevelButton.setInteractive(true);
		AniLib.scaleUpDownAnimation(this.nextLevelButton.getObjects(), 1.1, 1.1, 1500, this);
		this.setDrawingEnabled(false);

		// Disable input on the game
		this.altTaskContainer.node.classList.replace('enableInput', 'disableInput');

		// Show a popup to the user
		AlternativeTask.createPopup(LangDict.get('timerEnd'));
	}

	// @Override
	onNextLevelButtonClicked()
	{
		this.altTaskContainer.setVisible(false);
		super.onNextLevelButtonClicked();
	}

	/**
	 * Show the next (level) button and hide all other buttons
	 * @param {boolean} visible 
	 */
	showNextButton(visible)
	{
		if(visible)
		{
			this.nextLevelButton.text.setText(LangDict.get('next'));

			// Hide/Disable all unnecessary inputs/text
			this.buttonBar.setButtonVisible(this.simulateLevelButton, false, false);
			this.buttonBar.setButtonVisible(this.confirmButton, false);
		}

		// Show the nextLevelButton instead of the confirm button
		this.buttonBar.setButtonVisible(this.nextLevelButton, visible);
		this.nextLevelButton.setInteractive(visible);
	}

	/**
	 * Create a popup with an ok button
	 * @param {string} text Message that will be displayed
	 */
	static createPopup(text, closeButtonText = LangDict.get('ok'))
	{
		try 
		{
			// Create close button
			const closeButton = document.createElement('button');
			closeButton.innerText = closeButtonText;
			closeButton.onclick = AlternativeTask.hidePopup;
			
			// Append close button and text to popup div
			const gPopup = AlternativeTask.popUpGameObject;
			gPopup.node.replaceChildren(); // Clear all children
			gPopup.node.append(text, closeButton);

			// Make the popup container visible
			// setOrigin is buggy because the width and height are not set correctly by Phaser and we can only manually
			// determine the value while the popup is visible. But looks like `setVisible()` is only executed in the
			// next tick, therefore the `display: block` directive to make it visible during this tick.
			gPopup.node.style.display = 'block';
			gPopup.setVisible(true);
			gPopup.width = gPopup.node.clientWidth;
			gPopup.height = gPopup.node.clientHeight;
			gPopup.setOrigin(0.5, 0.5);

			// Disable input on the game
			document.getElementById("altTask").classList.replace('enableInput', 'disableInput');
		}
		catch(e)
		{
			console.error("Unable to create popup, showing alert instead!");
			console.error(e);
			alert(text);
		}
	}

	static hidePopup()
	{
		try 
		{
			AlternativeTask.popUpGameObject.setVisible(false);

			// Disable input on the game
			document.getElementById("altTask").classList.replace('disableInput', 'enableInput');
		}
		catch(e)
		{
			console.error('Unable to hide PopUp: "' + e + '"');
		}
	}

	static showNextButton(visible = true)
	{
		try 
		{
			AlternativeTask.nextLevelGameObject.setVisible(visible);
			AlternativeTask.nextLevelGameObject.setInteractive(visible);
		}
		catch(e)
		{
			console.error('NextLevelButton error: "' + e + '"');
		}
	}
}

AlternativeTask.nextLevelGameObject = null;
AlternativeTask.popUpGameObject = null;

const hregame_popup_id = "hregame_popup";

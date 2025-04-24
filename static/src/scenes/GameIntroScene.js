/**
 * This Scene acts as the main menu. The main menu itself displays the name of
 * the game, shows a simple circuit and owns a button which leads to the
 * training phase when pressed.
 */
class GameIntroductionScene extends LanguageScene
{
	constructor(phase = 'GameIntro')
	{
		super(phase);
		this.showLanguageButtons = true; // CONFIG
	}

	preload()
	{
		this.load.html('disclaimer', getDisclaimerLoc());
	}

	// @Override
	createElements(setting)
	{
		// Create language scene related stuff
		this.xPos = 100;
		this.yPos += 50;
		this.languageTextLabel = 'chooseLang';
		this.textObjects = [];

		// create title
		var x = config.width / 2;
		var y = config.height * 0.1;
		this.gameTitle = AddText.addTextFromLib(this, x, y, 'gameTitle');
		this.gameWelcome = AddText.addTextFromLib(this, x, 600, 'welcome');

		// create arbitrary-HTML object that will later take the disclaimer popup
		this.dom_disclaimer = this.add.dom((config.width) / 2, (config.height) / 2).setVisible(false);

		// NOTE: The order of the super call is important, since we are overriding `createContinueButton()`
		super.createElements(setting);

		// The screen should not be black at the beginning but just to be sure
		AniLib.showScreen(this);
	}

	// @Override
	createContinueButton()
	{
		// create button
		this.playButton = this.add.sprite(0, 0, 'playSymbol');
		this.playButton.setScale(1.3, 1.3)
		this.playButton.setOrigin(0.5, 0.5);
		var x = config.width / 2 - this.playButton.displayWidth / 2;
		var y = Math.max(this.gameTitle.y + this.gameTitle.displayHeight + this.playButton.displayHeight, config.height / 2 - this.playButton.displayHeight / 2);
		this.playButton.setPosition(x, y);
		this.playButton.setInteractive();
		this.playButton.setData('type', 'PlayButton')
		// @ts-ignore
		AniLib.scaleUpDownAnimation(this.playButton, 1.6, 1.6, 2000, this);
		this.textObjects.push(this.playButton);

		// Register the button event handlers
		this.registerClickListener('PlayButton', this.onPlayButtonPressed);
	}
	
	/**
	 * Called when the user presses the play Button
	 */
	onPlayButtonPressed()
	{
		this.playButton.disableInteractive();
		
		// Do not show the dialogue if already open.
		if(this.message != null) return;

		// Check if the user has already started a game
		if(allowLaunch())
		{
			this.showDisclaimer();
			CookieUtils.setCookie(userGroupName, group);
		}
		else 
		{
			JsonRPC.send("popup", {"content": "alreadyStarted", "action": "show"})
			this.message = new PopUp(this, 'startedGame'); // display message
		}
			

		/*if(resp == 'pre survey not started')
			this.message = new PopUp(this, 'preSurveyDemand');*/
	}

	showDisclaimer()
	{
		const width = 600;
		const height = 500;
		const x = (config.width) / 2;
		const y = (config.height) / 2;

		//let disclaimer = this.add.dom().createFromCache('disclaimer');

		// Show research info/disclaimer
		this.disclaimer = document.createElement('div');
		this.disclaimer.innerHTML = this.cache.html.get('disclaimer');
		this.disclaimer.id = 'disclaimerDiv';
		this.dom_disclaimer.setElement(this.disclaimer, `width: ${width}px; height: ${height}px;`).setPosition(x, y).setVisible(true);

		// Send the pseudonym to the server, after the user agreed to the conditions
		this.disclaimer.getElementsByTagName('button')[0].onclick = this.onAccept.bind(this);
	}

	onAccept(e)
	{
		this.dom_disclaimer.destroy();
		this.languageButtons.forEach(b => b.disableInteractive());
		this.next();
	}

	changeLanguage()
	{
		super.changeLanguage();

		// Change query params, to store language between page refreshes
		const url = new URL(window.location.href);
		if(url.searchParams.get("lang") != null && url.searchParams.get("lang").toLocaleLowerCase() != LangDict.gameLanguage.toLocaleLowerCase())
		{
			url.searchParams.set("lang", LangDict.gameLanguage.toLocaleLowerCase());
			window.history.pushState({}, '', url)
		}
		
		this.gameTitle.setText(LangDict.get('gameTitle'));
		this.gameWelcome.setText(LangDict.get('welcome'));

		// Manual XHR request, because jQuery is messing with the encoding
		var xhr = new XMLHttpRequest();
		var that = this;

		if(this.disclaimer != null)
		{
			xhr.onreadystatechange = function() 
			{
				if (this.readyState == 4 && this.status == 200)
				{
					let disclaimer = document.getElementById('disclaimerDiv');
					disclaimer.innerHTML = xhr.responseText;
					disclaimer.getElementsByTagName('button')[0].onclick = that.onAccept.bind(that);
				}
			}
			xhr.open('GET', getDisclaimerLoc(), true);
			xhr.send();
			
			// Update the disclaimer
			//$('').load(this.getDisclaimerLoc(), () => {});
		}
		else
		{
			// Popup is not shown yet, therefore update the cache instead
			this.cache.html.remove('disclaimer');
			this.load.html('disclaimer', getDisclaimerLoc());
			this.load.start();
		}
	}
}
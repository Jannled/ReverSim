/**
 * 
 */
class LanguageScene extends BaseScene
{
	constructor(phase = 'LanguageScene')
	{
		super(phase);
		this.xPos = config.width / 2;
		this.yPos = config.height * 0.3;
		this.languageTextLabel = 'chooseLanguage';
	}

	/**
	 * @override
	 * You can influence the position of the language Buttons with the this.xPos and this.yPos members.
	 */
	createElements(setting)
	{
		super.createElements(setting);

		// display different language buttons
		this.chooseLanguageTXT = AddText.addTextFromLib(this, this.xPos, this.yPos, this.languageTextLabel);

		this.languageButtons = [];
		this.createALanguageButton('DE');
		this.createALanguageButton('EN');

		// Register the button event handlers
		this.registerClickListener('languageButton', this.onLanguageButtonPressedEvent);

		this.createContinueButton();
	}

	/**
	 * Create the continue button. Override this method if you need a different continue button.
	 */
	createContinueButton()
	{
		let x = config.width / 2;
		let y = this.lastButton.y + this.lastButton.displayHeight * 1.5;
		this.continueButton = new RectButton(this, x, y, 'continue', 'center', 'Continue');

		this.registerClickListener('Continue', this.onContinueButtonPressed);
	}

	onContinueButtonPressed()
	{
		JsonRPC.send("next", {})
		this.continueButton.disableInteractive();
		this.languageButtons.forEach(b => b.disableInteractive());
		this.next();
	}
	
	onLanguageButtonPressedEvent(gameObject)
	{
		const language = gameObject.getData('language');
		LangDict.changeLang(language);
		this.changeLanguage();

		// change color of language buttons
		for(const languageButton of this.languageButtons)
		{
			languageButton.rect.setStrokeStyle(1, 0xffffff, 1)
		}

		JsonRPC.send("changeLanguage", {"lang": language})
		gameObject.setStrokeStyle(1, 0xffff00, 1);
	}

	createALanguageButton(language)
	{
		let button;
		let y = this.yPos;

		if(this.lastButton == null)
			y = this.chooseLanguageTXT.y + this.chooseLanguageTXT.displayHeight + 20;
		else
			y = this.lastButton.y + this.lastButton.displayHeight * 1.5;

		button = new RectButton(this, this.xPos, y, language, 'center', 'languageButton');
		button.setData('language', language);

		this.languageButtons.push(button);
		this.lastButton = button;

		return button;
	}

	/**
	 * Update all elements to display the current language
	 */
	changeLanguage()
	{
		this.informationBar.changeLanguage();
		this.chooseLanguageTXT.setText(LangDict.get(this.languageTextLabel));

		if(this.continueButton != null)
			this.continueButton.changeLanguage();
	}
}

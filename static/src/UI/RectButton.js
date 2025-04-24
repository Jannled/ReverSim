/**
 * A rectangular button
 */
class RectButton extends Phaser.GameObjects.GameObject
{
	/**
	 * Create a new Button with a Rectangular Border showing some localized text.
	 * @param {Phaser.Scene} scene The parent scene of this GameObject.
	 * @param {number} x The x coordinate of the button. Depending on the alignment this is either the left edge, right edge or the center of the button.
	 * @param {number} y The y coordinate of the center line of the button.
	 * @param {string} strLabel The languageDict Key to load the localized text.
	 * @param {string} alignment How to align the button relative to the specified x and y coordinates. Possible values are: left, right and center.
	 * @param {string} eventName The name used to identify the button in the event handler.
	 */
	constructor(scene, x, y, strLabel, alignment, eventName)
	{
		super(scene, eventName);
		//scene.add.existing(this);

		this.scene = scene;
		this.x = x;
		this.y = y;
		this.strLabel = strLabel
		this.type = eventName;
		this.alignment = alignment

		// create continue button
		this.rect = this.scene.add.rectangle(0, 0, 0, 0, 0x000000, 1);
		this.text = AddText.addTextFromLib(this.scene, 0, 0, this.strLabel);

		this.setText();

		this.rect.setStrokeStyle(1, 0xffffff, 1)
		this.rect.setData('type', eventName);

		this.displayWidth = this.rect.displayWidth;
		this.displayHeight = this.rect.displayHeight;

		this.rect.setDepth(25);
		this.text.setDepth(25);

		this.setInteractive();

		if(this.type != null) this.setData('type', this.type);

		this.rect.on('pointerover', () =>
		{
			if(this.isInteractive)
				this.text.setStyle({ color: '#00ff00' });
		}, this);
		this.rect.on('pointerout', () =>
		{
			if(this.isInteractive)
				this.text.setStyle({ color: '#ffffff' });
		});

		this.displayWidth = this.rect.displayWidth;
		this.displayHeight = this.rect.displayHeight;
	}

	setVisible(bool)
	{
		this.rect.setVisible(bool);
		this.text.setVisible(bool);
	}

	isVisible()
	{
		return this.rect.visible || this.text.visible;
	}

	destroyAssets()
	{
		this.rect.destroy();
		this.text.destroy();
	}

	changeYPosition(delta)
	{
		this.rect.y = this.rect.y + delta;
		this.text.y = this.text.y + delta;
	}

	cleanUpAssets()
	{
		this.rect.destroy();
		this.text.destroy();
	}

	disableInteractive()
	{
		this.isInteractive = false;
		this.rect.setStrokeStyle(1, 0x999999, 1)
		this.text.setStyle({ color: '#999999' });
		this.rect.disableInteractive();
		return this;
	}

	/**
	 * Enable or disable user interaction with this button. If this button is not interactive, it will be grayed out.
	 * @param {boolean} interactive True if the button can be clicked, false otherwise. For backwards compatibility, the default value is true.
	 * @see RectButton.disableInteractive() 
	 */
	setInteractive(interactive = true)
	{
		this.isInteractive = interactive;

		if(interactive)
		{
			try {
				if(!(this.rect.scene instanceof Phaser.Scene))
					throw "Bug in Phaser still exists...";
				this.rect.setStrokeStyle(1, 0xffffff, 1);
				this.text.setStyle({ color: '#ffffff' });
				this.rect.setInteractive();
			} catch {console.warn("Bug in Phaser still exists...")} // TODO Further investigate, maybe bug in Phaser?
		}
		else
			this.disableInteractive();

		return this;
	}

	setDepth(depthValue)
	{
		this.rect.setDepth(depthValue);
		this.text.setDepth(depthValue);
	}

	getObjects()
	{
		return [this.rect, this.text];
	}

	setText()
	{
		var offset = 5;
		this.text.setText(LangDict.get(this.strLabel));
		this.rect.setSize(this.text.displayWidth + 2 * offset, this.text.displayHeight + 2 * offset);

		if(this.alignment == 'left')
		{
			this.rect.setPosition(this.x + this.rect.displayWidth / 2, this.y + this.rect.displayHeight / 2);
			this.text.setPosition(this.rect.x, this.rect.y);

		} else if(this.alignment == 'right')
		{
			this.rect.setPosition(this.x - this.rect.displayWidth / 2, this.y + this.rect.displayHeight / 2);
			this.text.setPosition(this.rect.x, this.rect.y);
		} else if(this.alignment == 'center')
		{
			this.rect.setPosition(this.x, this.y + this.rect.displayHeight / 2);
			this.text.setPosition(this.rect.x, this.rect.y);
		}

		this.rect.setOrigin(0.5, 0.5);
		this.text.setOrigin(0.5, 0.5);
	}

	/**
	 * Update the button text with a languageDict entry.
	 * *Note:* This will change the size of the button, so your layout might break!
	 * @param {string} languageDictLabel The name of the language dict entry that should be displayed
	 */
	setTextLabel(languageDictLabel)
	{
		this.strLabel = languageDictLabel;
		this.setText();
	}

	changeLanguage()
	{
		this.setText();
	}

	setPosition(x, y)
	{
		this.x = x;
		this.y = y;
		this.setText();
	}

	setData(key, value)
	{
		this.rect.setData(key, value);
		return this;
	}

	getWidth()
	{
		return this.rect.displayWidth;
	}

	getHeight()
	{
		return this.rect.displayHeight;
	}
}

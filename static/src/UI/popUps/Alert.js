/**
 * A popup, with a close/confirm button.
 */
class Alert extends PopUp
{
	/**
	 * Create a PopUp message with a close/confirm button.
	 * @param {Phaser.Scene} scene Parent scene of this GameObject.
	 * @param {string} txt The text to show inside the popup. Must be a languageDict entry.
	 * @param {*} buttonLabel The text for the close/confirm button. Must be a languageDict entry.
	 * @param {*} interactiveLabel The label for the confirm/close button click event.
	 */
	constructor(scene, txt, buttonLabel, interactiveLabel, depth=40)
	{
		super(scene, txt, depth);

		this.button = new RectButton(this.scene, 0, 0, buttonLabel, 'right', interactiveLabel);
		this.button.setDepth(depth+5);
		this.classObjects.push(this.button);

		this.repositionAndResize();
	}


	repositionAndResize()
	{
		this.box.setSize(this.txt.displayWidth + 2 * this.offset, this.txt.displayHeight + 2 * this.offset);
		this.box.setPosition(config.width / 2, config.height / 2);
		this.box.setOrigin(0.5, 0.5);

		this.box.setSize(this.box.displayWidth, this.txt.displayHeight + this.button.rect.displayHeight + 3 * this.offset);
		this.box.setOrigin(0.5, 0.5);
		this.box.setPosition(this.box.x, config.height / 2);
		this.txt.setPosition(this.txt.x, config.height / 2 - (2 * this.offset + this.button.rect.displayHeight / 2) / 2);

		this.button.setPosition(this.box.x + this.box.displayWidth / 2 - 20, this.box.y + this.box.displayHeight / 2 - this.button.rect.displayHeight - 20);
	}

	/**
	 * Change the text of this Alert.
	 * @param {string} str The new text (raw text, no language dict entry).
	 */
	setText(str)
	{
		this.txt.setText(str);
		this.repositionAndResize();
	}

	/**
	 * 
	 * @returns The text that is currently displayed inside the alert box.
	 */
	getText()
	{
		return this.txt.text;
	}

	/**
	 * Replace all occurrences of searchTerm with replacement.
	 * @param {string} searchTerm The value that will get replaced. 
	 * @param {string} replacement The new value that will be put in place of searchTerm.
	 */
	replaceText(searchTerm, replacement)
	{
		this.setText(this.txt.text.replace(searchTerm, replacement))
		this.repositionAndResize();
	}

	setDepth(zindex)
	{
		super.setDepth(zindex);
		this.button.setDepth(zindex+5);
	}

	cleanUp()
	{
		for(const object of this.classObjects)
		{
			object.destroy();
		}
	}
}

class ButtonBar
{
	/**
	 * 
	 * @param {Phaser.Scene} parentScene 
	 * @param {RectButton[]} buttons 
	 * @param {number} spacing 
	 */
	constructor(parentScene, buttons = [], x, y, alignment = ButtonBarAlignment.RIGHT, spacing = 20)
	{
		this.parentScene = parentScene;
		this.buttons = buttons;
		this.spacing = spacing;
		this.alignment = alignment;

		this.width = 0;
		this.height = 0;

		this.setPosition(x, y);

		// Cooldown circle
		this.circle = null;
	}

	/**
	 * 
	 * @param {RectButton} button 
	 */
	add(button)
	{
		this.buttons.push(button);
		this.updatePositions();
	}

	remove(button)
	{
		return this.buttons.splice(this.buttons.indexOf(button), 1);
	}

	/**
	 * 
	 * @param {function} onComplete 
	 */
	addCooldown(delay, onComplete)
	{
		const {r, x, y} = this.getCooldownPosition();

		let graphics = this.parentScene.add.graphics({'x': x, 'y': y});
		graphics.fillStyle(0x999999);
		graphics.lineStyle(1, 0x999999, 1.0);
		this.circle = graphics;

		this.parentScene.tweens.addCounter({
			'from': 0,
			'to': 360,
			'duration': delay*1000,
			'onUpdate': function(tween) {
				// https://phaser.discourse.group/t/circular-loading-bar/7482
				//graphics.clear(); // Looks like there is a bug, nothing is shown when this line is commented in
				graphics.strokeCircle(0, 0, r);
				graphics.slice(0, 0, r, Phaser.Math.DegToRad(tween.getValue()) - Math.PI/2, 1.5*Math.PI, true);
				graphics.fillPath();
			},
			'onComplete': function(tween) {
				graphics.clear();
				graphics.destroy();
				this.circle = null;
				onComplete();
			}.bind(this)
		});
	}

	/**
	 * 
	 * @param {RectButton} button 
	 * @param {boolean} visible 
	 * @param {boolean} updatePos True if the position of the other buttons shall be recalculated
	 */
	setButtonVisible(button, visible, updatePos = true)
	{
		button.setVisible(visible);

		if(updatePos)
			this.updatePositions();
	}

	/**
	 * Update the text of a button
	 * @param {RectButton} button 
	 * @param {string} newText 
	 * @param {boolean} updatePos True if the position of the other buttons shall be recalculated
	 */
	setButtonText(button, newText, updatePos = true)
	{
		button.text.setText(newText);

		if(updatePos)
			this.updatePositions();
	}

	/**
	 * 
	 * @param {RectButton} button 
	 * @param {string} langDictEntry 
	 * @param {boolean} updatePos True if the position of the other buttons shall be recalculated
	 */
	setButtonTextLabel(button, langDictEntry, updatePos = true)
	{
		button.setTextLabel(langDictEntry);

		if(updatePos)
			this.updatePositions();
	}

	setVisible(visible)
	{
		for(let btn of this.buttons)
			btn.setVisible(visible);
	}

	setPosition(x, y)
	{
		this.x = x;
		this.y = y;

		if(this.buttons.length > 0)
			this.updatePositions();
	}

	updatePositions()
	{
		let offsets = [];
		this.buttons.reduce((accumulated, currentButton) => {
			offsets.push(accumulated);
			const neededSpace = currentButton.isVisible() ? this.spacing + currentButton.getWidth() : 0;
			return accumulated + neededSpace;
		}, 0);

		let layoutDirection = this.alignment == ButtonBarAlignment.LEFT ? 1 : -1;
		this.buttons.forEach((btn, i) => {
			btn.setPosition(this.x + offsets[i]*layoutDirection, this.y);
		});

		this.width = 0;
		for(let i=0; i<this.buttons.length; i++)
			this.width += this.buttons[i].isVisible() ? this.buttons[i].getWidth() + this.spacing : 0;

		if(this.buttons.length > 0)
			this.height = this.buttons[0].getHeight();

		// Update the cooldown circle if it is visible
		if(this.circle instanceof Phaser.GameObjects.Graphics)
		{
			let circlePos = this.getCooldownPosition();
			this.circle.setPosition(circlePos.x, circlePos.y);
		}
	}

	getCooldownPosition()
	{
		const r = this.height/2;
		return {
			'r': r,
			'x': this.x - this.width - this.spacing/2 - r/2,
			'y': this.y + r
		};
	}

	/**
	 * Make all buttons interactive/non interactive (dims button color and disables input)
	 * @param {boolean} interactive 
	 */
	setInteractive(interactive)
	{
		for(let button of this.buttons)
			button.setInteractive(interactive);
	}
}

const ButtonBarAlignment = {
	LEFT: 0,
	RIGHT: 2
}

/**
 * A popup, with no closing button
 */
class PopUp extends Phaser.GameObjects.GameObject
{
	/**
	 * 
	 * @param {Phaser.Scene} scene Parent scene of this GameObject.
	 * @param {string} textLabel The text to show inside the popup. Must be a languageDict entry.
	 */
	constructor(scene, textLabel, depth=40)
	{
		super(scene, 'PopUp');
		this.scene = scene;
		this.textLabel = textLabel;

		this.classObjects = [];
		this.offset = 20;
		this.visible = false

		// add rect covering whole screen
		this.background = this.scene.add.rectangle(0, 0, config.width, config.height, 0x000000)
			.setAlpha(0.4)
			.setOrigin(0, 0)
			.setDepth(depth)
			.setStrokeStyle(0, 0xffffff, 1);
		this.classObjects.push(this.background);

		// add text
		this.txt = AddText.addTextFromLib(this.scene, 0, 0, textLabel);
		this.txt.setWordWrapWidth(config.width / 2);
		this.txt.setDepth(depth+5);
		this.txt.setOrigin(0.5, 0.5);
		this.classObjects.push(this.txt);
		this.txt.setPosition(config.width / 2, config.height / 2);

		// add middle sized rect in the center
		this.box = this.scene.add.rectangle(0, 0, 0, 0, 0x000000)
			.setAlpha(1)
			.setOrigin(0, 0)
			.setDepth(depth)
			.setStrokeStyle(4, 0xffffff, 1)

		this.box.setSize(this.txt.displayWidth + 2 * this.offset, this.txt.displayHeight + 2 * this.offset);
		this.box.setPosition(this.txt.x, this.txt.y);
		this.box.setOrigin(0.5, 0.5);

		this.classObjects.push(this.box);
	}


	setVisible(bool)
	{
		this.visible = bool;

		for(const object of this.classObjects)
			object.setVisible(bool);
	}

	isVisible()
	{
		return this.classObjects.some(o => o.visible);
	}

	setText(str)
	{
		this.txt.setText(str);

		this.box.setSize(this.txt.displayWidth + 2 * this.offset, this.txt.displayHeight + 2 * this.offset);
		this.box.setPosition(this.txt.x, this.txt.y);
		this.box.setOrigin(0.5, 0.5);
	}

	setDepth(zIndex)
	{
		this.background.setDepth(zIndex);
		this.txt.setDepth(zIndex);
		this.box.setDepth(zIndex)
	}

	cleanUp()
	{
		for(const object of this.classObjects)
		{
			object.destroy();
		}
	}
}

class ToolSelector extends Phaser.GameObjects.GameObject
{
	/**
	 * Create a toolbar to display e.g. the drawing tools
	 * Note: You need to call `createObjects()` after you have added all buttons
	 * @param {Phaser.Scene} scene 
	 */
	constructor(scene)
	{
		super(scene, 'ToolSelector');
		this.interactiveObjects = [];

		this.xOffset = 80;
		this.initialYOffset = 100;
		this.yOffset = 80;
		this.nmbrImage = 1;

		this.selectedTool = null;
	}

	createObjects()
	{
		const x = this.xOffset;
		const y = this.initialYOffset;
		const width = 65;
		const height = this.interactiveObjects[this.interactiveObjects.length-1].y + this.yOffset - this.initialYOffset;

		// create rectangle around all tool
		this.rectAroundTools = this.scene.add.rectangle(x, y, width, height, 0x111111);
		this.rectAroundTools.setStrokeStyle(5, 0xffffff, 1)
		this.rectAroundTools.setOrigin(0.5, 0);
		this.rectAroundTools.setDepth(10);
		this.rectAroundTools.setInteractive();

		// create rectangle highlighting current tool
		this.rect = this.scene.add.rectangle(0, 0, 0, 0, 0x111111, 1);
		this.repositionRect(this.interactiveObjects[0]);
		this.rect.setDepth(10);
	}

	/**
	 * Create a tool and append it to the toolbar.
	 * @param {(string|Phaser.Textures.Texture)} textureName A Phaser image/string to be used as Icon for the tool
	 * @param {function} onClick Called when the tool is selected
	 */
	appendButton(textureName, onClick, scaleX=0.6, scaleY=0.6)
	{
		let button = this.scene.add.image(this.xOffset, this.initialYOffset + this.yOffset * this.nmbrImage++, textureName)
			.setInteractive()
			.setData('picSrc', textureName).setScale(scaleX, scaleY).setDepth(20);

		button.on('pointerdown', (pointer) => {
			if(!pointer.primaryDown) return;

			this.repositionRect(button);

			if(typeof onClick == 'function')
				onClick(pointer);
		});

		this.interactiveObjects.push(button);
		return button;
	}

	/**
	 * Highlight the currently selected tool. 
	 * 
	 * Will be called automatically when the button was created via `appendButton()`
	 * @param {Phaser.GameObjects.Image} tool 
	 */
	repositionRect(tool)
	{
		this.selectedTool = tool;

		this.rect.setPosition(tool.x, tool.y)
		this.rect.width = 75
		this.rect.height = tool.displayHeight + 20
		this.rect.setOrigin(0.5, 0.5)
		this.rect.setStrokeStyle(5, 0xaaaaaa);
	}

	/**
	 * Show or hide the toolbar
	 * @param {boolean} visible True if the tool selector shall be shown, false otherwise
	 */
	setVisible(visible)
	{
		for(const obj of this.interactiveObjects)
			obj.setVisible(visible);

		this.rectAroundTools.setVisible(visible);
		this.rect.setVisible(visible);
	}

	cleanUp()
	{
		for(let o of this.interactiveObjects)
			o.destroy();

		this.rectAroundTools.destroy();
	}

	/**
	 * Enable / disable input for this toolbar. Shorthand for `setInteractive()` or `disableInteractive()`.
	 * @param {boolean} interactive 
	 */
	setEnabled(interactive)
	{
		if(interactive)
		{
			this.setInteractive();
			for(let o of this.interactiveObjects)
				o.setInteractive();
		}
		else
		{
			this.disableInteractive();
			for(let o of this.interactiveObjects)
				o.disableInteractive();
		}
	}
}

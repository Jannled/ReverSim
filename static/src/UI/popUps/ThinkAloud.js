class ThinkAloud
{
	constructor(scene)
	{
		this.classObjects = [];
		const depth = 30;

		// add rect covering whole screen
		this.background = scene.add.rectangle(0, 0, config.width, config.height, 0x000000)
			.setAlpha(0.6)
			.setOrigin(0, 0)
			.setDepth(depth)
			.setStrokeStyle(0, 0xffffff, 1)
		this.classObjects.push(this.background);

		// add thinkaloud headline
		this.taHeadline = AddText.addTextFromLib(scene, 0, 0, 'thinkAloud');
		this.taHeadline.setWordWrapWidth(config.width*0.8);
		this.taHeadline.setDepth(depth+5);
		this.taHeadline.setOrigin(0.5, 0.5);
		this.taHeadline.setPosition(config.width / 2, 50);
		this.classObjects.push(this.taHeadline);

		// add thinkaloud task/description
		this.taDescription = AddText.addTextFromLib(scene, 0, 0, 'retrospectiveThinkaloud');
		this.taDescription.setWordWrapWidth(config.width*0.8);
		this.taDescription.setDepth(depth+5);
		this.taDescription.setOrigin(0.5, 0.5);
		this.taDescription.setPosition(config.width / 2, config.height - 50);
		this.classObjects.push(this.taDescription);

		AniLib.scaleUpDownAnimation(this.taDescription, 1.1, 1.1, 2000, scene);

		this.setVisible(false);
	}

	setVisible(show)
	{
		for(const object of this.classObjects)
			object.setVisible(show);
	}

	cleanUp()
	{
		for(const object of this.classObjects)
			object.destroy();
	}
}
class ObfuscatedGateIntro extends TutorialPanel
{
	constructor(scene, phase = 'CovertGateTutorial', fileInfoCircuit, fileTask, labelTitle, labelDescription, 
			labelTask, showCircuitState
	)
	{
		super(scene, phase);

		this.fileInfoCircuit = fileInfoCircuit;
		this.fileTask = fileTask;
		this.labelTitle = labelTitle;
		this.labelDescription = labelDescription;
		this.labelTask = labelTask;
		this.showCircuitState = showCircuitState;

		this.preload();
	}

	preload()
	{
		// display question mark, AND-Gate and OR-Gate
		Level.getLevelFile((data) =>
		{
			this.level = data;

			this.infoCircuit = new Circuit(this.scene, this.level);
			this.infoCircuit.calculateOutputs();
			this.infoCircuit.setShowState(this.showCircuitState, this.showCircuitState);
			this.infoCircuit.wireDrawer.drawWires();

			this.classObjects.push(this.infoCircuit);

			// change appearance
			this.infoCircuit.disableVisibilityOfEndElements();
			this.infoCircuit.disableVisibilityOfSourceElements();
		}, this.fileInfoCircuit);

		// display challenge circuit
		Level.getLevelFile((data) =>
		{
			this.level = data;

			this.circuit = new Circuit(this.scene, this.level);
			this.circuit.calculateOutputs();
			this.circuit.wireDrawer.drawWires();

			this.classObjects.push(this.circuit);

			this.createElements();

		}, this.fileTask);
	}

	createElements()
	{
		let y_last_position = 0;
		let rectangle_width_percentage = 0.9
		let left_aligned_text_position_in_Box = config.width * ((1 - rectangle_width_percentage) / 2)

		// title
		this.title = AddText.addTextFromLib(this.scene, 0, 0, this.labelTitle);
		this.title.setPosition(left_aligned_text_position_in_Box, 10);
		y_last_position = this.title.getBottomCenter().y;

		// variables for rects
		let w = config.width * rectangle_width_percentage;
		let h = 280;
		let x = config.width / 2;
		let y1 = 255;
		let y2 = y1 + h + 20;

		// rectangular at top 
		this.rectTop = this.scene.add.rectangle(x, y1, w, h, 0x000000);
		this.rectTop.setStrokeStyle(5, 0xffffff);
		this.rectTop.setInteractive();
		this.rectTop.setData('content', '');
		this.rectTop.setDepth(-5);

		// rectangular at bottom 
		this.rectBottom = this.scene.add.rectangle(x, y2, w, h, 0x000000);
		this.rectBottom.setStrokeStyle(5, 0xffffff);
		this.rectBottom.setData('content', '');
		this.rectBottom.setDepth(-5);

		// info text for description
		this.desc = AddText.addTextFromLib(this.scene, 0, 0, this.labelDescription);
		this.desc.setPosition(this.rectTop.getTopLeft()["x"] + 10, this.rectTop.getTopLeft()["y"] + 10);
		this.desc.setWordWrapWidth(config.width * 0.85);

		// title text for task
		this.titleTask = AddText.addTextFromLib(this.scene, 0, 0, 'instruction');
		this.titleTask.setPosition(this.rectBottom.getTopLeft()["x"] + 10, this.rectBottom.getTopLeft()["y"] + 10);

		// info text for task
		this.desc2 = AddText.addTextFromLib(this.scene, 0, 0, this.labelTask);
		this.desc2.setPosition(this.titleTask.getBottomLeft()["x"], this.titleTask.getBottomLeft()["y"] + 5);
		this.desc2.setWordWrapWidth(config.width * 0.85);

		// create animated text for solved circuits
		this.itemsForSolvedState = []

		this.solvedTXT = AddText.addTextFromLib(this.scene, 0, 0, 'correctSolution');
		this.solvedTXT.setOrigin(0.5, 1);
		this.solvedTXT.setPosition(this.rectBottom.getBottomCenter()["x"], this.rectBottom.getBottomCenter()["y"]);
		this.solvedTXT.setVisible(false);
		this.itemsForSolvedState.push(this.solvedTXT);

		// Move continue button
		this.button.setPosition(this.solvedTXT.getTopCenter().x + this.button.displayWidth / 2, this.solvedTXT.getTopCenter().y - this.button.displayHeight - 10);

		// scale itemsForSolvedState up and down
		this.picturesForSolvedState();
		for(let item of this.itemsForSolvedState)
			AniLib.scaleUpDownAnimation(item, 1.2, 1.2, 2000, this.scene);

		// create animated text for unsolved circuits
		this.unsolvedTXT = AddText.addTextFromLib(this.scene, 0, 0, 'solveMe');
		this.unsolvedTXT.setOrigin(0.5, 1);
		this.unsolvedTXT.setPosition(this.rectBottom.getBottomCenter()["x"], this.rectBottom.getBottomCenter()["y"]);
		AniLib.scaleUpDownAnimation(this.unsolvedTXT, 1.1, 1.1, 2000, this.scene);
		this.unsolvedTXT.setVisible(true);

		// two rectangles
		// what you see
		x = this.rectTop.getCenter().x;
		var y = this.rectTop.getCenter().y;
		w = 250;
		h = 180;
		var offset = 30
		this.whatYouSeeBox = this.scene.add.rectangle(x - offset, y, w, h).setOrigin(1, 0.3);
		this.whatYouSeeBox.setStrokeStyle(3, 0xffffff);

		// how it works
		this.howItWorksBox = this.scene.add.rectangle(x + offset, y, w, h).setOrigin(0, 0.3);
		this.howItWorksBox.setStrokeStyle(3, 0xffffff);

		// add text to both boxes
		offset = 10;
		x = this.whatYouSeeBox.getTopLeft().x;
		y = this.whatYouSeeBox.getTopLeft().y;
		let whatYouSeeText = AddText.addTextFromLib(this.scene, x + offset, y + offset / 2, 'whatYouSee');

		x = this.howItWorksBox.getTopLeft().x;
		y = this.howItWorksBox.getTopLeft().y;
		let howItWorksText = AddText.addTextFromLib(this.scene, x + offset, y + offset / 2, 'whatItCanBe');

		// Register the event handlers for every button / switch click
		this.scene.registerClickListener('Switch', this.onSwitchClick.bind(this));

		// Append all gui elements for later cleanup
		this.classObjects.push(this.title, this.rectTop, this.rectBottom, this.desc, this.titleTask, this.desc2, 
			this.unsolvedTXT, whatYouSeeText, howItWorksText, this.whatYouSeeBox, this.howItWorksBox
		); // this.solvedTXT gets appended by next line
		this.classObjects.push.apply(this.classObjects, this.itemsForSolvedState);
	}

	onLevelSolved() 
	{
		this.button.setVisible(true);
		this.unsolvedTXT.setVisible(false);

		for(let item of this.itemsForSolvedState)
			item.setVisible(true);
	}

	onLevelFailed()
	{
		this.button.setVisible(false);
		this.unsolvedTXT.setVisible(true);

		for(let item of this.itemsForSolvedState)
			item.setVisible(false);
	}

	picturesForSolvedState()
	{
		
	}
}
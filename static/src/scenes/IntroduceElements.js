/**
 * 
 */
class IntroduceElements extends BaseScene
{
	constructor()
	{
		super('IntroduceElements');

		this.unlockedSlides = -1;
	}


	createElements(setting)
	{
		super.createElements(setting);

		this.elements = [];
		this.images = [];
		this.logicElements = []
		this.phaserObjects = [];
		this.timeEvent = {};
		this.elementInBox = {};

		this.challengeSymbol = [];
		this.challengeSymbolSolved = [];

		/** The currently active intro slide */
		this.stateMachine = -1;

		/** Will be set to the circuit url, if it should have been shown but was not downloaded yet */
		this.awaitLevel = null;

		this.headline = AddText.addTextFromLib(this, 100, 100, 'learnGameTitle');
		this.headline.setOrigin(0, 1)

		this.elementBoxX = 100;
		this.elementBoxY = config.height * 0.8;

		this.elementsToBeIntroduced = {};

		this.boxWidth = (config.width - 2 * this.elementBoxX) / (IntroduceElements.slideCount);
		this.boxHeight = 80;
		this.boxY = config.height * 0.7;

		this.elementBoxes = []; /* The rectangles around the icons */
		this.questionMark = []; /* Lock symbols for locked slides */
		for(var i = 0; i < IntroduceElements.slideCount; i++)
		{
			// Create rectangle around preview image
			this.elementBoxes[i] = this.add.rectangle(this.elementBoxX + i * this.boxWidth, this.elementBoxY, this.boxWidth, this.boxHeight, 0x000000);
			this.elementBoxes[i].setOrigin(0, 0);
			this.elementBoxes[i].setStrokeStyle(5, 0xffffff);
			this.elementBoxes[i].setInteractive();
			this.elementBoxes[i].setData('content', '');
			this.elementBoxes[i].setDepth(-5);
			
			// Make preview box interactive
			this.elementBoxes[i].setData('type', 'jumpElementIntroSlide');
			this.elementBoxes[i].setData('slideNo', i);
			this.elementBoxes[i].setInteractive();

			// Add locks for every slide
			if(i != IntroduceElements.slideCount - 1)
				this.questionMark[i] = this.add.image(0, 0, 'locked');
			else
				this.questionMark[i] = this.add.image(0, 0, 'flag');

			this.questionMark[i].setOrigin(0.5, 0.5);
			let x = this.elementBoxX + (i * this.boxWidth) + this.boxWidth / 2;
			let y = this.elementBoxes[i].y + this.elementBoxes[i].height / 2;

			this.questionMark[i].setPosition(x, y);

			// Setup jump slide event
			this.questionMark[i].setData('type', 'jumpElementIntroSlide');
			this.questionMark[i].setData('slideNo', i);
			this.questionMark[i].setInteractive();
		}

		// Create skip button
		this.skipButton = new RectButton(this, 1180, 40, 'skipTutorial', 'right', 'skipTutorial');
		this.skipButton.setVisible(false);

		// set up information box
		this.infoBoxX = 100;
		this.infoBoxHeight = 400;
		this.infoBox = this.add.rectangle(this.infoBoxX, this.headline.y + 20, config.width - 200, this.infoBoxHeight, 0xff0000)
			.setOrigin(0, 0)
			.setDepth(0)
			.setFillStyle(0x000000)
			.setStrokeStyle(5, 0xaaaaaa)
		this.offset = 10;

		// this image Box is not visible
		var x = this.infoBox.x;
		var y = this.infoBox.y + this.infoBox.displayHeight * 0.6;
		var w = this.infoBox.displayWidth;
		var h = this.infoBox.displayHeight * 0.4;
		this.imageBox = this.add.rectangle(x, y, w, h, 0xaaaaaa, 0);
		this.imageBox.setOrigin(0, 0);
		//this.imageBox.setStrokeStyle(5, 0xaaaaaa);
		this.imageBox.setVisible(false);

		this.title = AddText.addTextFromLib(this, this.infoBox.x + 20, this.infoBox.y + this.offset, 'infoBoxTitle');

		this.infoText = AddText.addTextFromLib(this, this.title.x, this.title.y + this.title.displayHeight + this.offset, 'infoBoxText');
		this.infoText.setText(LangDict.get('learnGameIntro'));
		this.infoText.setStyle({
			wordWrap: { width: this.infoBox.displayWidth - 2 * this.offset, useAdvancedWrap: true },
		});
		this.infoText.setLineSpacing(5); // 1.15pt line spacing

		if(this.title.text == '')
		{
			this.infoText.setPosition(this.infoBox.x + 20, this.infoBox.y + this.offset);
		} else
		{
			this.infoText.setPosition(this.title.x, this.title.y + this.title.displayHeight + this.offset);
		}

		this.arrowLeft = this.add.image(0, 0, 'arrow')
		this.arrowLeft.setPosition(this.infoBox.x + this.arrowLeft.displayWidth, this.elementBoxY - this.arrowLeft.displayHeight)
		this.arrowLeft.setOrigin(1.1, 0)
		this.arrowLeft.setScale(0.8, 0.8)
		this.arrowLeft.setInteractive()
		this.arrowLeft.on('pointerup', () => { this.arrowClickedEvent(-1); });
		this.arrowLeft.setVisible(false);
		AniLib.scaleUpDownAnimation(this.arrowLeft, 0.9, 0.9, 2000, this);

		this.arrowRight = this.add.image(0, 0, 'arrow')
		this.arrowRight.setPosition(this.infoBox.x + this.infoBox.displayWidth - this.arrowRight.displayWidth, this.elementBoxY - this.arrowRight.displayHeight)
		this.arrowRight.setOrigin(-0.1, 0)
		this.arrowRight.setScale(0.8, 0.8)
		this.arrowRight.setFlipX(true)
		this.arrowRight.setInteractive()
		this.arrowRight.on('pointerup', () => { this.arrowClickedEvent(1); });
		AniLib.scaleUpDownAnimation(this.arrowRight, 0.85, 0.85, 2000, this)

		// create animated text for solved circuits
		this.solvedTXT = AddText.addTextFromLib(this, 0, 0, 'correctSolution');
		this.solvedTXT.setOrigin(0.5, 0.5);
		x = this.infoBox.x + this.infoBox.displayWidth / 2;
		y = this.infoBox.y + this.infoBox.displayHeight - this.solvedTXT.displayHeight / 2 - 5;
		this.solvedTXT.setPosition(x, y);
		AniLib.scaleUpDownAnimation(this.solvedTXT, 1.1, 1.1, 2000, this);
		this.solvedTXT.setVisible(false);

		this.lowerBarElements = []; /* Slide preview icons in the lower bar */

		this.battery = {
			titleLabel: 'battery',
			textLabel: 'batteryDesc',
			challenge: false
		}

		this.wire = {
			titleLabel: 'wire',
			textLabel: 'wireDesc',
			challenge: false
		}
		this.switch = {
			titleLabel: 'switch',
			textLabel: 'switchDesc',
			challenge: false
		}
		this.bulb = {
			titleLabel: 'bulb',
			textLabel: 'bulbDesc',
			challenge: false
		}
		this.dangerSign = {
			titleLabel: 'dangerSign',
			textLabel: 'dangerSignDesc',
			challenge: false
		}
		this.inverter = {
			titleLabel: 'inverter',
			textLabel: 'inverterDesc',
			challenge: false,
			circuitFilePath: 'assets/levels/elementIntroduction/inverter_explanation.txt'
		}
		this.orGate = {
			titleLabel: 'orGate',
			textLabel: 'orGateDesc',
			challenge: false,
			circuitFilePath: 'assets/levels/elementIntroduction/OR_explanation.txt'
		}
		this.andGate = {
			titleLabel: 'andGate',
			textLabel: 'andGateDesc',
			challenge: false,
			circuitFilePath: 'assets/levels/elementIntroduction/AND_explanation.txt'
		}
		this.splitter = {
			titleLabel: 'splitter',
			textLabel: 'splitterDesc',
			challenge: false,
			circuitFilePath: 'assets/levels/elementIntroduction/Splitter_explanation.txt'
		}

		this.challengeBulb = {
			titleLabel: 'instruction',
			textLabel: 'instructionBulbChallenge',
			challenge: true,
			circuitFilePath: 'assets/levels/elementIntroduction/battery_switch_bulb.txt'
		}

		this.challengeDangerSign = {
			titleLabel: 'instruction',
			textLabel: 'instructionDangerSignChallenge',
			challenge: true,
			circuitFilePath: 'assets/levels/elementIntroduction/battery_switch_dangerSign.txt'
		}
		this.challengeInverter = {
			titleLabel: 'instruction',
			textLabel: 'instructionInverterChallenge',
			challenge: true,
			circuitFilePath: 'assets/levels/elementIntroduction/battery_switch_inverter_bulb.txt'
		}

		this.challengeAndGate = {
			titleLabel: 'instruction',
			textLabel: 'instructionAndGateChallenge',
			challenge: true,
			circuitFilePath: 'assets/levels/elementIntroduction/simple_AND_circuit.txt'
		}
		this.challengeOrGate = {
			titleLabel: 'instruction',
			textLabel: 'instructionOrGateChallenge',
			challenge: true,
			circuitFilePath: 'assets/levels/elementIntroduction/simple_OR_circuit.txt'
		}
		this.challengeSplitter = {
			titleLabel: 'instruction',
			textLabel: 'instructionSplitterChallenge',
			challenge: true,
			circuitFilePath: 'assets/levels/elementIntroduction/simple_SPLITTER_circuit.txt'
		}

		this.information = {
			titleLabel: 'endElementIntroTitle',
			textLabel: 'endElementIntroText',
			challenge: false,
		}

		this.sequenceBoxContent = {
			'0': this.battery,
			'1': this.wire,
			'2': this.switch,
			'3': this.bulb,
			'4': this.challengeBulb,
			'5': this.dangerSign,
			'6': this.challengeDangerSign,
			'7': this.inverter,
			'8': this.challengeInverter,
			'9': this.andGate,
			'10': this.challengeAndGate,
			'11': this.orGate,
			'12': this.challengeOrGate,
			'13': this.splitter,
			'14': this.challengeSplitter,
			'15': this.information
		}
		IntroduceElements.slideCount = Object.keys(this.sequenceBoxContent).length;

		for(let key in this.sequenceBoxContent)
		{
			let elementDict = this.sequenceBoxContent[key];
			if(elementDict['circuitFilePath'] != null)
			{
				Level.getLevelFile((data, type, dict) =>
				{
					dict['fileContent'] = data;

					// awaitLevel will be set if a level should have been shown but it was not loaded yet
					if(this.awaitLevel == dict['circuitFilePath'])
					{
						if(dict['textLabel'].includes('Desc'))
							this.createGiantElements(dict);
						else
							this.createCircuit(dict);
					}

				}, elementDict['circuitFilePath'], elementDict)
			}
		}

		// Register the event handlers for every button / switch click
		this.registerClickListener('Switch', this.switchClickedEvent);
		this.registerClickListener('Continue', this.next);
		this.registerClickListener('jumpElementIntroSlide', this.onJumpIntroSlide);
		this.registerClickListener('skipTutorial', this.onSkipTutorial);

		// let's cheat a bit -> skip the element introduction
		let e = this.input.keyboard.on('keydown-' + 'W', () => this.skipButton.setVisible(true));
		this.eventList.push(e); // Add event listener to list, this will be needed to clean them up when the scene is done

		this.applyServerState(setting);
	}


	onSkipTutorial()
	{
		this.next();
	}


	switchClickedEvent(gameObject)
	{
		if(this.circuit == null) return;

		// change switch state
		var element = gameObject.getData('element');
		element.switchClicked();

		// calculate outputs
		this.calculateOutputs();
		this.circuit.wireDrawer.drawWires();

		// Only check if challenge is solved if slide actually is a challenge
		var i = this.currentBox;
		if(this.challengeSymbol[i] == null)
				return;

		// challenge is solved
		if(this.circuit.getSolvingState())
		{
			// only allow to go right when level is solved
			this.arrowRight.setVisible(true);
			this.arrowLeft.setVisible(true);
			this.solvedTXT.setVisible(true);
			
			// hide challenge symbol
			this.challengeSymbol[i].setVisible(false);
			this.challengeSymbolSolved[i].setVisible(true);
		}
		// challenge is not solved
		else
		{
			// show challenge symbol
			this.challengeSymbol[i].setVisible(true);
			this.solvedTXT.setVisible(false);

			// hide arrow to right if slide was not already unlocked
			this.arrowRight.setVisible(this.isNextSlideUnlocked());

			if(this.challengeSymbolSolved[i] != null)
				this.challengeSymbolSolved[i].setVisible(false);
		}

		JsonRPC.send("switch", {"id": gameObject.getData('id'), "solved": this.circuit.getSolvingState()});
	}


	arrowClickedEvent(delta)
	{
		const requestedSlideNo = this.stateMachine + delta;
		this.jumpIntroSlide(requestedSlideNo);
		
		const challengeDict = this.sequenceBoxContent[this.currentBox.toString()];

		if(challengeDict != null)
		{
			// send log info
			let sType = challengeDict['challenge'] ? "Challenge": "Description";
			let sLabel = challengeDict['textLabel'];
			JsonRPC.send("slide", {"type": sType, "label": sLabel, "direction": delta});
		}
		else
			console.error("No intro slides configured"); 
	}


	update()
	{

	}


	createCircuit(dict, alwaysShowSplitter = false)
	{
		if(dict['fileContent'] == null)
		{
			this.awaitLevel = dict['circuitFilePath'];
			return false;
		}

		var fileContent = dict['fileContent'];

		this.circuit = new Circuit(this, fileContent, alwaysShowSplitter);

		this.bulbs = this.circuit.elementsManager.getLightBulbs();
		this.dangerSigns = this.circuit.elementsManager.getDangerSigns();
		this.endPointElements = this.bulbs.concat(this.dangerSigns);

		// get all switches
		this.switches = this.circuit.elementsManager.getSwitches();

		this.calculateOutputs();
		this.circuit.wireDrawer.drawWires();
		return true;
	}


	calculateOutputs()
	{
		// set OutputState of all elements recursively
		for(const endPoint of this.endPointElements)
		{
			endPoint.setOutputState();
		}
	}


	destroyElements()
	{
		for(let element of this.elements)
		{
			element.cleanUp();
			element.destroy();
		}

		this.elements = []
	}


	createElement(elementName, x, y, x2, lineWidth)
	{
		var element;

		switch(elementName)
		{
			case 'battery': element = new VCC(this, 0, 2, x, y);
				break;
			case 'switch': element = new Switch(this, 0, 2, x, y, 'true');
				break;
			case 'bulb': element = new LightBulb(this, 0, 1, x, y);
				break;
			case 'dangerSign': element = new DangerSign(this, 0, 1, x, y);
				break;
			case 'inverter': element = new Inverter(this, 0, 1, x, y);
				break;
			case 'andGate': element = new AndGate(this, 0, 1, x, y);
				break;
			case 'orGate': element = new OrGate(this, 0, 1, x, y);
				break;
			case 'wire': var x1 = x;
				var line = this.add.line(0, 0, x1, y, x2, y, 0x00ff00, 1);
				line.setOrigin(0, 0);
				line.setStrokeStyle(lineWidth, 0xffff00, 1);
				element = line;
				break;
		}

		element.disableInteractive();

		return element;
	}


	createTimeEvent(element, lineWidth)
	{
		var timeEvent;
		if(element instanceof LightBulb || element instanceof DangerSign)
		{
			let config = {
				delay: 1000,
				callback: this.changeOutputState,
				callbackScope: this,
				args: [element],
				loop: true
			}
			timeEvent = this.time.addEvent(config);
		} else if(element instanceof Switch)
		{
			let config = {
				delay: 1000,
				callback: this.changeSwitchState,
				callbackScope: this,
				args: [element],
				loop: true
			}
			timeEvent = this.time.addEvent(config);
		} else if(lineWidth != null)
		{
			var line = element;
			let config = {
				delay: 1000,
				callback: this.changeColorLine,
				callbackScope: this,
				args: [line, lineWidth],
				loop: true
			}
			timeEvent = this.time.addEvent(config);
		}

		return timeEvent;
	}


	createImages(imgNames, x, y, width, height)
	{
		var yPos = y + height / 2;
		var i = 1;
		this.images = []
		for(var imgName of imgNames)
		{
			var xPos = x + i * width / (imgNames.length + 1);
			this.images.push(this.add.image(xPos, yPos, imgName));
			i++;
		}
		return this.images;
	}


	createGiantElements(dict)
	{
		var scaleFactor = 2;

		// If a circuit shall be loaded wait until it is downloaded from the server
		if(dict['circuitFilePath'] != null && dict['fileContent'] == null)
		{
			this.awaitLevel = dict['circuitFilePath'];
			return false;
		}

		// create a circuit
		if(dict['fileContent'] != null)
		{
			this.createCircuit(dict, true);

			this.circuit.disableVisibilityOfEndElements();
			this.circuit.disableVisibilityOfSourceElements();
			this.circuit.setScale(scaleFactor);
		}

		// display Background
		this.imageBox.setVisible(true);

		var x = this.imageBox.x + this.imageBox.displayWidth / 2;
		var y = this.imageBox.y + this.imageBox.displayHeight / 2;

		var titleLabel = dict['titleLabel'];
		switch(titleLabel)
		{
			case 'wire': var x1 = this.imageBox.x + this.imageBox.displayWidth / 4;
				var x2 = this.imageBox.x + 3 * this.imageBox.displayWidth / 4;
				this.line = this.createElement(titleLabel, x1, y, x2, 5);
				this.createTimeEvent(this.line, 5);
				break;

			case 'andGate': break;
			case 'orGate': break;
			case 'splitter': break;
			case 'inverter': break; // create a circuit
				// hide batteries and outputs
				
			default: var element = this.createElement(titleLabel, x, y);
				this.createTimeEvent(element);
				break;
		}

		if(element == null) return;
		// set scale to image
		element.setScale(scaleFactor);
		this.logicElements.push(element);
	}


	changeBox(dict)
	{
		var titleLabel = dict['titleLabel'];
		var textLabel = dict['textLabel'];

		// store the number of slides that have been unlocked
		this.unlockedSlides = Math.max(this.unlockedSlides, this.stateMachine);

		// change visibility of arrows
		if(this.stateMachine <= 0)
		{
			this.arrowLeft.setVisible(false);
			this.arrowRight.setVisible(true);
		} else if(this.stateMachine >= (this.elementBoxes.length - 1))
		{
			this.arrowLeft.setVisible(true);
			this.arrowRight.setVisible(false);
		} else
		{
			this.arrowLeft.setVisible(true);
			this.arrowRight.setVisible(true);
		}

		this.clearInfoBox();
		this.highlightActiveBox();

		this.title.setText(LangDict.get(titleLabel))
		this.infoText.setText(LangDict.get(textLabel));

		if(this.title.text == '')
		{
			this.infoText.setPosition(this.infoBox.x + 20, this.infoBox.y + this.offset);
		} else
		{
			this.infoText.setPosition(this.title.x, this.title.y + this.title.displayHeight + this.offset);
		}

		this.solvedTXT.setVisible(false);

		// send log info
		if(textLabel.includes('Desc'))
		{
			this.enableDesc(dict);
		} else if(textLabel.includes('Challenge'))
		{
			this.enableChallenge(dict);
			return;
		} else if(textLabel.includes('end'))
		{
			this.button = new RectButton(this, config.width / 2, this.infoText.y + this.infoText.displayHeight + 3 * this.offset, 'continue', 'center', 'Continue');
			this.logicElements.push(this.button);
		}
	}


	enableDesc(dict)
	{
		var titleLabel = dict['titleLabel'];
		var textLabel = dict['textLabel'];

		// display element in big
		this.createGiantElements(dict);

		// display element in lower bar if not already done
		this.unlockIcon(this.currentBox);
		
		// start time Event for animated icons (should have been using sprites but whatever)
		if(titleLabel == 'wire')
		{
			var timeEvent = this.createTimeEvent(this.lowerBarElements[this.currentBox][0], 5);
			this.timeEvent[titleLabel] = timeEvent;
		} 
		else if(titleLabel == 'switch' || titleLabel == 'bulb' || titleLabel == 'dangerSign')
		{
			var timeEvent = this.createTimeEvent(this.lowerBarElements[this.currentBox][0]);
			this.timeEvent[titleLabel] = timeEvent;
		}
	}


	clearInfoBox()
	{
		// hide image background in case it is visible
		this.imageBox.setVisible(false);

		this.title.setText('');
		this.infoText.setText('');

		for(var img of this.images)
		{
			img.destroy();
		}
		this.images = [];

		for(var element of this.logicElements)
		{
			element.destroyAssets();
			element.destroy();
		}
		this.logicElements = [];

		for(var obj of this.phaserObjects)
		{
			obj.destroy();
		}
		this.phaserObjects = []

		// destroy drawings
		if(this.line != null) this.line.destroy();

		// destroy circuit
		if(this.circuit != null)
		{
			this.circuit.cleanUp();
		}

		// stop time events
		for(var label in this.timeEvent)
		{
			if(this.timeEvent[label] != null)
			{
				this.timeEvent[label].remove();
				this.timeEvent[label] = null;
			}


			// turn bulb and danger sign off
			var element = this.elementInBox[label];
			if(element instanceof LightBulb || element instanceof DangerSign)
			{
				element.outputState = 0;
			}
		}
	}


	highlightActiveBox()
	{
		this.elementBoxes[this.previousBox].setStrokeStyle(5, 0xffffff);
		this.elementBoxes[this.previousBox].setDepth(-5);

		this.elementBoxes[this.currentBox].setStrokeStyle(5, 0x00ff00);
		this.elementBoxes[this.currentBox].setDepth(0);

		if(this.lowerBarElements[this.previousBox] != null)
		{
			for(var element of this.lowerBarElements[this.previousBox])
				element.setAlpha(0.5);
		}
		//this.elementBoxes[this.previousBox].setDepth(0);
		//this.elementBoxes[this.currentBox].setDepth(1);

		if(this.lowerBarElements[this.currentBox] != null)
		{
			for(var element of this.lowerBarElements[this.currentBox])
				element.setAlpha(1);
		}
	}


	changeOutputState(element)
	{
		element.outputState = !element.outputState;
	}


	changeSwitchState(element)
	{
		var bool = !true;
		element.switchState = !element.switchState;
		element.changeSwitchPic();
	}


	changeColorLine(line, lineWidth)
	{
		var currentColor = line.strokeColor;
		var color = (currentColor == 0xffff00) ? 0xaaaaaa : 0xffff00;
		line.setStrokeStyle(lineWidth, color, 1);
	}


	enableChallenge(dict)
	{
		// create circuit
		this.createCircuit(dict);
		this.arrowRight.setVisible(this.isNextSlideUnlocked());

		// Create question mark icon (and check mark for solved state later)
		this.unlockIcon(this.currentBox);
		this.challengeSymbol[this.currentBox].setVisible(true);
		this.challengeSymbolSolved[this.currentBox].setVisible(false);
	}

	/**
	 * Remove the lock icon in the lowerBarElements and replace it with the icon that is shown 
	 * when the slide is unlocked.
	 * @param {number} currentBox value from 0 to `this.sequenceBoxContent.length`
	 * @returns Nothing
	 */
	unlockIcon(currentBox)
	{
		// Do nothing if icon is already unlocked
		if(!this.questionMark[currentBox].visible)
			return;

		const titleLabel = this.sequenceBoxContent[currentBox.toString()].titleLabel;
		const i = currentBox;
		const x = this.elementBoxX + (i * this.boxWidth) + this.boxWidth / 2
		const y = this.elementBoxY + this.boxHeight / 2;

		// Icon for wire
		if(titleLabel == 'wire')
		{
			var element = this.createElement(titleLabel, x - this.boxWidth/4, y, x + this.boxWidth/4, 5);
			this.lowerBarElements[currentBox] = [element];
		}
		
		// Icon for splitter
		else if(titleLabel == 'splitter')
		{
			this.circleGrey = this.add.circle(this.elementBoxX + (i * this.boxWidth) + this.boxWidth / 3, y, 5, 0xffff00);
			this.circleYellow = this.add.circle(this.elementBoxX + (i * this.boxWidth) + 2 * this.boxWidth / 3, y, 5, 0xaaaaaa);

			this.lowerBarElements[currentBox] = [this.circleGrey, this.circleYellow];
		}
		
		// Icon for challenges
		else if(titleLabel == 'instruction') 
		{
			// Create unsolved challenge icon if not existing
			if(this.challengeSymbol[i] == null)
			{
				this.challengeSymbol[i] = AddText.addTextFromLib(this, x, y, '?');
				this.lowerBarElements[currentBox] = [this.challengeSymbol[i]];
				this.challengeSymbol[i].setOrigin(0.5, 0.5);
			}
			this.challengeSymbol[i].setVisible(false);

			// Create solved challenge icon if not existing
			if(this.challengeSymbolSolved[i] == null)
			{
				this.challengeSymbolSolved[i] = this.add.image(x, y, 'okay').setScale(0.9, 0.9);
				this.lowerBarElements[currentBox].push(this.challengeSymbolSolved[i])
			}
		}

		// All other icons
		else
			this.lowerBarElements[currentBox] = [this.createElement(titleLabel, x, y)];

		// hide question mark
		this.questionMark[currentBox].setVisible(false);
	}

	applyServerState(serverState)
	{
		const slidePos = serverState.introPos;
		this.unlockedSlides = Math.min(serverState.introProgress, IntroduceElements.slideCount - 1);

		// Jump to the last slide the player was on if applicable
		if(slidePos >= 0)
			this.jumpIntroSlide(slidePos);

		// Remove the lock icon for the already solved slides
		if(this.unlockedSlides >= 0)
		{
			for(let i=0; i<this.unlockedSlides; i++)
				this.unlockIcon(i);
		}

		// Create a skip button, if the player has already unlocked all slides
		if(gamerules.tutorialAllowSkip == 'always')
			this.skipButton.setVisible(true);
		else if(gamerules.tutorialAllowSkip != 'no' && this.unlockedSlides >= IntroduceElements.slideCount - 1)
			this.skipButton.setVisible(true);
	}

	isNextSlideUnlocked(slide = this.stateMachine)
	{
		return this.unlockedSlides > slide;
	}

	/**
	 * Allow to jump to a specific slide by clicking one of the preview icons.
	 * 
	 * Will send an arrow clicked event.
	 * @param {Phaser.GameObjects.GameObject} gameObject 
	 */
	onJumpIntroSlide(gameObject)
	{
		const requestedSlideNo = Number(gameObject.getData('slideNo'));
		
		if(isNaN(requestedSlideNo) || requestedSlideNo < 0 || requestedSlideNo > IntroduceElements.slideCount)
			return;

		if(this.isNextSlideUnlocked(Math.max(requestedSlideNo - 1, 0)))
			this.arrowClickedEvent(requestedSlideNo - this.stateMachine);
	}

	/**
	 * Jump to a specific slide without sending any events.
	 * (used by `arrowClickedEvent()`, which will send an event and for page reloads).
	 * @param {number} requestedSlideNo
	 */
	jumpIntroSlide(requestedSlideNo)
	{
		this.previousBox = this.stateMachine <= 0 ? 0 : this.stateMachine;
		this.awaitLevel = null;

		if(this.stateMachine <= 0)
			this.infoBox.setVisible(true);

		// this.stateMachine = (this.nnmbrElements + this.stateMachine + delta ) % this.nnmbrElements;
		this.stateMachine = requestedSlideNo;
		this.stateMachine = Math.max(this.stateMachine, 0);
		this.stateMachine = Math.min(this.stateMachine, IntroduceElements.slideCount - 1);

		this.currentBox = this.stateMachine;

		// Show the content of the next/previous slide
		const challengeDict = this.sequenceBoxContent[this.currentBox.toString()];
		this.changeBox(challengeDict);
	}

	onTimeoutConfirmed()
	{
		this.skipButton.setVisible(true);
		this.skipButton.setInteractive();
		this.highlightButton(this.skipButton);
	}

	beforeSuspendUI()
	{
		super.beforeSuspendUI();
		this.skipButton.disableInteractive();
		
		this.arrowLeft.disableInteractive();
		this.arrowRight.disableInteractive();
		try { this.button.disableInteractive(); } catch {}
	}
}

IntroduceElements.slideCount = 9 + 6 + 1;

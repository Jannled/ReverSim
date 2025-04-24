/**
 * 
 */
class IntroduceDrawingTools extends BaseScene
{
	constructor()
	{
		super('IntroduceDrawingTools');
	}

	// @Override
	createElements(setting)
	{
		super.createElements(setting);

		this.level;
		Level.getLevelFile((data) =>
		{
			this.level = data;

			this.circuit = new Circuit(this, this.level);
			this.circuit.calculateOutputs();
			this.circuit.wireDrawer.drawWires();
		}, 'assets/levels/elementIntroduction/simple_circuit.txt');

		// activate the drawing functionality
		this.draw = new CanvasDrawing(this);
		this.draw.create();
		this.draw.logDrawingActions();

		this.headline = AddText.addTextFromLib(this, 0, 0, 'drawingToolsTXT');
		this.headline.setPosition(config.width / 2 - this.headline.displayWidth / 2, 50);

		this.introText = AddText.addTextFromLib(this, this.headline.y, 100, 'drawingToolsDesc');
		this.introText.setPosition(config.width / 6, this.headline.y + this.headline.displayHeight + 40);
		this.introText.setWordWrapWidth(4 * config.width / 6);

		this.button = new RectButton(this, config.width - 20, config.height * 0.88, 'continue', 'right', 'Continue');

		// Register the event handlers for every button / switch click
		this.registerClickListener('Switch', this.onSwitchClick);
		this.registerClickListener('Continue', this.onContinueButtonPressed);
		this.registerClickListener('PopUp_Alert_drawDemand', this.onCloseDrawDemandPopup);
	}

	loadNext(serverState)
	{
		// Get drawing from server
		Rq.get("/assets/levels/introDrawings/arrow.json", (data) => {
			for(let line of data)	
				this.draw.drawPoints(line);
		});

		// Start IntroduceDrawingTools, even if the drawing is not loaded yet
		super.loadNext(serverState);
	}

	onSwitchClick(gameObject)
	{
		// change switch state
		var element = gameObject.getData('element');
		element.switchState = !element.switchState;

		// change switch color
		element.changeSwitchPic();

		// calculate outputs
		this.circuit.calculateOutputs();
		this.circuit.wireDrawer.drawWires();

		JsonRPC.send("switch", {"id": gameObject.getData('id'), "solved": this.circuit.getSolvingState()});
	}

	onContinueButtonPressed()
	{
		this.button.disableInteractive();

		// check if render texture is clean
		if(this.draw.penUsedAtLeastOnce == true)
		{
			this.next();
			if(this.alertDrawing) this.alertDrawing.cleanUp();
			this.alertDrawing = null;
		} 
		else
		{
			JsonRPC.send("popup", {"content": "drawDemand", "action": "show"});
			
			if(this.alertDrawing == null)
				this.alertDrawing = new Alert(this, 'tryDrawingTools', 'alright', 'PopUp_Alert_drawDemand');
			else
				this.alertDrawing.setVisible(true);
		}
	}

	onCloseDrawDemandPopup()
	{
		JsonRPC.send("popup", {"content": "drawDemand", "action": "hide"})
		this.alertDrawing.setVisible(false);
		this.button.setInteractive();
	}
}

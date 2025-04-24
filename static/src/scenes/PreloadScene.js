/**
 * The preload scene is the very first game which Phaser3 is instructed to load. 
 * It will fetch all assets, then proceed to establish a session and start the 
 * first phase of the game.
 */
class PreloadScene extends BaseScene
{
	constructor()
	{
		super('bootGame');
	}

	/**
	 * Load all assets for the game
	 */
	preload()
	{
		// load all images of elements
		this.load.image('and', 'res/elements/and.png');
		this.load.image('battery_empty', 'res/elements/battery_empty.png');
		this.load.image('battery', 'res/elements/battery.png');
		this.load.image('bulb_off', 'res/elements/bulb_off.png');
		this.load.image('bulb_on', 'res/elements/bulb_on.png');
		this.load.image('inverter', 'res/elements/inverter.png');
		this.load.image('mux', 'res/elements/mux.png');
		this.load.image('or', 'res/elements/or.png');
		this.load.image('shock', 'res/elements/shock.png');
		this.load.image('shocksign_gray', 'res/elements/shocksign_gray.png');
		this.load.image('skullsign', 'res/elements/skullsign.png');
		this.load.image('splitter', 'res/elements/splitter.png');
		this.load.image('switch_on', 'res/elements/switch_on.png');
		this.load.image('switch_off', 'res/elements/switch_off.png');

		// load arrows
		this.load.image('arrow', 'res/images/arrow.png');

		// load hoock and check sign
		this.load.image('error', 'res/images/error.png');
		this.load.image('okay', 'res/images/okay.png');

		// load pictures for drawing
		this.load.image('brushGreen', 'res/images/brushGreen.png');
		this.load.image('brushBlue', 'res/images/brushBlue.png');
		this.load.image('brushRed', 'res/images/brushRed.png');

		this.load.image('eraser2', 'res/images/eraser.png');
		this.load.image('deleteButton', 'res/images/deleteButton.png');

		// pictures for intro scene
		this.load.image('playSymbol', 'res/images/play_symbol.png');
		this.load.image('locked', 'res/images/locked.png');
		this.load.image('unlocked', 'res/images/unlocked.png');
		this.load.image('flag', 'res/images/flag.png');

		// load question mark box
		this.load.image('camouflaged', 'res/images/questionMark.png');

		// load arrow
		this.load.image('arrowRight_type_2', 'res/images/arrowRight.png');

		// load pictures for camouflage training phase
		this.load.image('arrow_handdrawn', 'res/images/arrow_handdrawn.png');
		this.load.image('dummy', 'res/images/dummy.png');
		this.load.image('strikeOut', 'res/images/strikeOut.png');
		this.load.image('wireConnection', 'res/images/wireConnection.png');
		this.load.image('line', 'res/images/line.png');
	}

	/**
	 * The usual initializations
	 */
	create()
	{
		//AniLib.darkenScreen(this);

		// get language library
		Rq.get('/assets/languageLibrary/languageLibrary', data => {
			LangDict.load(data);
			
			// Generate a pseudo random session token
			JsonRPC.sessionID = Math.round(Math.random() * 1000 * Math.round(Rq.now()/137)).toString(32).slice(-8);
			console.log("Session id is: " + JsonRPC.sessionID);

			// Ask the server about the current session
			JsonRPC.sendStateless("sessionState", {}, (data, success) => {
				// Pseudonym might be invalid?
				if(!success)
				{
					console.error("Could not get session data, the server responded with: ");
					console.error(data);
				}
				
				// Check if this is the first session, if yes start the game immediately
				if(data['firstSession'] == 'yes')
					this.actuallyStartGame();

				// If not the first session, ask if the player wants to invalidate the old one
				else
				{	
					// If the player already is at the end of the game, don't care if we invalidate old sessions
					// Currently the client cannot detect if the time has run out, because the server will send the 
					// old scene. TODO Maybe fix this
					if(['FinalScene', 'FinalSceneNPS', 'finished', 'End of game'].includes(data['scene']))
						this.actuallyStartGame();
					else
						this.resetSessionPopup();
				}
			});			
		}, "text/plain; charset=utf-8");
	}

	/**
	 * Ask the user if he/she/they wants to invalidate the old session
	 */
	resetSessionPopup()
	{
		console.log("The game was already started in another window.");

		const y = 300;

		// Show "You are about to invalidate a session" warning
		const message = this.add.dom(
			config.width/2, y, 'div', 
			'font-size: 20pt; width: 600px; text-align: center; color: #f8b170', 
			LangDict.get('invalidateSessionPopup')
		);
		
		// Create continue button
		const btn = this.add.dom(
			config.width/2, y + message.height, 'button',
			'',
			LangDict.get('ok')
		);
		
		// Add continue button event listener
		btn.node.addEventListener('click', this.actuallyStartGame.bind(this));
		
		// Try to create information bar
		try {
			if(!(this.informationBar instanceof InformationBar))
				this.informationBar = new InformationBar(this);
		}
		catch(e) {console.error(e)};
	}

	/**
	 * Continue to load the actual game after the session was established
	 * @returns Returns early if the game was already started (e.g. the continue button was spammed)
	 */
	actuallyStartGame()
	{
		if(PreloadScene.gameStarted)
		{
			console.error("Game is already running");
			return;
		}

		PreloadScene.gameStarted = true;
		JsonRPC.que("startGame", {});
				
		// Get the first scene from the server
		JsonRPC.send("status", {}, (data, success) => {
			if(!success)
				console.error(data);
			
			if(typeof data.phase == 'string')
				this.nextPhase(data.phase, data);
			else
				console.error("Could not start the game, because the server did not send a valid phase!!!");
		});
	}
}

PreloadScene.gameStarted = false;
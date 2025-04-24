// Current Phaser Version: v3.86.0
const config = {
	// size of game
	width: 1280,
	height: 720,
	parent: 'phaser-reversim',

	// Use a canvas with black background
	type: Phaser.CANVAS,
	backgroundColor: 0x000000,

	scene: [
		PreloadScene,
		GameIntroductionScene,
		GameIntroductionSceneND,
		CompetitionScene,
		FinalScene,
		FinalSceneNPS,
		ConnectionLostScene,
		QualiScene,
		IntroduceDrawingTools,
		LanguageScene,
		IntroduceElements,
		SkillScene,
		AlternativeTask,
		LevelViewScene,
		LevelEditor,
		SessionInvalidatedScene
	],

	// number of pointers
	input: {
		activePointers: 1
	},

	// make game scalable
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},

	dom: {
		createContainer: true
	},

	/** 
	 * Please note: the new JavaScript level editor can only produce UTF-8 files, however the old Java Editor
	 * will produce Windows-1252 encoded files on a (german?) windows machine and UTF-8 on Linux etc.
	 */
	LEVEL_ENCODING: 'utf-8'
}

const preloadLanguages = {
	'noSafari': {
		'DE': 'Das Spiel läuft aktuell nicht auf mobilen Geräten des Herstellers Apple (iPad, iPhone) und auch Safari wird von uns noch nicht unterstützt. Bitte nutzen Sie einen aktuellen Desktop Browser (z.B. Firefox oder Chrome).',
		'EN': 'We are currently aware about the issues on mobile devices manufactured by Apple (iPad, iPhone). Also Safari is currently not supported by our game. Please use a modern Desktop Browser (like Firefox or Chrome).'
	},
	'startError': {
		'DE': 'Beim laden des Spiels ist ein Fehler aufgetreten. Bitte stellen Sie sicher, dass Sie einen aktuellen Desktop Browser wie z.B. Firefox oder Chrome nutzen.',
		'EN': 'An error occurred while loading the game. Please make sure you are using a recent Desktop Browser like Firefox or Chrome.'
	}
};

// create a variable for the pseudonym 
// var pseudonym = null;
var pseudonym = user;

// NOTE: languageDict was moved inside GameUtils.js

var elapsedTime = 0;

var displayLeavePopup = true;

// define text style for title
var titleStyle = {
	fontFamily: 'hre_title_font',
	align: 'left',
	fontSize: '60px',
	wordWrap: { width: config.width * 0.8, useAdvancedWrap: true }
}


// define text style for standard text
var textStyle = {
	fontFamily: 'hre_text_font',
	align: 'left',
	fontSize: '30px'
}


window.onload = function ()
{
	LangDict.changeLang(LangDict.gameLanguage);

	try
	{
		if(isApple())
			alert(preloadLanguages.noSafari[LangDict.gameLanguage]);

		// Init Phaser3
		this.game = new Phaser.Game(config);
		var game = this.game;
		var pausedScene = null;
		var timeStampConnectionLost = null;
	}
	catch(error)
	{
		console.error(error);
		alert(preloadLanguages.startError[LangDict.gameLanguage]);
	}

	// Debug message: Print group
	console.log('You where assigned to group: ' + group);

	// this function can be extended by displaying a message while the prompt is displayed
	// beforeunload
	window.onbeforeunload = function (e)
	{
		// !currentScene.startsWith('FinalScene')
		if(displayLeavePopup)
		{
			// Cancel the event
			e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
			// Chrome requires returnValue to be set
			e.returnValue = '';

			return;
		}
	}


	function testConnection()
	{
		$.post("/testConnection", { 'pseudonym': pseudonym, 'timeStamp': Rq.now() })
			.fail((jqXHR, textStatus) =>
			{
				// Switch to the connection lost scene if in normal scene
				if(!game.scene.isActive('connectionLostScene'))
				{
					// transform mouse 
					document.body.style.cursor = 'wait';
					// get scenes
					let scenes = game.scene.getScenes(true);
					pausedScene = scenes[0];
					game.scene.switch(pausedScene, 'connectionLostScene');

					timeStampConnectionLost = performance.now()
				}
				// Second error in a row, check if the pseudonym was invalidated (due to a server restart)
				else if(jqXHR.responseText == 'invalid pseudonym')
				{
					// Switch to session invalidated scene
					const currentScene = game.scene.getScenes(true)[0];
					game.scene.switch(currentScene, 'sessionInvalidatedScene');

					pseudonymRejected();
				}
			})
			.done((data) =>
			{
				document.body.style.cursor = 'context-menu';
				if(pausedScene != null)
				{
					//switch from 'connectionLostScene' back to the paused Scene
					game.scene.switch('connectionLostScene', pausedScene.scene.key);
					pausedScene = null;
				}

				// Check if the session was invalidated. If true, cancel the /testConnection task
				// and show an info to the user
				if(JsonRPC.session_invalid || data != 'pong')
				{
					const pausedScene = game.scene.getScenes(true)[0];
					game.scene.switch(pausedScene, 'sessionInvalidatedScene');
					clearInterval(timerHandle_connectionCheck);
				}
			});
	}

	// Periodically contact /testConnection
	timerHandle_connectionCheck = setInterval(testConnection, 1000);
}

/**
 * Tell the user, that the pseudonym was invalidated
 * @returns 
 */
function pseudonymRejected()
{
	// Only show the alert once
	if(!reversim_pseudonymValid)
		return;

	reversim_pseudonymValid = false;
	endGame();

	console.error("Test Connection failed, pseudonym was rejected");
	window.alert("The server refused our pseudonym, probably due to a server restart!");

	// Reset mouse cursor
	document.body.style.cursor = 'context-menu';
}

/**
 * Called after the game has ended, either on the FinalScene or because the session was invalidated
 * 
 * Deactivates the /testConnection checks
 */
function endGame()
{
	clearInterval(timerHandle_connectionCheck);
}

/** Will become false, when the server refuses the pseudonym (probably due to a restart) */
let reversim_pseudonymValid = true;

/** Timer handle for /testConnection */
let timerHandle_connectionCheck = null;

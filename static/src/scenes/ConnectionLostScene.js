/**
 * 
 */
class ConnectionLostScene extends Phaser.Scene
{
	constructor()
	{
		super('connectionLostScene');
	}


	create()
	{
		var initialYOffset = 200;
		var yOffset = 120;
		var textObjects = [];

		// show: 'Connection lost info'
		this.infoText = AddText.addTextFromLib(this, 100, initialYOffset, 'noConnection');
		textObjects.push(this.infoText);

		// show: 'Trying to reconnect ...'
		this.infoText2 = AddText.addTextFromLib(this, 100, this.infoText.y + yOffset, 'tryReconnect');
		textObjects.push(this.infoText2);

		// show: warning
		this.infoText3 = AddText.addTextFromLib(this, 100, this.infoText2.y + yOffset, 'reconnectWarning1');
		textObjects.push(this.infoText3);

		// show: warning
		this.infoText4 = AddText.addTextFromLib(this, 100, this.infoText3.y + 40, 'reconnectWarning2');
		textObjects.push(this.infoText4);

		// add animation to info text
		this.scaleUpDownAnimation(textObjects);
	}

	scaleUpDownAnimation(gameObj)
	{
		// add tween to gameObj
		this.tweens.add({
			targets: gameObj,
			duration: 2000,
			scaleX: 1.05,
			ease: 'Quad.easeInOut',
			repeat: -1,
			yoyo: true
		});

		this.tweens.add({
			targets: gameObj,
			duration: 2000,
			scaleY: 1.1,
			ease: 'Quad.easeInOut',
			repeat: -1,
			yoyo: true
		});
	}
}

class SessionInvalidatedScene extends Phaser.Scene
{
	constructor()
	{
		super('sessionInvalidatedScene');
	}

	create()
	{
		this.informationBar = new InformationBar(this);
		const desc = AddText.addTextFromLib(this, config.width/2, 300, 'sessionClosed');
		desc.setOrigin(0.5, 0.5);

		desc.setStyle({
			wordWrap: { width: config.width * 0.8, useAdvancedWrap: true }
		});
	}
}
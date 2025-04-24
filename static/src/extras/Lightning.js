/**
 * 
 */
class Lightning extends Phaser.GameObjects.GameObject
{
	constructor(scene, x, y)
	{
		super(scene, 'Lightning');
		scene.add.existing(this);

		// assigning constructor values
		this.scene = scene;
		this.x = x;
		this.y = y;
	}


	createImage()
	{
		this.image = this.scene.add.image(this.x, this.y, 'shock');
		this.image.setDepth(1);
		this.image.setVisible(false);
	}


	startAnimation()
	{
		this.image.setVisible(true);
		this.config = { delay: 200, callback: this.rotate, callbackScope: this, loop: true }
		this.timedEvent = this.scene.time.addEvent(this.config);
	}


	rotate()
	{
		this.visible = !this.visible;
		this.image.setVisible(this.visible);
		this.image.rotation += Math.random() * 10;

	}


	stopAnimation()
	{
		if(this.timedEvent != null)
		{
			this.timedEvent.remove();
			this.timedEvent = null;
			this.image.setVisible(false);

		}
	}


	cleanUp()
	{
		this.stopAnimation();
		this.image.destroy();
	}


	setScale(scaleFactor)
	{
		this.image.setScale(scaleFactor);
	}
}

/**
 * 
 */
class ErrorSignal extends Phaser.GameObjects.GameObject
{
	constructor(scene, x, y)
	{
		super(scene, 'errorSignal');
		scene.add.existing(this);

		this.scene = scene;
		this.x = x;
		this.y = y;

		// counts the number of flashes
		this.ctr = 0;
	}


	create()
	{
		this.visible = false;
		this.image = this.scene.add.image(this.x, this.y, 'error');
		this.image.setDepth(10);
		this.image.setVisible(this.visible);
		this.timedEvent = this.scene.time.addEvent({
			delay: ErrorSignal.visToggleDelay, 
			callback: this.flash, 
			callbackScope: this, 
			loop: true 
		});
	}


	flash()
	{
		this.ctr++;
		this.visible = !this.visible;
		this.image.setVisible(this.visible);
		if(this.ctr > ErrorSignal.repeatCount)
		{
			this.timedEvent.remove();
			this.image.setVisible(false);
			this.image.destroy();
		}
	}


	cleanUp()
	{
		this.image.destroy();
		this.timedEvent.destroy();
	}
}

ErrorSignal.visToggleDelay = 300;
ErrorSignal.repeatCount = 4;
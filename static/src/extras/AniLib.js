/**
 * Animations library for Phaser.js
 */
class AniLib
{
	static darkenScreen(scene, callback=null)
	{
		if (callback) {
			scene.cameras.main.once('camerafadeoutcomplete', callback);
		}
		scene.cameras.main.fadeOut(750, 0, 0, 0, () => { }, this);
	}


	static showScreen(scene, callback=null)
	{
		if (callback) {
			scene.cameras.main.once('camerafadeincomplete', callback);
		}
		scene.cameras.main.fadeIn(AniLib.fadeInTime, 0, 0, 0, () => { }, this);
	}


	static blackScreen(scene)
	{
		scene.cameras.main.fadeOut(0, 0, 0, 0, () => { }, this);
	}


	static disappear(obj, scene)
	{
		return scene.tweens.add({
			targets: obj,
			y: -100,
			duration: 2000,
			ease: 'Power1'
		});
	}

	/**
	 * 
	 * @param {Phaser.GameObjects.GameObject} gameObj The objects to animate
	 * @param {*} scene 
	 * @returns 
	 */
	static popIn(gameObj, scene)
	{
		// add tween to gameObj
		let tween1 = scene.tweens.add({
			targets: gameObj,
			duration: 2000,
			scaleX: 1.5,
			ease: 'Power1'
		});

		let tween2 = scene.tweens.add({
			targets: gameObj,
			duration: 2000,
			scaleY: 1.5,
			ease: 'Power1'
		});

		return [tween1, tween2];
	}

	/**
	 * Smootly scale the object larger and smaller
	 * @param {Phaser.GameObjects.GameObject|Phaser.GameObjects.GameObject[]} gameObj The objects to animage
	 * @param {number} scaleX 
	 * @param {number} scaleY 
	 * @param {number} duration 
	 * @param {Phaser.Scene} scene The parent scene for this animation
	 * @returns 
	 */
	static scaleUpDownAnimation(gameObj, scaleX, scaleY, duration, scene)
	{
		// add tween to gameObj
		var tween1 = scene.tweens.add({
			targets: gameObj,
			duration: duration,
			scaleX: scaleX,
			ease: 'Quad.easeInOut',
			repeat: -1,
			yoyo: true
		});

		var tween2 = scene.tweens.add({
			targets: gameObj,
			duration: duration,
			scaleY: scaleY,
			ease: 'Quad.easeInOut',
			repeat: -1,
			yoyo: true
		});

		return [tween1, tween2];
	}

	/**
	 * Pause animations like the scale up and down animation
	 * @param {RectButton} gameObj 
	 * @param {Phaser.Scene} scene 
	 */
	static pauseAnimations(gameObj, scene)
	{
		for(let tween of scene.tweens.getTweensOf(gameObj.getObjects()))
			tween.pause();
	}

	/**
	 * Resume animations like the scale up and down animation
	 * @param {RectButton} gameObj 
	 * @param {Phaser.Scene} scene 
	 */
	static resumeAnimations(gameObj, scene)
	{
		for(let tween of scene.tweens.getTweensOf(gameObj.getObjects()))
			tween.resume();
	}

	/**
	 * Clear all animations for this object.
	 * @param {Array.<Phaser.GameObjects.GameObject>} gameObj The objects to remove the tweens from.
	 * @param {Phaser.Scene} scene The parent scene
	 */
	static clearAnimations(gameObj, scene)
	{
		for(let tween of scene.tweens.getTweensOf(gameObj))
		{
			tween.seek(1); // Should be 0ms, but the button would disappear, probably a bug in Phaser3
			tween.stop(); // `stop(0)` used to be possible in Phaser 3.55.0, but not in 3.70.0...
		}
	}
}

AniLib.fadeInTime = 750 // ms
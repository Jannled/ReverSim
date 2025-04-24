/**
 * 
 */
class AddText extends Phaser.GameObjects.GameObject
{
	/**
	 * Create a new text element in this scene.
	 * @param {*} scene Parent scene for this GameObject
	 * @param {*} x x coord of the text (in screen coordinates)
	 * @param {*} y y coord of the text (in screen coordinates)
	 * @param {*} txtInfo The label or text that should be displayed, see labelBool
	 * @param {*} labelBool True if txtInfo contains a label from the languageDict, false if txtInfo contains the actual text
	 * @returns The newly created textObject
	 */
	static addText(scene, x, y, txtInfo, labelBool)
	{
		var str;
		if(labelBool == true)
			str = LangDict.get(txtInfo);
		else
			str = txtInfo;
		
		var txtObject = scene.add.text(x, y, str, textStyle);

		return txtObject;
	}

	static setUpText(txtObject, label)
	{
		if('X-POSITION' in LangDict.languageDict[label])
		{
			var x = LangDict.get(label, 'X-POSITION');
			x = parseInt(x);
			txtObject.setPosition(x, txtObject.y);
		}

		if('Y-POSITION' in LangDict.languageDict[label])
		{
			var y = LangDict.get(label, 'Y-POSITION');
			y = parseInt(y);
			txtObject.setPosition(txtObject.x, y);
		}


		if('SIZE' in LangDict.languageDict[label])
		{
			var s = LangDict.get(label, 'SIZE');
			s = parseInt(s);
			txtObject.setFontSize(s);
		}

		if('COLOR' in LangDict.languageDict[label])
		{
			var color = LangDict.get(label, 'COLOR');
			txtObject.setStyle({ color: color });
		}

		if('ALIGNMENT' in LangDict.languageDict[label])
		{
			var alignment = LangDict.get(label, 'ALIGNMENT');
			txtObject.setStyle({ align: alignment });
		}

		if('X-ORIGIN' in LangDict.languageDict[label])
		{
			var xOrigin = LangDict.get(label, 'X-ORIGIN');
			xOrigin = parseFloat(xOrigin);
			txtObject.setOrigin(xOrigin, txtObject.originY);
		}

		if('Y-ORIGIN' in LangDict.languageDict[label])
		{
			var yOrigin = LangDict.get(label, 'Y-ORIGIN');
			yOrigin = parseFloat(yOrigin);
			txtObject.setOrigin(txtObject.originX, yOrigin);
		}
	}

	static addTextFromLib(scene, x, y, label)
	{
		var str = LangDict.get(label);
		var txtObject = scene.add.text(x, y, str, textStyle);
		AddText.setUpText(txtObject, label);
		return txtObject;
	}

	/**
	 * Used by the InfoPanel class to add the text elements.
	 * @param {Phaser.Scene} scene Parent scene.
	 * @param {*} label LanguageDict entry.
	 * @returns 
	 */
	static addTextFromInfoPanel(scene, label)
	{
		var str = LangDict.get(label);

		// Replace placeholders
		str = str.replaceAll('{numLevels}', LangDict.getCardinalNumber(GameScene.levelsToGo))

		var txtObject = scene.add.text(0, 0, str, textStyle);
		AddText.setUpText(txtObject, label);
		return txtObject;
	}

	setPosition(txtObject, x, y)
	{
		txtObject.setPosition(x, y);
	}
}

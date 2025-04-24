/**
 * 
 */
class TextBox extends Component
{
	/**
	 * 
	 * @param {BaseScene} scene 
	 * @param {number} id Unique id of this element.
	 * @param {*} rotation A number from 0 - 3, 0 means text is in normal orientation. (currently unsupported)
	 * @param {*} x x-position in level coordinates
	 * @param {*} y y-position in level coordinates
	 * @param {*} string The text to be displayed
	 */
	constructor(scene, id, rotation, x, y, string)
	{
		super(scene, id, rotation, x, y);
		this.setName("TextBox (" + id + ")");

		this.string = string;

		for(var languageEntry of this.string)
		{
			languageEntry = languageEntry.split(':')
			var language = languageEntry[0];
			var expression = languageEntry[1];

			if(language == LangDict.gameLanguage)
			{
				this.string = expression;
			}
		}

		let pos = this.scene.levelToScreenCoords(this.x, this.y);
		var textObject = this.scene.add.text(pos.x, pos.y, this.string, textStyle)
			.setFontSize(20)
			.setDepth(20)
			.setColor(TextBox.defaultTextColor);
		textObject.setOrigin(0.5, 0.5);

		this.pic = [];
		this.pic.push(textObject);
	}
}

TextBox.defaultTextColor = 'white';
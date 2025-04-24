/**
 * Displays a bar at the bottom of the scene which holds text elements with
 * hyperlinks. When text elements are pressed by the mouse they will open
 * the linked page in a new tab.
 */
class InformationBar
{
	/**
	 * Create a new Info bar
	 * @param {Phaser.Scene} scene The parent scene
	 */
	constructor(scene)
	{
		this.scene = scene;
		this.footerAnchors = {};
		this.create(scene);
	}

	create(scene)
	{
		// Iterate over all footer elements
		for(const [key, link] of Object.entries(gamerules.footer))
			this.footerAnchors[key] = InformationBar.createHyperlink(link);

		// Game Hash
		const gameHashSpan = document.createElement('span');
		gameHashSpan.innerText = game_hash;
		gameHashSpan.title = "Game Version";
		gameHashSpan.classList.add('gameHash');
		gameHashSpan.style.marginTop = '0px'
		this.gameHash = gameHashSpan;

		// Documentation
		this.aDocumentation = InformationBar.createHyperlink('/doc/LevelEditor.html');
		this.setDocumentationVisible(false);

		this.changeLanguage();

		// Parent Container (gray div)
		let divInfo = document.createElement('div');
		divInfo.id = 'footer';
		divInfo.append(this.gameHash);
		divInfo.append(...Object.values(this.footerAnchors));
		divInfo.append(this.aDocumentation);

		// x: config.width / 2			(with config.width being the width of the footer)
		// y: config.height - 25px / 2	(with 25px being the height of the footer)
		scene.add.dom(config.width/2, Math.ceil(config.height - InformationBar.getHeight()/2), divInfo);
	}

	changeLanguage()
	{
		for(const [key, a] of Object.entries(this.footerAnchors))
			a.innerText = LangDict.get(key);

		this.aDocumentation.innerText = LangDict.get('documentation');
	}

	setDocumentationVisible(visible)
	{
		this.setFooterVisible(this.aDocumentation, visible);
	}

	/**
	 * Show or hide an element
	 * @param {HTMLAnchorElement} footerEl Reference to the element
	 * @param {boolean} visible True will set the display style to 'inline', false to 'none'
	 */
	setFooterVisible(footerEl, visible)
	{
		footerEl.style.display = visible ? 'inline' : 'none';
	}


	/**
	 * Create a HTMLAnchorElement which will open the link in a new tab.
	 * Also adds some attributes to prevent tabnabbing.
	 * @param {string} url The url where this a element shall redirect to (the href attribute of the a element).
	 * @param {string} text The text that will be displayed as the link text.
	 * @returns The HTMLAnchorElement created by document.createElement().
	 */
	static createHyperlink(url, text = undefined)
	{
		let a = document.createElement('a');
		a.href = url;

		// https://www.freecodecamp.org/news/how-to-use-html-to-open-link-in-new-tab/
		// target="_blank" rel="noopener noreferrer"
		a.target = "_blank";
		a.rel = "noopener noreferrer";

		if(typeof text == 'string')
			a.innerText = text

		return a;
	}

	/**
	 * Get the height of this object
	 * @returns 
	 */
	static getHeight()
	{
		return 25;
	}
}

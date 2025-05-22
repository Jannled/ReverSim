class PropertiesPanel
{
	/**
	 * 
	 * @param {Phaser.Scene} scene 
	 */
	constructor(scene)
	{
		this.propertiesList = document.createElement('div');
		this.propertiesPanelGameObject = scene.add.dom((config.width) / 4, (config.height) / 4, this.propertiesList);
		this.propertiesList.classList.add('popUp', 'levelElementProperties');
		this.propertiesPanelGameObject.setInteractive();

		// NOTE Workaround Phaser3 disable the global click listener to make the popup work as expected
		if(window)
		{
			const mouseManager = scene.input.manager.mouse;
			const target = (mouseManager.isTop) ? window.top : window;

			// @ts-ignore
			target.removeEventListener('mousedown', mouseManager.onMouseDownWindow);
			// @ts-ignore
			target.removeEventListener('mouseup', mouseManager.onMouseUpWindow);
		}

		this.originX = 0.5;
		this.originY = 0.5;
		this.scene = scene;

		this.propertiesPanelGameObject.setOrigin(0, 0);
	}

	show()
	{
		this.propertiesPanelGameObject.setVisible(true);
	}

	hide()
	{
		// Yeet all child elements
		while(this.propertiesList.firstChild)
		{
			const lc = this.propertiesList.lastChild;

			// Ensure that text content is saved
			if(lc.nodeName.toLowerCase() == 'textarea')
				lc.dispatchEvent(new Event('change'));

			this.propertiesList.removeChild(lc);
		}

		// Hide the container (Phaser3 overrides the `display` setting)
		this.propertiesPanelGameObject.setVisible(false);
		this.propertiesList.style.display = "none";
	}

	addHeader(text)
	{
		const h = document.createElement('h2');
		h.innerText = text;
		h.style.marginTop = "0";
		this.propertiesList.appendChild(h);
	}

	/**
	 * 
	 * @param {string} name 
	 * @param {function} callback 
	 * @param {number} defaultVal 
	 * @param {number} step 
	 * @param {number} max
	 */
	addNumber(name, callback, defaultVal = 0, step = 50, max = Number.MAX_SAFE_INTEGER)
	{
		let input = this.addString(name, callback, String(defaultVal));
		input.type = "number";
		input.min = "0";
		input.step = String(step);
		input.value = String(defaultVal);
		if(max <= Number.MAX_SAFE_INTEGER)
			input.max = String(max);

		return input;
	}

	/**
	 * 
	 * @param {string} name 
	 * @param {function} callback 
	 * @param {boolean} defaultVal 
	 */
	addBoolean(name, callback, defaultVal = false)
	{
		let input = this.addString(name, callback, String(defaultVal));
		input.type = "checkbox";
		input.checked = defaultVal;
		input.onchange = (e) => callback(input.checked, name);

		return input;
	}

	/**
	 * 
	 * @param {string} name 
	 * @param {function} callback 
	 * @param {string} defaultVal 
	 * @returns 
	 */
	addString(name, callback, defaultVal = "Hello World!")
	{
		let input = document.createElement('input');
		this._setupText(input, name, defaultVal);
		input.onchange = (e) => callback(input.value, name);
		
		return input;
	}

	addMultilineString(name, callback, defaultVal = "Hello World!")
	{
		let input = document.createElement('textarea');

		const val = String(defaultVal).replaceAll('§', '\n');
		this._setupText(input, name, val);
		input.onchange = (e) => callback(input.value.replaceAll('\n', '§'), name);
		input.onkeyup = (e) => callback(input.value.replaceAll('\n', '§'), name);

		return input;
	}

	/**
	 * 
	 * @param {HTMLTextAreaElement | HTMLInputElement} inputElement 
	 * @param {string} name 
	 * @param {string} value 
	 */
	_setupText(inputElement, name, value)
	{
		const label = this.addLabel(name);

		inputElement.id = label.htmlFor;
		inputElement.name = name;
		inputElement.value = value;
		inputElement.style.display = "block";

		this.propertiesList.appendChild(label);
		this.propertiesList.appendChild(inputElement);

		return label;
	}

	addButton(name, callback)
	{
		const propName = "prop_" + name;

		let btn = document.createElement('input');
		btn.type = "button";
		btn.value = name; // The inner text of the input button element is `.value`
		btn.id = propName;
		btn.onclick = callback;
		this.propertiesList.appendChild(btn);
		return btn;
	}

	/**
	 * 
	 * @param {string} name 
	 * @param {function} callback 
	 * @param {string[]} values 
	 * @param {string} selectedValue
	 */
	addEnum(name, callback, values, selectedValue = null)
	{
		const label = this.addLabel(name);

		// Create the actual dropdown
		let dropdown = document.createElement('select');
		dropdown.id = label.htmlFor;
		dropdown.name = name;

		// Add all options to dropdown
		for(const v of values)
		{
			let o = document.createElement('option');
			o.text = v;
			dropdown.options.add(o);
		}

		// Try to select the specified option
		if(selectedValue != null)
			dropdown.value = selectedValue;

		// Add callback and CSS to dropdown and add it to parent container
		dropdown.onchange = (e) => callback(dropdown.value, name);
		this.propertiesList.appendChild(dropdown);
		return dropdown;
	}

	/**
	 * A widget to modify the rotation of a circuit element
	 * @param {string} name Used to craft the html element id
	 * @param {function} propChangedCallback Called when the property needs updating
	 * @param {LevelElement} levelElement The current rotation of the element
	 */
	addRotationWidget(name, propChangedCallback, levelElement)
	{
		const rotationSteps = 4;
		const disabled = ["TextBox", "Splitter"].includes(levelElement.type);
		const defaultLevelRot = LevelElement.getDefaultRotation(levelElement.type);
		const defaultIconRot = LevelElement.getDefaultIconRotation(levelElement.type);
		const defaultRotation = (defaultIconRot - defaultLevelRot) % rotationSteps;
		let rotation = levelElement.rotation;

		// Create a description and a container div
		const label = this.addLabel(name);
		let dContainer = document.createElement('div');
		dContainer.id = label.htmlFor;
		if(disabled)
			label.style.textDecorationLine = 'line-through';

		// Get DOM element from Phaser TextureManager
		const texture = this.scene.textures.get(levelElement.getComponentIcon());
		const domTexture = texture.getSourceImage(0);

		// Fall back to a number switcher, in case Phaser returns funky things
		if(!(domTexture instanceof Node))
		{
			console.error("Failed to get circuit element image. Falling back to old rotation widget");
			return this.addNumber("rotation", propChangedCallback, rotation, 1, rotationSteps - 1);
		}

		// Add all four rotation options
		for(let i=0; i<rotationSteps; i++)
		{
			const imageRotation = (360/rotationSteps) * ((i + defaultRotation) % rotationSteps);

			// Create a radio button to use as the rotation switcher
			let radioButton = document.createElement('input')
			radioButton.type = 'radio';
			radioButton.id = 'prop_rot_' + i;
			radioButton.name = 'rotation_switcher';
			radioButton.onchange = (e) => propChangedCallback(i, name);
			radioButton.checked = i == rotation; // Check the button that matches the current rotation
			radioButton.disabled = disabled;
			
			// Create the image label for the radio button
			let buttonLabel = document.createElement('label');
			buttonLabel.htmlFor = radioButton.id;
			buttonLabel.classList.add('rotationWidget');

			// Get the actual image from Phase and rotate it
			let gateImage = domTexture.cloneNode();
			// @ts-ignore
			gateImage.style = 'transform: rotate(' + imageRotation + 'deg);';
			buttonLabel.appendChild(gateImage);

			// Add radio button to container div
			dContainer.append(radioButton, buttonLabel);
		}

		// Add the container div to the popup
		this.propertiesList.appendChild(dContainer);

		return dContainer;
	}

	/**
	 * 
	 * @param {string} name 
	 * @returns 
	 */
	addLabel(name)
	{
		const propName = "prop_" + name;

		// Create descriptive text label
		let label = document.createElement('label');
		label.htmlFor = propName;
		label.innerText = name;

		// Append label and return the HTML element
		this.propertiesList.appendChild(label);
		return label;
	}

	/**
	 * Create a DOM input element for every element param that can be changed
	 * @param {*} element 
	 * @param {*} propChangedCallback 
	 * @returns 
	 */
	addCircuitElement(element, propChangedCallback)
	{
		if(!(element instanceof LevelLine))
			return;
		
		if(element instanceof LevelElement)
		{
			// Use a rotation widget instead of the usual number widget (required param)
			this.addRotationWidget("rotation", propChangedCallback, element);

			// If there are no additional params for this element type, we are done here
			if(!Array.isArray(LevelElement.elementTypes[element.type].params))
				return;
			
			let i=0;
			// Loop over all additional params
			for(let [pName, pType, defaultVal] of LevelElement.elementTypes[element.type].params)
			{
				const pValue = element.params[i++];

				switch(pType)
				{
					case "boolean": 
						this.addBoolean(pName, propChangedCallback, PropertiesPanel.toBool(pValue)); 
						break;

					case "number": 
						this.addNumber(pName, propChangedCallback, Number(pValue)); 
						break;

					case "string": 
						if(LevelElement.allowsLineBreaks(element.type))
							this.addMultilineString(pName, propChangedCallback, String(pValue));
						else
							this.addString(pName, propChangedCallback, String(pValue));
						break;

					case "enum": 
						this.addEnum(pName, propChangedCallback, defaultVal, pValue); 
						break;

					default: 
						console.error(`Unknown param type for level editor properties panel: "${pType}"`); 
						break;
				}
			}
		}

		else if(element instanceof LevelConnection)
		{
			// TODO
		}
	}

	/**
	 * Set the position of the PropertiesPanel
	 * @param {*} x x-Position in screen space coordinates
	 * @param {*} y y-Position in screen space coordinates
	 */
	setPosition(x, y)
	{
		// @ts-ignore
		const oldState = this.propertiesPanelGameObject.node.style.display;
		// @ts-ignore
		this.propertiesPanelGameObject.node.style.display = 'block';

		// Note: Get the scale of the game canvas, since when the window is not 1280 x 720,
		// the coordinates returned by `getBoundingClientRect()` are affected and don't match
		// the Phaser coordinates needed by `setPosition()`
		const configuredGameSize = this.scene.sys.game.scale.gameSize;
		const actualGameSize = this.scene.sys.game.scale.canvasBounds;
		const scaleX = configuredGameSize.width / actualGameSize.width;
		const scaleY = configuredGameSize.height / actualGameSize.height;

		// Own implementation of the anchor position, see `this.setOrigin()`
		// BoundingBox is not in Phaser World Coords but in Window Pixel Coords
		const boundingBox = this.propertiesPanelGameObject.node.getBoundingClientRect();
		const xWithOffset = x - boundingBox.width*this.originX*scaleX;
		const yWithOffset = y - boundingBox.height*this.originY*scaleY;

		this.propertiesPanelGameObject.setPosition(xWithOffset, yWithOffset);

		// @ts-ignore
		this.propertiesPanelGameObject.node.style.display = oldState;
	}

	/**
	 * Set the anchor point (the origin of the position) for this PropertiesPanel.
	 * @param {number} normalizedX 0 to set the anchor to the left edge, 0.5 for middle and 1.0 for the right edge.
	 * @param {number} normalizedY 0 to set the anchor to the top edge, 0.5 for middle and 1.0 for the bottom edge.
	 */
	setOrigin(normalizedX = 0.5, normalizedY = 0.5)
	{
		this.originX = normalizedX;
		this.originY = normalizedY;

		//this.propertiesPanelGameObject.setOrigin(normalizedX, normalizedY);

		// NOTE: Not directly setting the origin of `this.propertiesPanelGameObject` since it seems like the origin of
		// dom elements is not properly implemented. While it does change the CSS attribute `transform-origin`, the 
		// value does not seem to have an effect.
		this.setPosition(this.propertiesPanelGameObject.x, this.propertiesPanelGameObject.y);
	}


	isShown()
	{
		return this.propertiesPanelGameObject.visible;
	}

	/**
	 * Convert any value to a boolean. 
	 * 
	 * Basically the same as JavaScripts `Boolean(value)`, but ignoring case. 
	 * @param {any} value 
	 * @returns 
	 */
	static toBool(value)
	{
		return (typeof value == "string") ? (value.toLowerCase() === 'true') : Boolean(value);
	}

	/**
	 * Convert any value to a number, throwing an Exception if this would result in NaN
	 * @param {*} value 
	 * @returns 
	 */
	static toNum(value)
	{
		const n = Number(value);
		if(isNaN(n))
			throw '"' + value + '" is not a valid number!';
		
		return n;
	}
}
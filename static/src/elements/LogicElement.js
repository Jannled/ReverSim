/**
 * 
 */
class Component extends Phaser.GameObjects.GameObject
{
	/**
	 * 
	 * @param {BaseScene} scene 
	 * @param {*} id 
	 * @param {*} rotation 
	 * @param {*} x 
	 * @param {*} y 
	 */
	constructor(scene, id, rotation, x, y)
	{
		super(scene, 'CircuitComponent');
		scene.add.existing(this);

		this.scene = scene;
		this.id = id;
		this.x = x;
		this.y = y;
		this.rotation = rotation;

		// create Point for center positionX
		this.Pos = new Point(this.x, this.y);

		// important attributes for netlist
		this.inputs = new Set();
		this.outputs = new Set();
		this.wires = new Array();
		this.inputPortMap = new Map();

		this.outputState = 0; // boolean: values are 0 and 1
		this.inputSize = 0;

		this.pic = [];

		// Shrink down the canvas for the Quali and Competition Phase, so that the circuit wont overlap the drawing tools etc.
		this.shrinkCanvas = scene instanceof GameScene;

		this.highlightObject = null;
	}


	addImage(label, visible = true)
	{
		let pos = this.scene.levelToScreenCoords(this.x, this.y);
		let image = this.scene.add.image(pos.x, pos.y, label);
		image.angle += (this.rotation - 1) * 90;
		image.visible = visible;
		image.setDepth(20);

		this.pic.push(image);
		return image;
	}


	addWire(wire)
	{
		this.wires.push(wire);
	}


	getWires()
	{
		return this.wires;
	}


	getPos()
	{
		return this.Pos;
	}


	getInputPort(element)
	{
		if('layoutInputPort' in this && typeof this.layoutInputPort == 'function')
			return this.layoutInputPort().get(element);
		else // Throw a helpful error message for usage in the level editor
			throw new CircuitError(this.constructor.name + " has no input. Did you mess up the wiring order?", this.id);
	}


	getOutputPort()
	{
		if('layoutOutputPort' in this && typeof this.layoutOutputPort == 'function')
			return this.layoutOutputPort();
		else // Throw a helpful error message for usage in the level editor
			throw new CircuitError(this.constructor.name + " has no output. Did you mess up the wiring order?", this.id);
	}


	addInput(logicElement)
	{
		this.inputs.add(logicElement);
	}


	addOutput(logicElement)
	{
		this.outputs.add(logicElement);
	}


	getOutputs()
	{
		return this.outputs;
	}


	getOutputState()
	{
		return this.outputState;
	}


	getInputs()
	{
		return this.inputs;
	}


	getInputSize()
	{
		return this.inputs.size;
	}


	/**
	 * Run a simulation tick for this element. 
	 * The output state will be updated according to its input state. If this element has inputs, it will recursively 
	 * call `setOutputState()` on all inputs.
	 */
	setOutputState()
	{
		return this.outputState;
	}

	setVisible(bool)
	{
		for(var pic of this.pic)
		{
			pic.setVisible(bool);
		}
	}


	setMask(mask)
	{
		for(var pic of this.pic)
		{
			pic.setMask(mask);
		}
	}


	setDepth(depth)
	{
		for(var pic of this.pic)
		{
			pic.setDepth(depth);
		}
	}


	static gridDist(pointA, pointB)
	{
		return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y)
	}


	destroyAssets()
	{
		for(const image of this.pic)
		{
			image.destroy();
		}

		if(this.highlightObject)
			this.highlightObject.destroy();
	}

	getID()
	{
		return this.id;
	}


	setScale(scaleFactor)
	{
		for(var image of this.pic)
		{
			image.setScale(scaleFactor, scaleFactor);

		}
	}

	setAlpha(val)
	{
		for(var pic of this.pic)
		{
			pic.setAlpha(val);
		}
	}

	static multiInputPortAssignment(inputPortMap, inputElements, points)
	{
		// calculate the overall distance of every element to their target inputPort
		var distMin = 0;
		var bestAssignment = Array.from(inputElements);
		var j = 0;
		for(const element of inputElements)
		{
			distMin += Component.gridDist(element.getOutputPort(), points[j]);
			j++;
		}

		// permuatate the order of elements in the array
		// while computing the overall distance to their target-inputPorts
		var indexes = new Array();
		for(var i = 0; i < inputElements.length; i++)
		{
			indexes[i] = 0;
		}

		var i = 0;
		while(i < inputElements.length)
		{
			if(indexes[i] < i)
			{
				// swap
				var indexA = i % 2 == 0 ? 0 : indexes[i];
				var indexB = i;
				var tmp = inputElements[indexA];
				inputElements[indexA] = inputElements[indexB];
				inputElements[indexB] = tmp;

				// sum up distances
				var dist = 0;
				var j = 0;
				for(const element of inputElements)
				{
					dist += Component.gridDist(element.getOutputPort(), points[j]);
					j++;
				}

				if(dist < distMin)
				{
					bestAssignment = Array.from(inputElements);
					distMin = dist;
				}

				indexes[i]++;
				i = 0;
			} else
			{
				indexes[i] = 0;
				i++;
			}
		}

		// assign every element their target-inputPort
		var i = 0;
		for(const element of bestAssignment)
		{
			inputPortMap.set(element, points[i]);
			i++;
		}

		return inputPortMap;
	}

	/**
	 * Add a visual highlight to this object
	 * 
	 * Note: Can't use the tint method, when using `Phaser.CANVAS` instead of WebGL, this info is missing in the docs...
	 * @param {boolean} highlighted If a visual accent should be added to the object
	 */
	setHighlighted(highlighted = true)
	{
		if(config.type == Phaser.CANVAS)
		{
			const bb = this.getBoundingBox();
			const margin = 5;

			if(this.highlightObject == null)
				this.highlightObject = this.scene.add.rectangle(
					bb.x, 
					bb.y, 
					bb.w + 2*margin, 
					bb.h + 2*margin, 
					highlightColor, highlightTransparency
				);

			this.highlightObject.setVisible(highlighted);
		}
		else
		{
			if(highlighted)
			{
				for(let p of this.pic)
					p.setTintFill(highlightColor);
			}
			else
			{
				for(let p of this.pic)
					p.clearTint();
			}
		}
	}

	getActiveImage()
	{
		return this.pic[0];
	}

	getBoundingBox()
	{
		const boundingRect = this.getActiveImage();

		return {
			x: boundingRect.x,
			y: boundingRect.y,
			w: boundingRect.displayWidth,
			h: boundingRect.displayHeight
		};
	}

	static layoutPort(xPos, yPos, rotation, xOffset = 0, yOffset = 0)
	{
		// rotation in radian
		const angle = (rotation - 1) * 90 * Math.PI / 180;

		// calculate (x,y)-Coordinate of input port in relation to the element
		const portX = xPos + xOffset * Math.cos(angle) - yOffset * Math.sin(angle);
		const portY = yPos + yOffset * Math.cos(angle) + xOffset * Math.sin(angle);

		return new Point(portX, portY);
	}

	static layoutMultiport(xPos, yPos, rotation, numCons, width=50)
	{
		const offsetX = width / (numCons + 1);
		const offsetY = 0;
		const angle = (rotation - 1) * 90 * Math.PI / 180;

		let points = new Array();
		for(var i = 1; i <= numCons; i++)
		{
			const x = i * offsetX - width / 2;
			const y = offsetY;
			var portX = xPos + x * Math.cos(angle) - y * Math.sin(angle);
			var portY = yPos + y * Math.cos(angle) + x * Math.sin(angle);
			points[i - 1] = new Point(portX, portY);
		}

		return points;
	}
}

/** Color to be used, when the game object should be visually highlighted */
const highlightColor = 0x3399ff;
const highlightTransparency = 0.5;
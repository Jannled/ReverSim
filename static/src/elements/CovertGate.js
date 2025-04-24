/**
 * 
 */
class CovertGate extends Component
{
	constructor(scene, id, rotation, x, y, camouflageElementImage, effectiveElement)
	{
		super(scene, id, rotation, x, y);
		this.setName("Obfuscated-Gate (" + id + ")");

		this.camouflageElementImage = camouflageElementImage;
		this.effectiveElement = effectiveElement;
		this.effectiveInput = [];

		// add images
		var addedImage = this.addImage(camouflageElementImage);

		if(camouflageElementImage == 'camouflaged')
			addedImage.setRotation((this.rotation - 1) * 90);
	}


	setEffectiveInput(element)
	{
		this.effectiveInput.push(element);
	}

	getOutputPort()
	{
		return this.layoutOutputPort();
	}


	layoutOutputPort()
	{
		return Component.layoutPort(this.x, this.y, this.rotation);
	}


	layoutInputPort()
	{
		var inputSize = this.getInputs().size;
		var inputSet = this.getInputs();
		var inputElements = Array.from(inputSet);

		const points = Component.layoutMultiport(this.x, this.y, this.rotation, inputSize);
		this.inputPortMap = Component.multiInputPortAssignment(this.inputPortMap, inputElements, points);

		return this.inputPortMap;
	}


	setOutputState()
	{
		// set output states oof all elements in case at least one is a dummy input
		var inputs = Array.from(this.inputs);
		for(var element of this.getInputs())
		{
			element.setOutputState();
		}

		var outputState;
		try 
		{
			if(this.effectiveElement == 'inverter')
				outputState = !this.effectiveInput[0].setOutputState();
			else if(this.effectiveElement == 'identity')
				outputState = this.effectiveInput[0].setOutputState();
			else if(this.effectiveElement == 'and')
			{
				outputState = 1;
				for(var element of this.getInputs())
				{
					outputState = outputState * element.setOutputState();
				}

			} 
			else if(this.effectiveElement == 'or')
			{
				outputState = 0;
				for(var element of this.getInputs())
				{
					outputState = outputState + element.setOutputState();
				}
				
				outputState = outputState > 0 ? 1 : 0;
			}
		}
		catch(e)
		{
			// Throw a helpful error message for usage in the level editor
			if(['inverter', 'identity'].includes(this.effectiveElement))
				if(!(this.effectiveInput[0] instanceof Component))
					throw new CircuitError("You need to connect an actual wire to '" + this.effectiveElement + "'. Click on a wire to make it an actual covert gate connection.", this.id)
			else
				throw e;
		}
		
		this.outputState = outputState;
		return this.outputState;
	}
}

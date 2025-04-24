/**
 * 
 */
class Wire
{
	constructor(element)
	{
		this.points = new Array();
		this.origin = element;
	}


	addPoint(point)
	{
		this.points.push([point.x, point.y]);
	}


	getPoints()
	{
		return this.points;
	}
}

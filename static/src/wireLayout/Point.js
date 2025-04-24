/**
 * 
 */
class Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }


    getPos() {
      return [this.x, this.y];
    }


    equals(anotherPoint) {
      return ( (anotherPoint.x == this.x) && (anotherPoint.y == this.y));
    }

    /**
	 * returns euclidean distance
	 */ 
    distance(anotherPoint) {
        var xDist = anotherPoint.x - this.x;
        var yDist = anotherPoint.y - this.y;
        return Math.sqrt(xDist*xDist + yDist*yDist);
    }
}

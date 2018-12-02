function Player(){
	//sets player at a random position on the screen
	this.pos = createVector(random(100, width), random(100, height));
	this.vel = createVector(0,0);

	//control the rotation of the triangle
	this.heading = 0;

	//size of ship
	this.r = 20;

	//creates a triangle at the randomly generated position
	//at the size determined above
	this.render = function(){
		translate(this.pos.x, this.pox.y);

		//change the angle of the triangle
		this.rotation = 0;

		this.setRotation = function(angle){

		}

		//set color of player's triangle
		noFill();
		stroke(255);

		triangle(-this.r, this.r, this.r, this.r, 0,  -this.r);

		this.turn = function(){
			this.heading += this.rotation;
		}

	}

	this.update = function() {
		this.pos.add(this.vel);
	}

	this.boost = function(){
		var force = p5.Vector.fromAngle(this.heading);
		this.vel.add(force);
		this.vel.mult(0,95);
	}
}
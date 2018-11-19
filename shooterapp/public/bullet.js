function Bullet(xpos, ypos, objX, objY) {
  this.xpos = xpos;
  this.ypos = ypos;
  this.objX = objX;
  this.objY = objY;
  
  //draw bullet and make it move
  this.display = function() {
    stroke(0);
    fill(0);
    ellipse(this.xpos, this.ypos, 10, 10);
    this.xpos = lerp(this.xpos, objX, .05);
    this.ypos = lerp(this.ypos, objY, .05);
  }

}

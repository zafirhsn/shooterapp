function Bullet(xpos, ypos, color, dirX, dirY) {
  this.xpos = xpos; 
  this.ypos = ypos; 
  this.color = color;
  this.size = 10; 
  this.dirX = dirX;
  this.dirY = dirY;

  //draw bullet
  this.display = function() {
    noStroke(); 
    fill(color); 
    ellipse(this.xpos, this.ypos, this.size, this.size); 
  }

  // bullet movement logic
  this.update = function(){
    this.xpos += dirX;
    this.ypos += dirY;
  }
}
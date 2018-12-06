function Bullet(xpos, ypos, color, dirX, dirY) {
  this.xpos = xpos; 
  this.ypos = ypos; 
  this.color = color;
  this.size = 10; 
  this.toDelete = false; 
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

  // bullet must disappear if out of frame, or if it hits another player
  // *THIS CODE HASN'T BEEN WRITTEN YET*
  this.vanish = function(){
    /*if(this.xpos == objX && this.ypos == objY){
      vanish();
    }*/
    this.toDelete = true;
  }

  // 
  this.hits = function(p) {
    //!!!!
    //!!!!
    //!!!!
    //DE-COMMENT THE 3 LINES OF CODE BELOW BEFORE FINAL RENDITION OF CODE SO YOU DON'T KILL YOURSELF

     if(this.color == p.color){
       return false;
     }
    

    var d = dist(this.xpos, this.ypos, p.xpos, p.ypos);
    if (d < 45){
      return true;
    }
    return false;
  }
}



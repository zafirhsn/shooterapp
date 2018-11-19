function Bullet(xpos, ypos, objX, objY, color) {
  this.xpos = xpos;
  this.ypos = ypos;
  this.objX = objX;
  this.objY = objY;
  this.color = color;
  this.toDelete = false;
  
  //draw bullet and make it move
  this.display = function() {
    noStroke();
    fill(color);
    ellipse(this.xpos, this.ypos, 10, 10);
    this.xpos = lerp(this.xpos, objX, 0.5);
    this.ypos = lerp(this.ypos, objY, 0.5);
  }


  this.vanish = function(){
    /*if(this.xpos == objX && this.ypos == objY){
      vanish();
    }*/
    this.toDelete = true;
  }

  this.hits = function(p) {
    //!!!!
    //!!!!
    //!!!!
    //DE-COMMENT THE 3 LINES OF CODE BELOW BEFORE FINAL RENDITION OF CODE SO YOU DON'T KILL YOURSELF

    // if(this.color == p.color){
    //   return false;
    // }
    

    var d = dist(this.xpos, this.ypos, p.xpos, p.ypos);
    if (d < 45){
      return true;
    }
    return false;
  }
}



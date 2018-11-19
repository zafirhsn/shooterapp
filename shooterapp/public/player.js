function Player(xpos, ypos) {
  //generates new player randomly on screen
  this.ypos = ypos;
  this.xpos = xpos; 
  this.lives = 5;
  this.dead = false;
  this.color = Player.prototype.colorBank[Math.floor(Math.random() * Player.prototype.colorBank.length)];

  this.update = function() {
    if (keyIsDown(LEFT_ARROW)) {
      console.log("Key is down");
      this.xpos -= 10;
      // return true;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.xpos += 10;
      // return true;
    }
    if (keyIsDown(DOWN_ARROW)) {
      this.ypos += 10;
      // return true;
    }
    if (keyIsDown(UP_ARROW)) {
      this.ypos -= 10;
      // return true;
    }

  };

  this.display = function() {
    stroke(0);
    fill(this.color);
    ellipse(this.xpos, this.ypos, 80, 80);
  }

  this.hit = function() {
    this.respawn();
    this.bullets = [];
  }

  this.respawn = function(){
    this.xpos = random(100, width);
    this.ypos = random(100, height);
  }
}

Player.prototype.velocity = 1;
Player.prototype.colorBank = ['blue', 'red', 'yellow', 'green', 'magenta', 'cyan', 'black', 'purple', 'orange', 'tan', 'brown', 'pink'];

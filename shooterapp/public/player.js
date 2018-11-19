function Player(xpos, ypos) {
  this.xpos = xpos;
  this.ypos = ypos;
  this.dead = false;
  this.color = Player.prototype.colorBank[Math.floor(Math.random() * Player.prototype.colorBank.length)];

  this.bullets = [];

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

}

Player.prototype.velocity = 1;
Player.prototype.colorBank = ['blue', 'red', 'yellow', 'green', 'magenta', 'cyan', 'black', 'purple', 'orange', 'tan', 'brown', 'pink'];

function Player(xpos, ypos) {
  //generates new player randomly on screen
  this.ypos = ypos; 
  this.xpos = xpos; 
  this.dead = false; 
  this.size = 80;
  this.score = 0;
  this.lives = 5;
  this.color = Player.prototype.colorBank[Math.floor(Math.random() * Player.prototype.colorBank.length)];
  this.bullets = [];

  this.update = function() {
    // player movement logic
    //player can move either with left right up down, or w a s d
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      this.xpos -= 10;
      // return true;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      this.xpos += 10;
      // return true;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
      this.ypos += 10;
      // return true;
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
      this.ypos -= 10;
      // return true;
    }

    // ----------------------

    // for every bullet that is associated with the player
    // update the position of the bullet by the speed that is set in bullet.js
    // we are linking the bullet position and the player so that we can just update
    // the player in the global server, and the bullet position will also update
    for (let i = 0; i < this.bullets.length; i++) {
      this.bullets[i].update();
    }


    //player's movement will wrap across the screen
    // ie. if the player leaves top of screen, player will appear at bottom etc
    if (this.xpos < 0){
        this.xpos = width;
      }
    if (this.xpos > width){
        this.xpos = 0;
      }
    if (this.ypos > height){
        this.ypos = 0;
      }
    if (this.ypos < 0){
        this.ypos = height;
      }
  };

  this.display = function() {
    stroke(this.color);
    ellipse(this.xpos, this.ypos, this.size, this.size);

    for (let i = 0; i < this.bullets.length; i++) {
      this.bullets[i].display();
    }
  }

  this.hit = function() {
    this.dead = true;
    this.respawn();
    this.bullets = [];
  }

  this.respawn = function(){
    this.dead = false;
    this.xpos = random(100, width);
    this.ypos = random(100, height);
  }


}

Player.prototype.velocity = 1;
Player.prototype.colorBank = ['blue', 'red', 'yellow', 'green', 'magenta', 'cyan', 'white', 'purple', 'orange', 'tan', 'brown', 'pink'];

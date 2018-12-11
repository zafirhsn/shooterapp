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
  this.xMovementSpeed = 0;
  this.yMovementSpeed = 0;

  this.update = function() {
    // player movement logic

    //every frame, always add xSpeed to xpos and ySpeed to yPos
    this.xpos = this.xpos + this.xMovementSpeed;
    this.ypos = this.ypos + this.yMovementSpeed;


    //player can move either with left right up down, or w a s d
    if(keyIsPressed){
      if (keyCode == LEFT_ARROW || key == 'a'){
        this.xMovementSpeed = -10;
      };

      if (keyCode == RIGHT_ARROW || key == 'd'){
        this.xMovementSpeed = 10;
      };

      if (keyCode == UP_ARROW || key == 'w'){
        this.yMovementSpeed = -10;
      };

      if (keyCode == DOWN_ARROW || key == 's'){
        this.yMovementSpeed = 10;
      };
    } else {
      //add friction variable to slow down player if keyReleased
      let deceleration = 0.8;
      this.xMovementSpeed *= deceleration;
      this.yMovementSpeed *= deceleration;

      //if speed is almost 0, set to 0 (so doesn't go to infinity)
      if (this.xMovementSpeed < 0.0001 && this.xMovementSpeed > -0.0001){
        this.xMovementSpeed = 0;
      }
      if (this.yMovementSpeed < 0.0001 && this.yMovementSpeed > -0.0001){
        this.yMovementSpeed = 0;
      }
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
}

Player.prototype.velocity = 1;
Player.prototype.colorBank = ['blue', 'red', 'yellow', 'green', 'magenta', 'cyan', 'white', 'purple', 'orange', 'tan', 'brown', 'pink'];

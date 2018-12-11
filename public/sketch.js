let socket;
let SOCKET_ID; 
let playerArray = {};
let PLAYER_INDEX;
let readyFlag = false;
let gotHit;
let shoot;
function setup() {
  //create canvas of 1000 x 700px
  createCanvas(1000, 700);
  // const dbURL = '../database.json'
  // data = loadJSON(dbURL, drawEllipse);


  //sound
  gotHit = loadSound("audio/hit.wav");
  shoot = loadSound("audio/laser.wav");

  let serverLocation = "http://localhost:3000" || window.location.hostname
  socket = io.connect(serverLocation); 
  // Once server acknowledges, create new player instance

  // Server gives us list of all players already playing on join, we will use this to create new client's own player, and to catch the client up on all players already on server
  socket.on('newUser', createPlayer);

  //When new player joins, we're going to add them to playerArray 
  socket.on('addPlayer', addPlayer);
  
  //When another client exits, the server tells us to remove their data so we don't update them or draw them 
  socket.on('removePlayer', removePlayer);

  // When another player clicks, a bullet is created and sent to the server, the server then tells everyone else that the player added a bullet
  socket.on('addBullet', addBullet);

  // When server tells us a player has deleted a bullet that has gone out of bounds or hit another player
  socket.on('deleteBullet', deleteBullet);

  // When server tells us someone has lost a lifeby being hit by a bullet
  socket.on('lostLife', lostLife);

  // When a player gets a point, update their score
  socket.on('point', increasePoint);

}

function increasePoint(userid) {
  playerArray[userid].score++;
}

// Decrease life of user that's been hit, check if this client is the killer
function lostLife(userid, killerid, bulletIndex) {
  playerArray[userid].lives--;
  playerArray[userid].size -= 15;

  // If this client's bullet killed the player, tell the server to delete that bullet
  if (killerid == SOCKET_ID) {
    console.log("I KILLED A PLAYER");
    playerArray[SOCKET_ID].bullets.splice(bulletIndex, 1);
    playerArray[SOCKET_ID].score++;
    console.log("SCORE: " + playerArray[SOCKET_ID].score);
    socket.emit('point', {});
    socket.emit('deleteBullet', bulletIndex);
  }
}

// Delete bullet thats gone off screen or hit a player
function deleteBullet(userid, bulletIndex) {
  playerArray[userid].bullets.splice(bulletIndex, 1);
}

// Add the bullet, to the appropriate user, that was sent to us by the server
function addBullet(bullet, userid) {
  console.log("BULLET IS ADDED");
  playerArray[userid].bullets.push(new Bullet(bullet.xpos, bullet.ypos, bullet.color, bullet.dirX, bullet.dirY));
}

// Remove a player by their socket id when they leave the server
function removePlayer(userid) {
  delete playerArray[userid];

  console.log("REMOVED PLAYER: " +  userid);
  console.log("Success if following line is 'undefined' ");
  console.log(playerArray[userid]);
  console.log("Current number of players: " + Object.keys(playerArray).length);

}

// Create new player that just joined server, and add all their bullets
function addPlayer(user, userid) {
  playerArray[userid] = new Player(user.xpos, user.ypos);
  playerArray[userid].color = user.color;

  for (let i = 0; i < user.bullets.length; i++) {
    let bulletx = user.bullets[i].xpos;
    let bullety = user.bullets[i].ypos;
    let bulletColor = user.bullets[i].color;
    let bulletdirX = user.bullets[i].dirX;
    let bulletdirY = user.bullets[i].dirY;
    playerArray[userid].bullets.push(new Bullet(bulletx, bullety, bulletColor, bulletdirX, bulletdirY));

  }
  console.log("ADDED PLAYER");
}

// Create client's own player on join and catch them up on all other players and their bullets
function createPlayer(data) {
  // This is the client's own socket.id, used to access their own data
  SOCKET_ID = socket.id;
  console.log('SERVER SENT ACK, CREATING PLAYER');

  // Loop through existing players and create their objects on client side, including bullets
  for (var key in data.playerArray) {
    if (data.playerArray.hasOwnProperty(key)) {
      playerArray[key] = new Player(data.playerArray[key].xpos, data.playerArray[key].ypos);
      playerArray[key].color = data.playerArray[key].color;
      playerArray[key].lives = data.playerArray[key].lives;
      playerArray[key].size = data.playerArray[key].size;
      playerArray[key].score = data.playerArray[key].score;

      for (let i = 0; i < data.playerArray[key].bullets.length; i++) {
        let bulletx = data.playerArray[key].bullets[i].xpos;
        let bullety = data.playerArray[key].bullets[i].ypos; 
        let bulletColor = data.playerArray[key].bullets[i].color;
        let bulletdirX = data.playerArray[key].bullets[i].dirX;
        let bulletdirY = data.playerArray[key].bullets[i].dirY;
        playerArray[key].bullets.push(new Bullet(bulletx, bullety, bulletColor, bulletdirX, bulletdirY));
      }

      console.log('IN FOR LOOP CREATING PLAYERS');
      console.log(playerArray[key]);
    }
  }

  console.log("CURRENT NUMBER OF PLAYERS: " + Object.keys(playerArray).length);

  // Creating client's own new player
  playerArray[SOCKET_ID] = new Player(random(300, width), random(300, height));

  // Send server client's own player object, so server can add to array and tell all other clients that a a new player has joined
  console.log('SENDING NEW USER TO SERVER');
  socket.emit('newUser', playerArray[SOCKET_ID]);
  readyFlag = true;
}


// Listen to server to update other players movements
// Send client's own movements to server to be broadcast
// Check for all bullet collisions
function update() {
  socket.on('updatePlayer', (data, userid)=> {
    playerArray[userid].xpos = data.xpos;
    playerArray[userid].ypos = data.ypos;

    for (let i = 0; i < data.bullets.length; i++) {
      let bulletx = data.bullets[i].xpos;
      let bullety = data.bullets[i].ypos;

      playerArray[userid].bullets[i].xpos = bulletx;
      playerArray[userid].bullets[i].ypos = bullety;
    }

  });

  playerArray[SOCKET_ID].update();
  socket.emit('updatePlayer', playerArray[SOCKET_ID]);

  // Check to see if any of client's own bullets have gone off the screen
  for (let i = 0; i < playerArray[SOCKET_ID].bullets.length; i++) {
    if (!inBound(playerArray[SOCKET_ID].bullets[i])) {
      playerArray[SOCKET_ID].bullets.splice(i, 1);
      socket.emit('deleteBullet', i);
    }
  }

  //player collision logic
  for(let key in playerArray){
    if (playerArray[key].color != playerArray[SOCKET_ID].color) {
      //check distance between self and every other player
      let d = dist(playerArray[SOCKET_ID].xpos, playerArray[SOCKET_ID].ypos, playerArray[key].xpos, playerArray[key].ypos)
      
      //if self and any other player are touching, reduce lives by 5 (instant death)
      if (d <= (playerArray[SOCKET_ID].size / 2) + (playerArray[key].size / 2)) {
        playerArray[SOCKET_ID].lives -= 5;
        playerArray[key].lives -= 5;
        console.log("PLAYERS COLLIDED");
        console.log(playerArray[SOCKET_ID].lives);
        amIDead();
        gotHit.play();
      }
      
      // Loop through every other client's bullets to see if they've hit this client. Upon collision, tell the server you've lost a life and give the server the socket.id of the player that killed you and the index of the bullet that hit you. Server will use this info to find the the client that killed the player
      for (let i = 0; i < playerArray[key].bullets.length; i++) { 
        if (collision(playerArray[key].bullets[i], playerArray[SOCKET_ID])) {
          playerArray[SOCKET_ID].lives--;
          playerArray[SOCKET_ID].size -= 15;
          console.log("Number of lives: " + playerArray[SOCKET_ID].lives);
          socket.emit('lostLife', key, i);
          amIDead();
          gotHit.play();
        }
      }
    }
  }
}


//death function
function amIDead() {
  if(playerArray[SOCKET_ID].lives <= 0){
    window.location.href = '/death/' + SOCKET_ID;
  }
}

// Update and display all entities
function draw() {
  clear();
  background(10);
  if (readyFlag) {
    update();

  }

  for (var key in playerArray) {
    if (key === SOCKET_ID) {
      strokeWeight(5);
      fill(playerArray[SOCKET_ID].color)
    }
    else {
      strokeWeight(2);
      noFill();
    }
    playerArray[key].display();
  }

  displayScore();

}

function displayScore() {
  textSize(20);
  noStroke();

  
  var sortedScores = [];
  for (var key in playerArray) {
    sortedScores.push([key, playerArray[key].score]);
  }
  sortedScores.sort((a,b)=> {
    return b[1] - a[1];
  });

  let space = 0;
  for (var i = 0; i < sortedScores.length; i++) {
    let key = sortedScores[i][0];

    fill(playerArray[key].color);

    text(playerArray[key].color.toUpperCase() + ': ' + playerArray[key].score, 800, 50+space);
    space += 25;
  }
}

// Bullet + player collision logic
function collision(otherBullet, player) {
  let d = dist(otherBullet.xpos, otherBullet.ypos, player.xpos, player.ypos);
  return (d <= (player.size / 2) + (otherBullet.size / 2));
}

// Bullet bounds logic
function inBound(bullet) {
  if (bullet.xpos > width || bullet.xpos < 0) {
    return false;
  }
  else if (bullet.ypos > height || bullet.ypos < 0) {
    return false;
  }
  else {
    return true;
  }
}

// Bullet firing logic
// When left mouse is clickd, create a new bullet, add it to the playerArray and send that bullet to the server so server can tell all the other clients that a new bullet is on the screen
function mouseClicked() {
  shoot.play();
  let direction = createVector(mouseX - playerArray[SOCKET_ID].xpos, mouseY - playerArray[SOCKET_ID].ypos);
  direction.normalize();
  let bullSpeed = 20;
  let bullet = new Bullet(playerArray[SOCKET_ID].xpos, playerArray[SOCKET_ID].ypos, playerArray[SOCKET_ID].color, direction.x * bullSpeed, direction.y * bullSpeed);
  playerArray[SOCKET_ID].bullets.push(bullet);

  console.log("BULLET FIRED: " + bullet);
  console.log("BULLET COUNT: " + playerArray[SOCKET_ID].bullets.length);


  socket.emit('addBullet', bullet);

}

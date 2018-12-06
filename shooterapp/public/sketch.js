let socket;
let SOCKET_ID; 
let playerArray = {};
let PLAYER_INDEX;
let readyFlag = false;

function setup() {
  //create canvas of 1000 x 700px
  createCanvas(1000, 700);
  // const dbURL = '../database.json'
  // data = loadJSON(dbURL, drawEllipse);

  socket = io.connect('http://localhost:3000'); 
  // Once server acknowledges, create new player instance

  // Our client socket id used to keep track of all players playing, entering, and leaving
  // SOCKET_ID = socket.id;

  // Server gives us list of all players already playing on join, we will use this to create new client's own player, and to catch the client up on all players already on server
  socket.on('newUser', createPlayer);

  //When new player joins, we're going to add them to playerArray 
  socket.on('addedPlayer', addPlayer);
  
  //When another client exits, the server tells us to remove their data so we don't update them or draw them 
  socket.on('exitPlayer', removePlayer);

  // When another player clicks, a bullet is created and sent to the server, the server then tells us that the player added a bullet. 
  socket.on('addBullet', addBullet);

  // When server tells us a player has deleted a bullet
  socket.on('deleteBullet', deleteBullet);

  // When server tells us someone has lost a life
  socket.on('lostLife', lostLife);

}

// Decrease life of user that's been hit;
function lostLife(userid, killerid, bulletIndex) {
  playerArray[userid].lives--;
  playerArray[userid].size -= 15;

  if (killerid == SOCKET_ID) {
    console.log("I KILLED A PLAYER");
    playerArray[SOCKET_ID].bullets.splice(bulletIndex, 1);
    socket.emit('deleteBullet', bulletIndex);
  }
}

// Delete bullet thats gone off screen or hit a player
function deleteBullet(userid, bulletIndex) {
  playerArray[userid].bullets.splice(bulletIndex, 1);
}

// Add the bullet that was sent to us by the server
function addBullet(bullet, userid) {
  console.log("BULLET IS ADDED");
  playerArray[userid].bullets.push(new Bullet(bullet.xpos, bullet.ypos, bullet.color, bullet.dirX, bullet.dirY));
}

// Remove a player by their socket id
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

// Create client's own player on join
function createPlayer(data) {
  SOCKET_ID = socket.id;
  console.log('SERVER SENT ACK, CREATING PLAYER');
  // console.log(data.playerArray);

  // Catching up new user on all existing players and their bullets
  for (var key in data.playerArray) {
    if (data.playerArray.hasOwnProperty(key)) {
      playerArray[key] = new Player(data.playerArray[key].xpos, data.playerArray[key].ypos);
      playerArray[key].color = data.playerArray[key].color;

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

  // Creating new player 
  playerArray[SOCKET_ID] = new Player(random(300, width), random(300, height));

  console.log('SENDING NEW USER TO SERVER');
  socket.emit('newUser', playerArray[SOCKET_ID]);
  readyFlag = true;
}


// Listen to server to update other players movements
// Send client's own movements to server to be broadcast
function update() {
  socket.on('updatePlayers', (data, userid)=> {
    playerArray[userid].xpos = data.xpos;
    playerArray[userid].ypos = data.ypos;

    for (let i = 0; i < data.bullets.length; i++) {
      let bulletx = data.bullets[i].xpos;
      let bullety = data.bullets[i].ypos;

      playerArray[userid].bullets[i].xpos = bulletx;
      playerArray[userid].bullets[i].ypos = bullety;
    }

  });
  // console.log(playerArray[0]);
  playerArray[SOCKET_ID].update();
  socket.emit('updateMyPlayer', playerArray[SOCKET_ID]);

  // Check to see if any of client's own bullets have gone off the screen
  for (let i = 0; i < playerArray[SOCKET_ID].bullets.length; i++) {
    if (!inBound(playerArray[SOCKET_ID].bullets[i])) {
      playerArray[SOCKET_ID].bullets.splice(i, 1);
      socket.emit('deleteBullet', i);
    }
  }

  // Player + bullet collision logic

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
      }
      
      for (let i = 0; i < playerArray[key].bullets.length; i++) { 
        if (collision(playerArray[key].bullets[i], playerArray[SOCKET_ID])) {
          playerArray[SOCKET_ID].lives--;
          playerArray[SOCKET_ID].size -= 15;
          console.log("Number of lives: " + playerArray[SOCKET_ID].lives);
          socket.emit('lostLife', key, i);
        }
      }
    }

  }
  
}

function draw() {
  clear();
  background(10);
  if (readyFlag) {
    update();

  }

  for (var key in playerArray) {
    playerArray[key].display();
  }

}

function collision(otherBullet, player) {
  let d = dist(otherBullet.xpos, otherBullet.ypos, player.xpos, player.ypos);
  return (d <= (player.size / 2) + (otherBullet.size / 2));
}

function inBound(bullet) {
  if (bullet.xpos > (width - 100) || bullet.xpos < 100) {
    return false;
  }
  else if (bullet.ypos > (height - 100) || bullet.ypos < 100) {
    return false;
  }
  else {
    return true;
  }
}


function mouseClicked() {
  let direction = createVector(mouseX - playerArray[SOCKET_ID].xpos, mouseY - playerArray[SOCKET_ID].ypos);
  direction.normalize();
  let bullSpeed = 20;
  let bullet = new Bullet(playerArray[SOCKET_ID].xpos, playerArray[SOCKET_ID].ypos, playerArray[SOCKET_ID].color, direction.x * bullSpeed, direction.y * bullSpeed);
  playerArray[SOCKET_ID].bullets.push(bullet);

  console.log("BULLET FIRED: " + bullet);
  console.log("BULLET COUNT: " + playerArray[SOCKET_ID].bullets.length);


  socket.emit('createBullet', bullet);

}

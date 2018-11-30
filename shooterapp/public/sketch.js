var socket;
var SOCKET_ID; 
var playerArray = {};
var PLAYER_INDEX;
var readyFlag = false;

function setup() {
  //create canvas of 1000 x 600px
  createCanvas(1000, 600);
  // const dbURL = '../database.json'
  // data = loadJSON(dbURL, drawEllipse);

  socket = io.connect('http://localhost:3000'); 
  // Once server acknowledges, create new player instance

  // Our client socket id used to keep track of all players playing, entering, and leaving
  SOCKET_ID = socket.id;

  // Server gives us list of all players already playing on join, we will use this to create new client's own player, and to catch the client up on all players already on server
  socket.on('newUser', createPlayer);

  //When new player joins, we're going to add them to playerArray 
  socket.on('addedPlayer', addPlayer);
  
  //When another client exits, the server tells us to remove their data so we don't update them or draw them 
  socket.on('exitPlayer', removePlayer);

  // When another player clicks, a bullet is created and sent to the server, the server then tells us that the player added a bullet. 
  socket.on('addBullet', addBullet);

}

// Add the bullet that was sent to us by the server
function addBullet(bullet, userid) {
  console.log("BULLET IS ADDED");
  playerArray[userid].bullets.push(new Bullet(bullet.xpos, bullet.ypos, bullet.color));
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

    playerArray[userid].bullets.push(new Bullet(bulletx, bullety, bulletColor));

  }
  console.log("ADDED PLAYER");
}

// Create client's own player on join
function createPlayer(data) {
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

        playerArray[key].bullets.push(new Bullet(bulletx, bullety, bulletColor));
      }

      console.log('IN FOR LOOP CREATING PLAYERS');
      console.log(playerArray[key]);
    }
  }

  console.log("CURRENT NUMBER OF PLAYERS: " + Object.keys(playerArray).length);

  // Creating new player 
  playerArray[SOCKET_ID] = new Player(random(100, width), random(100, height));

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

}

function draw() {
  clear();
  background(50);
  if (readyFlag) {
    update();
  }

  for (var key in playerArray) {
    playerArray[key].display();
  }

}

function mouseClicked() {
  let bullet = new Bullet(playerArray[SOCKET_ID].xpos, playerArray[SOCKET_ID].ypos, playerArray[SOCKET_ID].color);
  playerArray[SOCKET_ID].bullets.push(bullet);
  console.log("BULLET FIRED: " + bullet);

  socket.emit('createBullet', bullet);

}

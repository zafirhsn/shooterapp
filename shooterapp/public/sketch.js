var socket;
var SOCKET_ID; 
var playerArray = {};
var bulletsArray =[];
var PLAYER_INDEX;
var readyFlag = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
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


}

function removePlayer(userid) {
  delete playerArray[userid];
  console.log("REMOVED PLAYER");
  console.log(playerArray[userid]);
  console.log(Object.keys(playerArray).length);
}

// Create new player that just joined server
function addPlayer(user, userid) {
  playerArray[userid] = new Player(user.xpos, user.ypos);
  playerArray[userid].color = user.color;
  console.log("ADDED PLAYER");
}

// Create client's own player on join
function createPlayer(data) {
  console.log('SERVER SENT ACK, CREATING PLAYER');
  console.log(data.playerArray);

  // Catching up new user on all existing players
  for (var key in data.playerArray) {
    if (data.playerArray.hasOwnProperty(key)) {
      playerArray[key] = new Player(data.playerArray[key].xpos, data.playerArray[key].ypos);
      playerArray[key].color = data.playerArray[key].color;
      console.log('in for loop ');
      console.log(playerArray[key]);
    }
    // playerArray.push(new Player(data.playerArray[i].xpos, data.playerArray[i].ypos));
    // playerArray[playerArray.length-1].color = data.playerArray[i].color;
  }

  PLAYER_INDEX = playerArray.length;

  console.log(Object.keys(playerArray).length);

  // Creating new player 
  playerArray[SOCKET_ID] = new Player(random(100, width), random(100, height));
  // console.log(playerArray[playerArray.length - 1]);
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
  });
  // console.log(playerArray[0]);
  playerArray[SOCKET_ID].update();
  socket.emit('updateMyPlayer', playerArray[SOCKET_ID]);


  socket.on('updateBullets', (data, index) =>{
    console.log("BULLETS: " + data)
    if(data != undefined){
    bulletsArray[index].xpos = data.xpos;
    bulletsArray[index].ypos = data.ypos;
    bulletsArray[index].color = data.color;
  }
  })
  for(let j = 0; j < bulletsArray.length; j++){
    bulletsArray[j].update();
    socket.emit('updateMyBullets', bulletsArray[j], j);
  } 
}

function draw() {
  clear();
  if (readyFlag) {
    update();
  }

  // NOTE: I have changed the player array data structure to be an object instead of an array in order to write the disconnect code. So instead of indicies, we will use keys now. 
  for (var key in playerArray) {
    if (playerArray[key] !== {}) { //display Players
      playerArray[key].display();
       if(bulletsArray.length > 0){ //Display bullets
        for(let j = 0; j < bulletsArray.length; j++){
          bulletsArray[j].display();
          for(var otherKey in playerArray) {
            if(bulletsArray[j].hits(playerArray[otherKey])){
              playerArray[otherKey].hit();
            }
          }
        }
      } 
    }
  }
}

function mouseCoor() {
  console.log('x: ' + mouseX + ', y: ' + mouseY)
}

//Make bullet where mouse is clicked
function mousePressed(){
    let bull = new Bullet(playerArray[SOCKET_ID].xpos, playerArray[SOCKET_ID].ypos, playerArray[SOCKET_ID].color)
    bulletsArray.push(bull);

    socket.emit('shoot-bullet', bull)

  };




// function drawEllipse(data) {
//   var numUsers = data.users;
//   console.log(data.users);
//   for (let i = 0; i < numUsers; i++) { 
//     ellipse(80+(i*100), 80, 80, 80);
//   }
// }
var socket;
var playerArray = [];
var PLAYER_INDEX;
var readyFlag = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // const dbURL = '../database.json'
  // data = loadJSON(dbURL, drawEllipse);

  socket = io.connect('http://localhost:3000'); 
  // Once server acknowledges, create new player instance
  socket.on('newUser', createPlayer);

  //When new player joins, we're going to add them to playerArray 
  socket.on('addedPlayer', addPlayer);
  
  //When another client exits, the server tells us to remove their data so we don't update them or draw them 
  socket.on('exitPlayer', removePlayer);

}

function removePlayer(user) {
  playerArray[user.exitIndex] = {};
}

// Create new player that just joined server
function addPlayer(user) {
  playerArray.push(new Player(user.xpos, user.ypos));
  playerArray[playerArray.length-1].color = user.color;
  console.log("ADDED PLAYER");
}

// Create client's own player on join
function createPlayer(data) {
  console.log('SERVER SENT ACK, CREATING PLAYER');
  console.log(data.playerArray);

  // Catching up new user on all existing players
  for (let i = 0; i < data.playerArray.length; i++) {
    playerArray.push(new Player(data.playerArray[i].xpos, data.playerArray[i].ypos));
    playerArray[playerArray.length-1].color = data.playerArray[i].color;

    console.log('in for loop ' + i);
    console.log(playerArray[playerArray.length-1]);
  }
  PLAYER_INDEX = playerArray.length;

  console.log(playerArray.length);

  // Creating new player 
  playerArray.push(new Player(100,100));
  // console.log(playerArray[playerArray.length - 1]);
  console.log('SENDING NEW USER TO SERVER');
  socket.emit('newUser', playerArray[PLAYER_INDEX]);
  readyFlag = true;
}


// Listen to server to update other players movements
// Send client's own movements to server to be broadcast
function update() {
  socket.on('updatePlayers', (data, playerIndex)=> {
    playerArray[playerIndex].xpos = data.xpos;
    playerArray[playerIndex].ypos = data.ypos;  
  });
  // console.log(playerArray[0]);
  playerArray[PLAYER_INDEX].update();
  socket.emit('updateMyPlayer', playerArray[PLAYER_INDEX], PLAYER_INDEX);


}

function draw() {
  clear();
  if (readyFlag) {
    update();
  }

  for (let i = 0; i < playerArray.length; i++) {
    if (playerArray[i] !== {}) {
      playerArray[i].display();
    }
  }
}

function mouseCoor() {
  console.log('x: ' + mouseX + ', y: ' + mouseY);
}



// function drawEllipse(data) {
//   var numUsers = data.users;
//   console.log(data.users);
//   for (let i = 0; i < numUsers; i++) { 
//     ellipse(80+(i*100), 80, 80, 80);
//   }
// }
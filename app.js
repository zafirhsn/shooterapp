const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');

var port = 3000 || process.env.PORT;

app.use(express.static('public'));
app.set('view engine', 'ejs');

let exists = fs.existsSync('public/scores.json');
let scores;
if (exists) {
  console.log('Loading database of scores');
  var txt = fs.readFileSync('public/scores.json', 'utf-8');
  scores = JSON.parse(txt);
  console.log("Database of scores: "+ scores)
}

app.get('/', (req, res) => {
  res.render('index');
});


app.get('/death/:userid', (req, res) => {
  const data = req.params;
  res.render('death', { score: scores[data.userid] });
});

// Keep track of all players on server
var playerArray = {};

io.on('connection', (socket)=> {
  console.log('A USER CONNECTED');

  // Give new client an ack on join and give them array of existing players
  io.to(socket.id).emit('newUser', { playerArray: playerArray });

  // When the new client is caught up and gives back their own info, broadcast their info to all other players and save their info to player array
  socket.on('newUser', (user)=> {
    let userid = socket.id;
    playerArray[userid] = user;
    scores[userid] = playerArray[userid].score;
    // console.log(playerArray[userid]);
    socket.broadcast.emit('addPlayer', user, userid);
    console.log("CURRENT NUMBER OF PLAYERS: " + Object.keys(playerArray).length);
  })

  // When update given from a client, broadcast to every other client
  socket.on('updatePlayer', (data)=> {
    let userid = socket.id;
    playerArray[userid].xpos = data.xpos;
    playerArray[userid].ypos = data.ypos;

    for (let i = 0; i < data.bullets.length; i++) {
      let bulletx = data.bullets[i].xpos;
      let bullety = data.bullets[i].ypos;

      playerArray[userid].bullets[i].xpos = bulletx;
      playerArray[userid].bullets[i].ypos = bullety;

    }

    socket.broadcast.emit('updatePlayer', playerArray[userid], userid);
  });


  // Whenever left mouse is clicked on client, send bullet to server, server sends new bullet to every other client and updates playerArray
  socket.on('addBullet', (bullet)=> {

    let userid = socket.id;
    playerArray[userid].bullets.push(bullet);

    console.log("IN CREATEBULLET");

    socket.broadcast.emit('addBullet', bullet, userid);

  });

  socket.on('point', (data)=> {
    let userid = socket.id;
    playerArray[userid].score++;
    scores[userid] = playerArray[userid].score;
    console.log("SCORES UPDATED!")
    
    socket.broadcast.emit('point', userid);
  });

  // When a bullet is deleted off the screen, tell all other clients
  socket.on('deleteBullet', (bulletIndex)=> {
    let userid = socket.id;
    playerArray[userid].bullets.splice(bulletIndex, 1);
    console.log("IN DELETE BULLET");
    socket.broadcast.emit('deleteBullet', userid, bulletIndex);
  });

  // When a client says they've lost a life, tell all the other clients that that client lst a life and send them the socket.id and bullet index of the killer so the clients can see if their bullet is the one that killed the client. 
  socket.on('lostLife', (killerid, bulletIndex)=> {
    let userid = socket.id;
    playerArray[userid].lives--;
    playerArray[userid].size -= 15;
    socket.broadcast.emit('lostLife', userid, killerid, bulletIndex);

    if (playerArray[userid].lives <= 0) {

    }
  });

  // When a client disconnects, remove their data from player array and broadcast change to all other clients
  socket.on('disconnect', ()=> {
    let userid = socket.id;
    delete playerArray[userid];
    socket.broadcast.emit('removePlayer', userid);
    console.log('REMOVED PLAYER: ' + userid);
    console.log('CURRENT NUMBER OF PLAYERS: ' + Object.keys(playerArray).length);
  });

  socket.on('iDied', () => {
    let userid = socket.id;
    console.log("GAME OVER");

    renderDeath(userid);

  });
});


http.listen(port, ()=> {
  console.log("App is listening on http://localhost:" + port + '...');
});


// render ejs -> client socket sends data on event -> server socket recieves data -> server socket broadcasts data -> client socket recieves data -> client draws new stuff with data 
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');

app.use(express.static('public'));
app.set('view engine', 'ejs');

// var exists = fs.existsSync('public/database.json');
// var data;
// if (exists) {
//   console.log('Loading database');
//   var txt = fs.readFileSync('public/database.json', 'utf-8');
//   data = JSON.parse(txt);
// }

app.get('/', (req, res) => {
  res.render('index');
});

var playerArray = {};

io.on('connection', (socket)=> {
  console.log('A USER CONNECTED');

  // Give new client an ack on join and give them array of existing players
  io.to(socket.id).emit('newUser', { playerArray: playerArray });

  // When the new client is caught up and gives back their own info, broadcast their info to all other players and save their info to player array
  socket.on('newUser', (user)=> {
    let userid = socket.id;
    playerArray[userid] = user;
    // console.log(playerArray[userid]);
    socket.broadcast.emit('addedPlayer', user, userid);
    console.log("CURRENT NUMBER OF PLAYERS: " + Object.keys(playerArray).length);
  })

  // When update given from a client, broadcast to every other client
  socket.on('updateMyPlayer', (data)=> {
    let userid = socket.id;
    playerArray[userid].xpos = data.xpos;
    playerArray[userid].ypos = data.ypos;

    for (let i = 0; i < data.bullets.length; i++) {
      let bulletx = data.bullets[i].xpos;
      let bullety = data.bullets[i].ypos;

      playerArray[userid].bullets[i].xpos = bulletx;
      playerArray[userid].bullets[i].ypos = bullety;

    }

    socket.broadcast.emit('updatePlayers', playerArray[userid], userid);
  });


  // Whenever left mouse is clicked on client, send bullet to server, server sends new bullet to every other client
  socket.on('createBullet', (bullet)=> {

    let userid = socket.id;
    playerArray[userid].bullets.push(bullet);

    console.log("IN CREATEBULLET");

    socket.broadcast.emit('addBullet', bullet, userid);

  });

  // When a bullet is deleted off the screen, tell all other clients
  socket.on('deleteBullet', (bulletIndex)=> {
    let userid = socket.id;
    playerArray[userid].bullets.splice(bulletIndex, 1);
    console.log("IN DELETE BULLET");
    socket.broadcast.emit('deleteBullet', userid, bulletIndex);
  });

  
  socket.on('lostLife', (killerid, bulletIndex)=> {
    let userid = socket.id;
    playerArray[userid].lives--;
    playerArray[userid].size -= 15;
    socket.broadcast.emit('lostLife', userid, killerid, bulletIndex);
  });



  // When a client disconnects, remove their data from player array and broadcast change to all other clients
  socket.on('disconnect', ()=> {
    let userid = socket.id;
    delete playerArray[userid];
    socket.broadcast.emit('exitPlayer', userid);
    console.log('REMOVED PLAYER: ' + userid);
    console.log('CURRENT NUMBER OF PLAYERS: ' + Object.keys(playerArray).length);
  });

});


http.listen(3000, ()=> {
  console.log("App is listening on port 3000...");
});


// render ejs -> client socket sends data on event -> server socket recieves data -> server socket broadcasts data -> client socket recieves data -> client draws new stuff with data 
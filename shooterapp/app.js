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
  console.log('a user connected');

  // Give new client an ack on join and give them array of existing players
  io.to(socket.id).emit('newUser', { playerArray: playerArray });

  // When the new client is caught up and gives back their own info, broadcast their info to all other players and save their info to player array
  socket.on('newUser', (user)=> {
    let userid = socket.id;
    playerArray[userid] = user;
    console.log(Object.keys(playerArray).length);
    socket.broadcast.emit('addedPlayer', user, userid);
  })

  // When update given from a client, broadcast to every other client
  socket.on('updateMyPlayer', (data)=> {
    let userid = socket.id;
    playerArray[userid].xpos = data.xpos;
    playerArray[userid].ypos = data.ypos;

    socket.broadcast.emit('updatePlayers', playerArray[userid], userid);
  });

  // When a client disconnects, remove their data from player array and broadcast change to all other clients
  socket.on('disconnect', ()=> {
    let userid = socket.id;
    delete playerArray[userid];
    socket.broadcast.emit('exitPlayer', userid);
    console.log('A player has exited: ' + userid);
    console.log(Object.keys(playerArray).length);
    // console.log('User ' + playerIndex + ' has disconnected');
    // playerArray[playerIndex] = {};
    // socket.broadcast.emit('exitPlayer', { exitIndex: playerIndex } );
  });

});

  // console.log(socket.id);
  // data['users'] += 1;
  // let dataString = JSON.stringify(data);
  // fs.writeFile('public/database.JSON', dataString, ()=> {
  //   console.log(data['users']);
  // });

http.listen(3000, ()=> {
  console.log("App is listening on port 3000...");
});


// render ejs -> client socket sends data on event -> server socket recieves data -> server socket broadcasts data -> client socket recieves data -> client draws new stuff with data 
# shooterapp
Multiplayer online shooter game made using Node.js, Express, Socket.io, and p5.js

**Instructions to run app:**
1. Install the repo locally
2. Navigate through terminal to the local folder
3. Run "npm i" (assuming you have npm and nodejs already installed on your computer)
4. Run "node app"
5. Navigate to localhost:3000 on your browser
6. Use arrow keys to move your blob
7. Use mouse to point and mousePress to shoot and set your trap
8. Don't die, and try to win :)

----------------
**Next steps for development, in priority:**
1. Fix the sockets.io for bullets
2. Any bullets fired should be shown on all clients screens
3. Basic styling of the game (colors/backgrounds)
4. Fix the shooting mechanic in game (change from setting traps to shooting in a straight line)
5. Don’t LERP bullets position, make bullet update position linear until it hits another player or goes off the screen
6. Keeping track of players in a backend 
7. Think of a point system for the game
8. Every player you hit is +1 to your individual score
9. Implement a point system for the game (and display on screen)
9. Implement a respawn system
10. Allow players to play with a username for the leaderboard

----------------
**Requirements**
Any number of players can enter game
Each player is given a random username
Each player controls a sphere/square with left, right, up, down arrow keys
Each player can point and shoot using mouse and click
If a player gets hit with another player’s bullet, they die
Dead players are re-spawned in 3 seconds
When player A’s bullet hits player B’s, player A gets one point, and player B dies and is deleted off the screen
All players can see scores on dashboard at top right of screen
If player leaves the game, they are removed from server, and their square is erased


----------------
**Detailed Requirements**
On joining server, a player is created as an instance of the player class. The player is given a random color and username to differentiate from other players. The creation of this player is sent to server and then broadcast to all clients so all clients have same number of player objects
When a player uses the left, right, up, and down arrow keys, a function is called to update the coordinates of the object using a set velocity, the coordinates are sent through socket.io to the server, the new coordinates are broadcast to all clients and the canvas is redrawn and players are drawn at the new positions
When a player hovers with their mouse on the canvas, a line is drawn that points towards their mouseX and mouseY. This is not broadcast to all clients. (optional)
When a player clicks the left mouse button, a bullet is created and its position is updated on every frame to move towards the location of where the player clicked. The bullet position is updated according to its velocity and direction and broadcast to all clients.
When a player is hit by a bullet, their player object’s “dead” field is set to “true” which will disable the updating and drawing of that object for 3 seconds. This information is broadcast to all clients. 
When a player’s bullet hits another player, they receive +1 to their score which is reflected in the score dashboard at the top right of every client’s screen
When a player leaves the game, their socket id is broadcast to the server and all other clients so their player objects can be removed from the game


----------------
**Bonus:**
Chat box on side ?? 





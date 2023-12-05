const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Keep track of connected users
const users = new Set();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Add the user to the set of connected users
  users.add(socket.id);
  
  // Emit the updated user list to all clients
  io.emit('userList', Array.from(users));

  // Handle chat messages
  socket.on('chat message', (msg) => {
    io.emit('chat message', `${socket.id}: ${msg}`);
  });

  // Handle screen sharing
  socket.on('screen sharing', (stream) => {
    // Broadcast the screen sharing stream to all clients except the sender
    socket.broadcast.emit('screen sharing', stream);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove the user from the set of connected users
    users.delete(socket.id);

    // Emit the updated user list to all clients
    io.emit('userList', Array.from(users));
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const express = require('express');
const http = require('http');
const path = require('path');

const socketIO = require('socket.io');

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname,'/../public');

const app = express();

// all environments
app.use(express.static(publicPath));
 
var server = http.createServer(app);
var io = socketIO.listen(server);

io.on('connection', (socket) => {
  console.log('New user connected');
  socket.emit('userConnected', {});
});
 
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
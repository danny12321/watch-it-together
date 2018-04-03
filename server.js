const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 5500;

var queue = ['RDMMeM2kZnyUfWs'];

// app.use(express.static('public'));
app.use(express.static('./public/'));

http.listen(port, function () {
  console.log('listening on *:' + port);
});

io.on('connection', function (socket) {

  // New User
  socket.on('add-to-queue', function (url, callback) {
    var vidId = url.substr(url.length - 11);
    queue.push(vidId);
    updateQueue();

  });

  socket.on('pause', () => {
    io.sockets.emit('pause-vid');
  });

  socket.on('play', time => {
    console.log('play')
    io.sockets.emit('play-vid', time);
  })

  socket.on('next-song', () => {
    console.log(queue)
    if (queue[1]) queue.shift();
    console.log(queue)
    io.sockets.emit('play-song', queue[0]);
    updateQueue();

  });

  function updateQueue() {
    io.sockets.emit('update-queue', queue);
  }
});
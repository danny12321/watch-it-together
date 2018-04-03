const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 5500;

var queue = {};
var rooms = [];

// app.use(express.static('public'));
app.use(express.static('./public/'));

http.listen(port, function () {
  console.log('listening on *:' + port);
});

io.on('connection', function (socket) {

  // New User
  socket.on('join-room', room => {
    if (rooms.indexOf(room) < 0) {
      rooms.push(room);
      queue[room] = [];
    }
    socket.join(room);
    socket.emit('room-joined', room)
  });

  socket.on('getRooms', () => {
    socket.emit('sendRooms', rooms);
  });

  // PLAYER THINGY
  socket.on('add-to-queue', function (url, callback) {
    var vidId = url.substr(url.length - 11);
    queue[getRoom(socket)].push(vidId);
    updateQueue();
  });

  socket.on('pause', () => {
    io.to(getRoom(socket)).emit('pause-vid');
    // io.sockets.emit('pause-vid');
  });

  socket.on('play', time => {
    io.to(getRoom(socket)).emit('play-vid', time);

    // io.sockets.emit('play-vid', time);
  })

  socket.on('next-song', () => {
    if (queue[getRoom(socket)]&& queue[getRoom(socket)][1]) queue[getRoom(socket)].shift();
    io.to(getRoom(socket)).emit('play-song', queue[getRoom(socket)][0]);
    // io.sockets.emit('play-song', queue[0]);
    updateQueue();
  });


  function getRoom(socket) {
    var index = 0;
    let activeRoom;

    for (var room in socket.rooms) {
      if (index === 1) {
        activeRoom = room;
        return activeRoom;
      }
      index++;
    }
  }

  function updateQueue() {
    io.to(getRoom(socket)).emit('update-queue', queue[getRoom(socket)]);
    // io.sockets.emit('update-queue', queue);
  }
});
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 5500;

let queue = {};
let rooms = [];

// app.use(express.static('public'));
app.use(express.static('./public'));

http.listen(port, function () {
  console.log('listening on *:' + port);
});

io.on('connection', function (socket) {
  // TODO remove listener from rooms
  socket.on('disconnect', () => {
    console.log(socket.rooms)
  })


  socket.on('join-room', room => {
    if (!rooms.find(o => o.name === room)) {
      // if room doesnt exist add the room      
      rooms.push({ name: room, listeners: 1 });
      queue[room] = [];
    } else {
      // if room exist add a listener
      let index = rooms.findIndex(o => o.name === room);
      rooms[index].listeners += 1;
    }
    socket.join(room);
    socket.emit('room-joined', room)
    io.sockets.emit('sendRooms', rooms)
  });

  socket.on('getRooms', () => {
    socket.emit('sendRooms', rooms);
  });

  // PLAYER THINGY
  socket.on('add-to-queue', function (video_id, callback) {
    queue[getRoom(socket)].push(video_id);
    updateQueue();
  });

  socket.on('pause', () => {
    io.to(getRoom(socket)).emit('pause-vid');
    // io.sockets.emit('pause-vid');
  });

  socket.on('play', time => {
    console.log('time', time)
    let playTime = new Date().getTime() + 4000;
    
    io.to(getRoom(socket)).emit('play-vid', {vidTime: time, playTime});

    // io.sockets.emit('play-vid', time);
  })

  socket.on('next-song', () => {
    let activeRoom = getRoom(socket);
    if (!activeRoom) {
      socket.emit('room-doesnt-exist');
      return;
    }
    let time = new Date().getTime() + 4000;

    if (queue[getRoom(socket)] && queue[getRoom(socket)][1]) queue[getRoom(socket)].shift();
    io.to(getRoom(socket)).emit('play-song', { time, vidId: queue[getRoom(socket)][0] });
    // io.sockets.emit('play-song', queue[0]);
    updateQueue();
  });


  function getRoom(socket) {
    let index = 0;
    let activeRoom;

    for (let room in socket.rooms) {
      if (index === 1) {
        activeRoom = room;
        return activeRoom;
      }
      index++;
    }

    return false;
  }

  function updateQueue() {
    io.to(getRoom(socket)).emit('update-queue', queue[getRoom(socket)]);
    // io.sockets.emit('update-queue', queue);
  }
});
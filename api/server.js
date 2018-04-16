const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 5500;


let queue = {};
// {`roomName`: [{video_id: .., name: .., type: youtube || directUrl }, ]}

let rooms = [];
// [{name: as, listeners}]

app.use(express.static('./public'));

http.listen(port, function () {
  console.log('listening on *:' + port);
});

io.on('connection', function (socket) {
  socket.on('disconnecting', function(){
    socket.leave(getRoom(socket));
    
    let index = rooms.findIndex(o => o.name === getRoom(socket));
    console.log(queue)
    
    if (!rooms[index]) return;
    rooms[index].listeners -= 1;

    if (rooms[index].listeners === 0) rooms.splice(index, 1)
    io.sockets.emit('sendRooms', rooms)
    io.to(getRoom(socket)).emit('updateStatus', rooms[index]);
  });

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

    // To the socket
    socket.emit('room-joined', room)

    // To home screen
    io.sockets.emit('sendRooms', rooms)

    // To who are already in the room
    let index = rooms.findIndex(o => o.name === room);
    io.to(room).emit('updateStatus', rooms[index]);
  });

  socket.on('getRooms', () => {
    socket.emit('sendRooms', rooms);
  });

  // PLAYER THINGY
  socket.on('add-to-queue', function (video, callback) {
    queue[getRoom(socket)].push({ video_id: video.video_id, name: video.name, type: video.type });
    updateQueue();
  });

  socket.on('pause', () => {
    io.to(getRoom(socket)).emit('pause-vid');
    // io.sockets.emit('pause-vid');
  });

  socket.on('play', time => {
    let playTime = new Date().getTime() + 4000;

    io.to(getRoom(socket)).emit('play-vid', { vidTime: time, playTime });
  });

  socket.on('next-song', () => {
    let activeRoom = getRoom(socket);
    if (!activeRoom) {
      socket.emit('room-doesnt-exist');
      return;
    }
    let time = new Date().getTime() + 4000;

    if (queue[getRoom(socket)] && queue[getRoom(socket)][1]) queue[getRoom(socket)].shift();
    io.to(getRoom(socket)).emit('play-song', { time, vid: queue[getRoom(socket)][0] });
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
  }
});
socket.on('join-room', data => {
  let room = data.room
  if (!rooms.find(o => o.name === room)) {
    socket.emit('errorMessage', { message: 'De room die je probeert te joinen bestaat niet.' });
    return;
  } else {
    // if room exist add a listener
    let index = rooms.findIndex(o => o.name === room);
    if (rooms[index].private && rooms[index].private !== data.token) {
      socket.emit('errorMessage', { message: 'De url klopt niet voor het joinen van deze server.' });
      return;
    }
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

socket.on('make-room', data => {
  let room = data.room;
  let private = data.private ? randomString() : false;
  if (!rooms.find(o => o.name === room)) {
    // if room doesnt exist add the room  
    rooms.push({ name: room, listeners: 1, private });
    queue[room] = [];

    socket.join(room);
    socket.emit('room-joined', room);
    io.sockets.emit('sendRooms', rooms);
    // To who are already in the room
    let index = rooms.findIndex(o => o.name === room);
    socket.emit('updateStatus', rooms[index]);

  } else {
    // message that room exist
    socket.emit('errorMessage', { message: 'Deze room bestaat al.' });
  }
});

socket.on('getRooms', () => {
  socket.emit('sendRooms', rooms);
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

function randomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 15; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
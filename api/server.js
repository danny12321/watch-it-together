const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 5500;
const fs = require('fs');

let queue = {};
// {`roomName`: [{video_id: .., name: .., type: youtube || directUrl }, ]}

let rooms = [];
// [{name: as, listeners}]

app.use(express.static('./public'));

io.on('connection', function (socket) {
  socket.on('disconnecting', function () {
    socket.leave(getRoom(socket));

    let index = rooms.findIndex(o => o.name === getRoom(socket));

    if (!rooms[index]) return;
    rooms[index].listeners -= 1;

    if (rooms[index].listeners === 0) rooms.splice(index, 1)
    io.sockets.emit('sendRooms', rooms)
    io.to(getRoom(socket)).emit('updateStatus', rooms[index]);
  });

  eval(fs.readFileSync('rooms.js') + '');
  eval(fs.readFileSync('inPlayer.js') + '');
});

http.listen(port, function () {
  console.log('listening on *:' + port);
});
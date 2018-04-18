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
    socket.emit(error, { message: 'De room bestaat niet meer. Dit komt waarschijnlijk doordat de server is herstart.' });
    return;
  }
  let time = new Date().getTime() + 4000;

  if (queue[getRoom(socket)] && queue[getRoom(socket)][1]) queue[getRoom(socket)].shift();
  io.to(getRoom(socket)).emit('play-song', { time, vid: queue[getRoom(socket)][0] });
  updateQueue();
});
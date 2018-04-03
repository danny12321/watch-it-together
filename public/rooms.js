socket.emit('getRooms');

function joinRoom() {
  let room = document.getElementById('room').value;
  console.log('join', room)
  socket.emit('join-room', room)
}

socket.on('room-joined', room => {
  document.getElementById('roomJoined').innerHTML = room + ' Joined!';
  document.getElementById('roomMenu').style.display = 'none';
  document.getElementById('videoContainer').style.display = 'block';
});


socket.on('sendRooms', rooms => {
  var myNode = document.getElementById("rooms");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }

  rooms.forEach(room => {
    console.log(room)
    var node = document.createElement("LI");
    var textnode = document.createTextNode(room);
    node.appendChild(textnode);
    document.getElementById("rooms").appendChild(node);
  });
});

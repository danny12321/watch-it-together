let seekTo = false;
var player;

function addSong() {
  var url = document.getElementById('url');
  if (url.value === '' || url.value.lenght  < 11) return;
  socket.emit('add-to-queue', url.value);
  url.value = '';
}

socket.on('play-song', function (vidId) {
  console.log(vidId)
  player.loadVideoById(vidId);
});

socket.on('pause-vid', function () {
  player.pauseVideo();
});

socket.on('play-vid', function (time) {
  seekTo = true;
  player.playVideo();
  player.seekTo(time);
});

function nextSong() {
  document.getElementById('vidTitle').innerHTML = '';
  document.getElementById('vidAuthor').innerHTML = '';
  socket.emit('next-song');
}

// create youtube player
function onYouTubePlayerAPIReady() {
  player = new YT.Player('player', {
    width: '640',
    height: '390',
    videoId: '',
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

// autoplay video
function onPlayerReady(event) {
  event.target.playVideo();
}

// when video ends
function onPlayerStateChange(event) {
  if (event.data === 0) {
    // ended
    socket.emit('next-song');
  } else if (event.data === 1) {
    // playing
    if (seekTo) {
      seekTo = false;
      return;
    }
    let vidInfo = player.getVideoData();
    document.getElementById('vidTitle').innerHTML = vidInfo.title;
    document.getElementById('vidAuthor').innerHTML = vidInfo.author;
    console.log(player)
    socket.emit('play', player.getCurrentTime());
  } else if (event.data === 2) {
    // paused
    socket.emit('pause');
  } else if (event.data === 3) {
    // buffering
    
  }

}

socket.on('update-queue', function (data) {
  var myNode = document.getElementById("queue");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }

  data.forEach(vid => {

    var node = document.createElement("LI");
    var textnode = document.createTextNode(vid);
    node.appendChild(textnode);
    document.getElementById("queue").appendChild(node);
  });
});
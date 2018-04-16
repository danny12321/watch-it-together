import React, { Component } from 'react';
import PropTypes from 'prop-types';

class directUrl extends Component {
  static propTypes = {
    startsong: PropTypes.func,
    playsong: PropTypes.func,
    pausesong: PropTypes.func,
    vidinfo: PropTypes.object,
    currentat: PropTypes.float,
    paused: PropTypes.boolean,
  }

  componentDidMount() {
    let player = document.getElementById('player');
    let { socket } = this.props;

    setTimeout(() => {
      player.play();
    }, 4000)

    player.onplaying = () => { socket.emit('play', player.currentTime); };

    player.timeupdate = () => { socket.emit('play', player.currentTime); };

    player.onpause = () => { socket.emit('pause'); };

    player.onended = () => { socket.emit('next-song'); };
  }

  componentDidUpdate(prevProps) {
    if (prevProps === this.props) return;
    let player = document.getElementById('player');

    if (this.props.vidinfo !== prevProps.vidinfo) {
      // Load new video
      setTimeout(() => { player = document.getElementById('player'); player.play(); }, 4000)
    }

    if (this.props.currentat !== prevProps.currentat) {
      // seekTo
      player.currentTime = this.props.currentat;
      player.play();
    }

    if (this.props.paused !== prevProps.paused && this.props.paused === true) {
      // Pause
      player.pause();
    }
  }

  render() {
    return (
      <video controls id="player" src={this.props.vidinfo.video_id}></video>
    );
  }
}

export default directUrl;
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import YouTubePlayer from 'youtube-player';

class youtube extends Component {
  static propTypes = {
    startsong: PropTypes.func,
    playsong: PropTypes.func,
    pausesong: PropTypes.func,
    vidinfo: PropTypes.object,
    currentat: PropTypes.float,
    paused: PropTypes.boolean,
  }

  constructor(props) {
    super(props);
    this.state = {
      player: null,
      seekTo: false
    }
  }

  componentDidMount() {
    this.state.player = YouTubePlayer('player', {
      videoId: this.props.vidinfo.video_id,
      playerVars: {
        // controls: 0,
        rel: 0,
        showinfo: 0
      }
    });

    this.state.player.on('stateChange', e => this.stateChange(e));

    setTimeout(() => {
      this.state.player.playVideo();
    }, 4000)
  }

  componentDidUpdate(prevProps) {
    if (prevProps === this.props) return;

    if (this.props.vidinfo !== prevProps.vidinfo) {
      // Load new video
      this.playVideo(this.props.vidinfo.video_id);
    }

    if (this.props.currentat !== prevProps.currentat) {
      // seekTo
      this.continueVid(this.props.currentat)
    }

    if (this.props.paused !== prevProps.paused && this.props.paused === true) {
      // Pause
      this.state.player.pauseVideo();
    }
  }

  stateChange(event) {
    let { seekTo } = this.state;
    let { socket } = this.props;
    if (event.data === 0) {
      // ended
      socket.emit('next-song');

    } else if (event.data === 1) {
      if (seekTo) {
        this.setState({ seekTo: false })
        return;
      }

      this.state.player.getCurrentTime().then(time => {
        socket.emit('play', time);
      })
    } else if (event.data === 2) {
      // paused
      socket.emit('pause');
    } else if (event.data === 3) {
      // buffering
    }
  }

  playVideo(video_id) {
    this.state.player.loadVideoById(video_id);
    setTimeout(() => {
      this.state.player.playVideo();
    }, 4000)
  }

  continueVid(vidTime) {
    this.setState({ seekTo: true });
    this.state.player.seekTo(vidTime);
    this.state.player.playVideo();
  }


  render() {
    return (
      <div id="player"></div>
    );
  }
}

export default youtube;
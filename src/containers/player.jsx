import React, { Component } from 'react';
import YouTubePlayer from 'youtube-player';
var YouTube = require('youtube-node');
var youTube = new YouTube();
youTube.setKey('AIzaSyBuFVdMqJlnX16uraP1kcovX0AbJzke2wM');

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player: null,
      vidInfo: {},
      wait: false,
      seekTo: false,
      alert: null,
      queue: [],
      searchResult: [],
      activeMenu: 'queue'
    }

    let { socket } = this.props;

    socket.on('play-song', data => {
      // stop the video at the event handeler and wait for others
      this.setState({ wait: true });

      this.state.player.loadVideoById(data.vidId);

      youTube.getById(data.vidId, (err, result) => {
        if (err) { console.log(err); return }
        if (!result.items[0]) return;
        this.setState({ vidInfo: result.items[0].snippet });
        document.title = result.items[0].snippet.title + ' - Watch It Together';
      });

      setTimeout(() => {
        this.setState({ wait: true });
        this.state.player.playVideo();
        this.setState({ wait: false });
      }, data.time - new Date().getTime())
    });

    socket.on('update-queue', queue => {
      // TODO 
      this.setState({ queue })
    });

    socket.on('pause-vid', () => {
      this.state.player.pauseVideo();
    });

    socket.on('play-vid', (data) => {
      this.setState({ seekTo: true });
      this.state.player.seekTo(data.vidTime);
      this.state.player.playVideo();
    });
  }

  componentDidMount() {
    this.state.player = YouTubePlayer('player', {
      playerVars: {
        // controls: 0,
        rel: 0,
        showinfo: 0
      }
    });

    this.state.player.on('stateChange', e => this.stateChange(e));
  }

  stateChange(event) {
    let { wait, seekTo } = this.state;
    let { socket } = this.props;
    if (event.data === 0) {
      // ended
      socket.emit('next-song');
    } else if (event.data === 1) {
      if (seekTo) {
        this.setState({ seekTo: false })
        return;
      }

      if (wait) {
        this.state.player.pauseVideo();
        return;
      }

      this.state.player.getCurrentTime().then(time => {
        socket.emit('play', time);
      })
    } else if (event.data === 2) {
      // paused
      if (wait) {
        return;
      }
      socket.emit('pause');
    } else if (event.data === 3) {
      // buffering
    }
  }

  search(e) {
    e.preventDefault();
    youTube.search(e.target.search.value, 10, (err, result) => {
      if (err) { console.log(err); return }
      this.setState({ searchResult: result.items })
    });
  }

  addSong(e) {
    let video_id;

    if (e.target) {
      e.preventDefault();

      video_id = e.target.url.value.split('v=')[1];
      let ampersandPosition = video_id.indexOf('&');
      if (ampersandPosition !== -1) {
        video_id = video_id.substring(0, ampersandPosition);
      }
      e.target.url.value = '';
    } else {
      video_id = e;
    }

    this.setState({ alert: { message: 'De video is toegevoegd!', color: 'green' } });
    setTimeout(() => { this.setState({ alert: null }) }, 3000);
    this.props.socket.emit('add-to-queue', video_id);
  }

  nextSong() {
    this.props.socket.emit('next-song');
  }

  render() {
    return (
      <div id="videoContainer" className="container wrapper">
        <div className="sidbar">
          <h2 id="vidTitle">{this.state.vidInfo.title || 'Selecteer een video!'}</h2>

          <div className="sidebar-menu">
            <div onClick={() => this.setState({ activeMenu: 'queue' })}>
              <i className="fas fa-bars"></i> Wachtlijst
            </div>
            <div onClick={() => this.setState({ activeMenu: 'search' })}>
              <i className="fas fa-search"></i> Zoek
            </div>
          </div>

          {this.renderMenu()}


          <div className="bottom">
            {/* <form onSubmit={this.addSong.bind(this)}>
              <input id="url" className="vidInput" type="text" placeholder="Youtube url" />
              <button className="addVideoButton" type="submit">Voeg toe</button>
            </form> */}
            <button className="nextSong rainbow" onClick={this.nextSong.bind(this)}><span>Volgende </span></button>
          </div>
        </div>
        <div id="player"></div>

        {/* Loadscreen */}
        {this.state.wait ? <div className="wait"><div className="waitSpinner"></div></div> : null}

        {/* Alert message */}
        {this.state.alert ? <div className="alert" onClick={() => this.setState({ alert: null })} style={{ background: this.state.alert.color }}>{this.state.alert.message}</div> : null}
      </div>
    );
  }

  renderMenu() {
    let { activeMenu } = this.state;

    if (activeMenu === 'queue') {
      return (
        <div>
          {this.state.queue ? this.state.queue.map(title => {
            return <p>- {title}</p>
          }) : <p>Voeg een video toe..</p>}
        </div>
      )
    } else if (activeMenu === 'search') {
      return (
        <div>
          <form onSubmit={this.search.bind(this)}>
            <input id="search" className="vidInput" placeholder="Zoek opdracht.." type="text" />
            <button className="addVideoButton" type="submit">Zoek!</button>
          </form>

          <div className="searchCards">
            {this.state.searchResult.map(el => {
              return (
                <div onClick={this.addSong.bind(this, el.id.videoId)} key={el.id.videoId} className="card">
                  <img className="imgCard" src={el.snippet.thumbnails.medium.url} alt={el.snippet.title} />
                  {el.snippet.title}
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }
}

export default Player;

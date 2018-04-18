import React, { Component } from 'react';
import Ytplayer from './players/youtube';
import DirectUrl from './players/directUrl';
import { CopyToClipboard } from 'react-copy-to-clipboard';

var YouTube = require('youtube-node');
var youTube = new YouTube();
youTube.setKey('AIzaSyBuFVdMqJlnX16uraP1kcovX0AbJzke2wM');

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player: null,
      socket: this.props.socket,
      vidInfo: {},
      currentRoom: null,
      currentAt: null,
      paused: false,
      wait: false,
      seekTo: false,
      alert: null,
      queue: [],
      searchResult: [],
      activeMenu: 'queue'
    }

    let { socket } = this.props;

    socket.on('play-song', data => {
      if (!data.vid) {
        this.setState({ alert: { message: 'Voeg eerst een video toe aan de wachtrij!', color: 'orange' } });
        return;
      }

      // stop the video at the event handeler and wait for others
      this.setState({ wait: true, vidInfo: data.vid, paused: true });

      setTimeout(() => {
        //   this.setState({ wait: true });
        this.setState({ wait: false, paused: false });
      }, 4000)
      // }, data.time - new Date().getTime())
    });

    socket.on('update-queue', queue => {
      this.setState({ queue })
    });

    socket.on('pause-vid', () => {
      this.setState({ paused: true })
      // this.state.player.pauseVideo();
    });

    socket.on('play-vid', (data) => {
      this.setState({ currentat: data.vidTime, paused: false });
      // this.setState({ seekTo: true });
      // this.state.player.seekTo(data.vidTime);
      // this.state.player.playVideo();
    });

    socket.on('updateStatus', (data) => {
      this.setState({ currentRoom: data })
    });
  }



  search(e) {
    e.preventDefault();
    youTube.search(e.target.search.value, 10, (err, result) => {
      if (err) { console.log(err); return }
      this.setState({ searchResult: result.items })
    });
  }

  addByUrl(form) {
    form.preventDefault();
    let url = form.target.url.value;
    this.setState({ alert: { message: 'De video is toegevoegd!', color: 'green' } });
    this.props.socket.emit('add-to-queue', { video_id: url, name: url, type: 'directUrl' });
  }

  addSong(video, type) {
    this.setState({ alert: { message: 'De video is toegevoegd!', color: 'green' } });
    this.props.socket.emit('add-to-queue', { video_id: video.id.videoId, name: video.snippet.title, type });
  }

  nextSong() {
    this.props.socket.emit('next-song');
  }

  render() {
    if (this.state.alert) {
      setTimeout(() => { this.setState({ alert: null }) }, 3000);
    }

    return (
      <div id="videoContainer" className="container wrapper">
        <div className="sidbar">
          <div id="vidTitle">
            <h2>{this.state.vidInfo.name || 'Selecteer een video!'}</h2>
            {this.state.currentRoom &&
              <span className="joinUrl">
                {/* <input type="text" value={`http://${window.location.hostname}:3000/join/${this.state.currentRoom.name}/${this.state.currentRoom.private}`} disabled /> */}
                <CopyToClipboard text={`http://${window.location.hostname}:3000/join/${this.state.currentRoom.name}${this.state.currentRoom.private ? '/' + this.state.currentRoom.private : ''}`}
                  onCopy={() => alert('coppied')}>
                  <span style={{cursor: 'pointer'}}><i className="fas fa-paste"></i> Kopieer naar klembord</span>
                </CopyToClipboard>
              </span>}
            <span className="userCount"><i className="fas fa-users"></i> {this.state.currentRoom ? this.state.currentRoom.listeners : '1'}</span>
          </div>
          <div className="sidebar-menu">
            <div onClick={() => this.setState({ activeMenu: 'queue' })}>
              <i className="fas fa-bars"></i> Wachtlijst
            </div>
            <div onClick={() => this.setState({ activeMenu: 'search' })}>
              <i className="fas fa-search"></i> Zoek
            </div>
            <div onClick={() => this.setState({ activeMenu: 'directUrl' })}>
              <i className="fas fa-link"></i> Url
            </div>
          </div>

          {this.renderMenu()}

          <div className="bottom">
            <button className="nextSong rainbow" onClick={this.nextSong.bind(this)}><span>Volgende </span></button>
          </div>
        </div>


        {this.state.vidInfo.type === 'youtube' &&
          <div style={{ overflow: 'hidden' }}>
            <Ytplayer
              socket={this.state.socket}
              vidinfo={this.state.vidInfo}
              currentat={this.state.currentat}
              paused={this.state.paused}
            /></div>}

        {this.state.vidInfo.type === 'directUrl' &&
          <div style={{ overflow: 'hidden' }}>
            <DirectUrl
              socket={this.state.socket}
              vidinfo={this.state.vidInfo}
              currentat={this.state.currentat}
              paused={this.state.paused}
            />
          </div>
        }

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
          {this.state.queue.length ? this.state.queue.map((vid, key) => {
            return <p key={key}>- {vid.name}</p>
          }) : <p style={{ textAlign: 'center' }}>Voeg een video toe..</p>}
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
                <div onClick={this.addSong.bind(this, el, 'youtube')} key={el.id.videoId} className="card">
                  <img className="imgCard" src={el.snippet.thumbnails.medium.url} alt={el.snippet.title} />
                  {el.snippet.title}
                </div>
              )
            })}
          </div>
        </div>
      )
    } else if (activeMenu === 'directUrl') {
      return (
        <div>
          <form onSubmit={this.addByUrl.bind(this)}>
            <input id="url" className="vidInput" placeholder="Plaats hier de url" type="text" />
            <button className="addVideoButton" type="submit">Voeg toe!</button>
          </form>
        </div>
      )
    }
  }
}

export default Player;
import React, { Component } from 'react';

import Home from './home';
import Player from './player';

const io = require('socket.io-client');

// for localtesting
const socket = io.connect(`http://localhost:5500`);

// for build
// const socket = io();

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      room: null,
      alert: null,
    }

    socket.on('errorMessage', error => {
      this.setState({ alert: { message: error.message, color: 'orange' } });
    })

    // Join a room via link
    let room = this.props.match.params.room;
    if (this.props.match.params.room) {
      socket.emit('join-room', {room, token: this.props.match.params.token})
    }
  }

  render() {
    if (this.state.room) {
      return (
        <div>
          <Player
            socket={socket}
            room={this.state.room}
            updateRoute={url => this.props.history.push(url)}
          />

          {/* Alert message */}
          {this.state.alert ? <div className="alert" onClick={() => this.setState({ alert: null })} style={{ background: this.state.alert.color }}>{this.state.alert.message}</div> : null}
        </div>
      )
    }
    else {
      return (
        <div>
          <Home
            socket={socket}
            setRoom={room => { this.setState({ room }) }}
            updateRoute={url => this.props.history.push(url)}
          />
          {/* Alert message */}
          {this.state.alert ? <div className="alert" onClick={() => this.setState({ alert: null })} style={{ background: this.state.alert.color }}>{this.state.alert.message}</div> : null}
        </div>
      )
    }
  }
}

export default Index;

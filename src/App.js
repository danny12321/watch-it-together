import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './styles/index.css';

import Home from './containers/home';
import Player from './containers/player';

const io = require('socket.io-client');

// for localtesting
// const socket = io.connect(`http://localhost:5500`);

// for build
const socket = io();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      room: null
    }

    socket.on('room-doesnt-exist', () => {
      alert('Deze room bestaat niet meer. Dit komt waarschijnlijk door dat de server is herstart.')      
      this.setState({room: null});
    })
  }

  renderHome() {
    return (
      <Home
        socket={socket}
        setRoom={room => { this.setState({ room }) }}
      />
    )
  }

  renderRoom() {
    return (
      <Player
        socket={socket}
        room={this.state.room}
      />
    )
  }

  render() {
    console.log()
    if (this.state.room) return this.renderRoom()
    else return this.renderHome()
  }
}

export default App;

import React, { Component } from 'react';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: []
    }

    let { socket } = this.props;

    socket.emit('getRooms');

    socket.on('sendRooms', rooms => {
      this.setState({ rooms })
    });

    socket.on('room-joined', room => {
      this.props.setRoom(room)
    });
  }

  joinRoom(e, r) {
    // e is from form
    // r is from button
    if (e) e.preventDefault();
    let room = e ? e.target.room.value : r;
    this.props.socket.emit('join-room', room)
  }

  render() {
    let { rooms } = this.state;

    return (
      <div id="roomMenu" className="container rainbow">
        <h2>Join een room</h2>
        Room:
        <form onSubmit={e => this.joinRoom(e)}>
          <input id="room" type="text" />
          <button>Join</button>
        </form>

        <table>
          <tbody>
            {rooms.map(room => {
              return (
                <tr key={room.name}>
                  <td>{room.name}</td>
                  <td>{room.listeners}</td>
                  <td><button onClick={() => this.joinRoom(null, room.name)}>Join</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>

      </div>
    );
  }
}

export default Home;

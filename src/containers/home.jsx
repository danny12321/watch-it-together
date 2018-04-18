import React, { Component } from 'react';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: [],
      wait: true,
      alert: null,
      search: null
    }

    let { socket } = this.props;

    socket.emit('getRooms');

    socket.on('sendRooms', rooms => {
      this.setState({ rooms, wait: false });
      this.setState({});
    });

    socket.on('room-joined', room => {
      this.props.setRoom(room)
      this.setState({ wait: false });
      this.props.updateRoute('/');
    });

    socket.on('room-exist', room => {
      this.setState({ wait: false, alert: { message: 'Deze room bestaat al..', color: 'orange' } });
    });
  }

  joinRoom(room) {
    // e is from form
    // r is from button
    this.setState({ wait: true });
    this.props.socket.emit('join-room', { room })
  }

  makeRoom(e) {
    this.setState({ wait: true });
    e.preventDefault();
    this.props.socket.emit('make-room', { room: e.target.room.value, private: e.target.private.checked })
  }

  render() {
    let { rooms } = this.state;

    return (
      <div id="roomMenu" className="container rainbow">
        <h2>Maak een room</h2>
        <form onSubmit={e => this.makeRoom(e)}>
          <input name="room" type="text" />
          <input type="checkbox" name="private" />
          <button type="submit">Maak</button>
        </form>

        <hr />
        Zoek: <input onChange={e => {
          this.setState({ search: e.target.value, alert: null });
        }} type="text" />

        <table>
          <tbody>
            {rooms.map(room => {
              if (this.state.search) {
                try {
                  if (room.name.search(this.state.search) < 0) return
                } catch (error) {
                  console.log('error!!')
                  if (!this.state.alert) this.setState({ alert: { message: 'Er zit een fout in je zoek opdracht.', color: 'red' } })
                  return;
                }
              }
              return (
                <tr key={room.name}>
                  <td>{room.name}</td>
                  <td>{room.listeners}</td>
                  <td>
                    {room.private ?
                      <i className="fas fa-lock"></i> :
                      <button onClick={() => this.joinRoom(room.name)}>Join</button>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Loadscreen */}
        {this.state.wait ? <div className="wait"><div className="waitSpinner"></div></div> : null}

        {/* Alert message */}
        {this.state.alert ? <div className="alert" onClick={() => this.setState({ alert: null })} style={{ background: this.state.alert.color }}>{this.state.alert.message}</div> : null}

      </div>
    );
  }
}

export default Home;

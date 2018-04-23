import React, { Component } from 'react';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: [],
      wait: true,
      alert: null,
      search: null,
      type: 'join',
      private: false
    }

    let { socket } = this.props;

    socket.emit('getRooms');

    socket.on('sendRooms', rooms => {
      this.setState({ rooms, wait: false });
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

  selectOption(type) {
    this.setState({ type })
  }

  renderCreateRoom() {
    return (
      <div className="makeRoom">
        <div>
          <h2 style={{textAlign: 'center'}} >Maak een room</h2>
          <form onSubmit={e => this.makeRoom(e)}>
            <input style={{width: '100%'}} name="room" type="text" /><br />
            <input onChange={e => this.setState({ private: e.target.checked })} type="checkbox" name="private" />
            {this.state.private ?
              <h3 style={{ color: 'red', display: 'inline' }}> Niemand kan zonder link joinen</h3>
              : <h3 style={{ color: 'green', display: 'inline' }}> Iedereen kan joinen</h3>}
            <br />
            <button style={{ width: '100%' }} type="submit">Maak</button>
          </form>
        </div>
      </div>
    )
  }

  renderJoinRoom() {
    let { rooms } = this.state;

    return (
      <div className="joinRoom">
        <div style={{ textAlign: 'center' }}>
          Zoek:
          <input onChange={e => {
            this.setState({ search: e.target.value, alert: null });
          }} type="text" />


          <table style={{ minWidth: '400px' }}>
            <tbody>
              <tr>
                <td>Naam:</td>
                <td>Luisteraars:</td>
              </tr>
              {rooms.map(room => {
                if (this.state.search) {
                  try {
                    if (room.name.search(this.state.search) < 0) return
                  } catch (error) {
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
        </div>
      </div>
    )
  }

  render() {
    let { type } = this.state;

    return (
      <div className="container">

        <div className="header">
          <div style={{ textAlign: 'center' }}>
            <h1>Watch It Together</h1>
            <h4>Kijk samen naar precies hetzelfde!</h4>
            <h4>Want dat is wat je wil..</h4>
            <button className="homeButton" onClick={() => this.selectOption('join')}><p>Join een Room</p></button>
            <button className="homeButton" onClick={() => this.selectOption('create')}><p>Maak een Room</p></button>
          </div>
        </div>

        <div className="content">
          {type === 'join' && this.renderJoinRoom()}
          {type === 'create' && this.renderCreateRoom()}
        </div>

        {/* Loadscreen */}
        {this.state.wait ? <div className="wait"><div className="waitSpinner"></div></div> : null}

        {/* Alert message */}
        {this.state.alert ? <div className="alert" onClick={() => this.setState({ alert: null })} style={{ background: this.state.alert.color }}>{this.state.alert.message}</div> : null}

      </div>
    );
  }
}

export default Home;

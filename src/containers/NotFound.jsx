import React, { Component } from 'react'

export default class NotFound extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timer: 6
    }
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({timer: this.state.timer - 1})
      if (this.state.timer < 0) this.props.history.push('/')
    }, 1000)
  }

  render() {
    return (
      <div style={{textAlign: 'center'}}>
        <h1>bruh.. what you doing here?</h1>
        <h2>You are going back Home in</h2>
        <h2 style={{color: 'red'}}>{this.state.timer}</h2>
      </div>
    )
  }
}

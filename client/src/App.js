import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Map from './Map';
import Stats from './Stats';

const mapStyles = {
  height: '500px',
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: []
    };
  }

  async componentDidMount() {
    const response = await fetch('/stats');
    const stats = await response.json();
    this.setState({stats: stats});
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">TechMeetups Stats</h1>
        </header>
        <br />
        <div style={mapStyles}>
          <Map stats={this.state.stats} />
        </div>
        <Stats stats={this.state.stats} />
      </div>
    );
  }
}

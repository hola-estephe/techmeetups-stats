import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Stats from './Stats';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">TechMeetups Stats</h1>
        </header>
        <br />
        <Stats />
      </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
import './App.css';
import Map from './Map';
import Stats from './Stats';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: [],
      geojson: [],
    };
  }

  async componentDidMount() {
    const stats = await (await fetch('/stats')).json();
    const geojson = await (await fetch('/events.geojson')).json();

    this.setState({
      stats: stats,
      geojson: geojson.features,
    });
  }

  render() {
    return (
      <div className="App">
        <h1 className="App-title">TechMeetups Stats</h1>
        <Map geojson={this.state.geojson} />
        <Stats stats={this.state.stats} />
      </div>
    );
  }
}

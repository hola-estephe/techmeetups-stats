import React, { Component } from 'react';

class Stats extends Component {
  state = {
    cities: []
  };

  async componentDidMount() {
    const response = await fetch('/stats');
    const cities = await response.json();
    this.setState({cities: cities});
  }

  render() {
    return (
      <div>
        <ul>
          {this.state.cities.map(city => {
            return <li key={city.city}> <strong>{city.city}</strong>: {city.events} meetups</li>
          })}
        </ul>
      </div>
    );
  }
}

export default Stats;

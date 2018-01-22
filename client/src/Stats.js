import React, { Component } from 'react';

export default class Stats extends Component {
  render() {
    return (
      <div>
        <ul>
          {this.props.stats.map(stats => {
            return (
              <li key={stats.city.city}>
                <strong>{stats.city.city}</strong>: {stats.events} meetups
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

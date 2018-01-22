import React, { Component } from 'react';

export default class CityMarker extends Component {
  render() {
    const size = parseInt(((this.props.percent*(170-30))/100)+30);
    const cityMarkerStyle = {
      position: 'absolute',
      width: size,
      height: size,
      left: -size / 2,
      top: -size / 2,
      borderRadius: size,
      fontSize: `${size/3}px`,
      lineHeight: `${size-10}px`,

      border: '5px solid #f44336',
      backgroundColor: 'white',
      textAlign: 'center',
      color: '#3f51b5',
      fontWeight: '500',
    };

    return (
      <div style={cityMarkerStyle}>
        {this.props.events}
      </div>
    );
  }
}

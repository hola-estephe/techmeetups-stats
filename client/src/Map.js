import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import CityMarker from './CityMarker';

const apiKey = 'AIzaSyCqWp4t75SsrKp3xVcRcq0qIrTBTKFp7c0';

export default class Map extends Component {
  static defaultProps = {
    center: {
      lat: 46.5,
      lng: 2.22,
    },
    zoom: 6,
  };

  render() {
    const countEvents = (total, stats) => total + parseInt(stats.events);
    const total = this.props.stats.reduce(countEvents, 0);

    return (
      <GoogleMap
        defaultCenter={this.props.center}
        defaultZoom={this.props.zoom}
        bootstrapURLKeys={{ key: apiKey, language: 'fr', region: 'fr' }}
      >
        {this.props.stats.map(stats => {
          return (
            <CityMarker
              key={stats.city.city}
              lat={stats.city.lat}
              lng={stats.city.lon}
              text={stats.city.city}
              events={stats.events}
              percent={Math.round(stats.events/total*100)}
            />
          );
        })}
      </GoogleMap>
    );
  }
}

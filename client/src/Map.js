import React from 'react';
import { compose, withProps, withHandlers } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from "react-google-maps";
import { MarkerClusterer } from "react-google-maps/lib/components/addons/MarkerClusterer";
import mapStyles from "./googleMapStyles.json";

export default compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyCqWp4t75SsrKp3xVcRcq0qIrTBTKFp7c0&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `${window.innerHeight}px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
    center: { lat: 46.5, lng: 2.22 },
    defaultStyles: [
      {
        textColor: 'white',
        textSize: 10,
        url: "/images/cluster/m1.png",
        height: 53,
        width: 53
      },
      {
        textColor: 'white',
        textSize: 13,
        url: "/images/cluster/m2.png",
        height: 56,
        width: 56
      },
      {
        textColor: 'white',
        textSize: 16,
        url: "/images/cluster/m3.png",
        height: 66,
        width: 66
      },
      {
        textColor: 'white',
        textSize: 19,
        url: "/images/cluster/m4.png",
        height: 78,
        width: 78
      },
      {
        textColor: 'white',
        textSize: 23,
        url: "/images/cluster/m5.png",
        height: 90,
        width: 90
      }
    ],
  }),
  withHandlers({
    onMarkerClustererClick: () => (markerClusterer) => {
      const clickedMarkers = markerClusterer.getMarkers()
      console.log(`Current clicked markers length: ${clickedMarkers.length}`)
      console.log(clickedMarkers)
    },
  }),
  withScriptjs,
  withGoogleMap
)(props =>
  <GoogleMap
    defaultZoom={6}
    defaultCenter={props.center}
    defaultOptions={{
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      styles: mapStyles
    }}
  >
    <MarkerClusterer
      onClick={props.onMarkerClustererClick}
      averageCenter
      enableRetinaIcons
      gridSize={50}
      defaultStyles={props.defaultStyles}
    >
      {props.geojson.map(point => (
        <Marker
          key={point.properties.id}
          position={{ lat: point.geometry.coordinates[1], lng: point.geometry.coordinates[0] }}
        />
      ))}
    </MarkerClusterer>
  </GoogleMap>
);

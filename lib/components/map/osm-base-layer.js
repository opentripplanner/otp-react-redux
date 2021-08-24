import React, { Component } from 'react'
import { TileLayer } from 'react-leaflet'

export default class OsmBaseLayer extends Component {
  render () {
    return (
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        detectRetina
        url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
      />
    )
  }
}

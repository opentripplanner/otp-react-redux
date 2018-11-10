import React, { Component, PropTypes } from 'react'
import { TileLayer } from 'react-leaflet'

export default class TileOverlay extends Component {
  static propTypes = {
    tileUrl: PropTypes.string
  }

  componentWillUnmount () { }

  render () {
    return this.props.tileUrl
      ? <TileLayer url={this.props.tileUrl} />
      : null
  }
}

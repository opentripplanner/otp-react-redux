import React, { Component } from 'react'
import PropTypes from 'prop-types'
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

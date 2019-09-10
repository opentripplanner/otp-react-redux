import L from 'leaflet'
import React, { Component } from 'react'
import { LayersControl, TileLayer } from 'react-leaflet'
import { connect } from 'react-redux'

class BaseLayers extends Component {
  render () {
    const { baseLayers, overlays } = this.props.config.map
    const { BaseLayer, Overlay } = LayersControl
    return (
      <LayersControl>
        {baseLayers && baseLayers.map((l, i) => {
          // Fix tile size/zoom offset: https://stackoverflow.com/a/37043490/915811
          const retinaProps = L.Browser.retina && l.hasRetinaSupport
            ? { tileSize: 512, zoomOffset: -1 }
            : {}
          return (
            <BaseLayer
              name={l.name}
              checked={i === 0}
              key={i}>
              <TileLayer
                {...l}
                {...retinaProps}
                detectRetina />
            </BaseLayer>
          )
        })}
        {overlays && overlays.map((l, i) => (
          <Overlay
            name={l.name}
            key={i}>
            <TileLayer
              {...l}
              detectRetina />
          </Overlay>
        ))}
      </LayersControl>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config
  }
}

export default connect(mapStateToProps)(BaseLayers)

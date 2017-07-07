import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { MapLayer, Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'

import { hasTransit } from '../../util/itinerary'
import { findStopsWithinBBox, clearStops } from '../../actions/api'

class StopsOverlay extends MapLayer {
  static propTypes = {
    minZoom: PropTypes.number,
    queryMode: PropTypes.string,
    stops: PropTypes.array,
    refreshStops: PropTypes.func
  }

  static defaultProps = {
    minZoom: 15
  }

  componentDidMount () {
    // set up pan/zoom listeners
    this.context.map.on('zoomend', () => { this._refreshStops() })
    this.context.map.on('dragend', () => { this._refreshStops() })
  }

  _refreshStops () {
    if (this.context.map.getZoom() < this.props.minZoom) {
      this.props.clearStops()
      return
    }

    const bounds = this.context.map.getBounds()
    const params = {
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLon: bounds.getWest(),
      maxLon: bounds.getEast()
    }
    this.props.refreshStops(params)
  }

  createLeafletElement () {
  }

  updateLeafletElement () {
  }

  render () {
    const { minZoom, queryMode, stops } = this.props

    // don't render if below zoom threshold or transit not currently selected
    if (this.context.map.getZoom() < minZoom || !hasTransit(queryMode)) return null

    return (
      <div>
        {stops.map((stop) => {
          const icon = divIcon({
            iconSize: [20, 20],
            iconAnchor: [12, 15],
            popupAnchor: [1, -6],
            html: `<span class="fa-stack" style="opacity: 1.0" style={{ background: #00f }}>
                    <i class="fa fa-circle fa-stack-1x" style="color: #ffffff"></i>
                    <i class="fa fa-circle-o fa-stack-1x" style="color: #000000"></i>
                  </span>`,
            className: ''
          })

          const idArr = stop.id.split(':')

          return (
            <Marker
              icon={icon}
              key={stop.id}
              position={[stop.lat, stop.lon]}
            >
              <Popup>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 18 }}>{stop.name}</div>
                  <div><b>Agency:</b> {idArr[0]}</div>
                  <div><b>Stop ID:</b> {idArr[1]}</div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    stops: state.otp.overlay.transit.stops,
    queryMode: state.otp.currentQuery.mode
  }
}

const mapDispatchToProps = {
  refreshStops: findStopsWithinBBox,
  clearStops: clearStops
}

export default connect(mapStateToProps, mapDispatchToProps)(StopsOverlay)

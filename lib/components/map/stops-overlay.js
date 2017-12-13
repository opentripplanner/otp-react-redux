import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FeatureGroup, MapLayer, Popup, CircleMarker } from 'react-leaflet'
import { Button, ButtonGroup } from 'react-bootstrap'

import { hasTransit } from '../../util/itinerary'
import { findStopsWithinBBox, clearStops } from '../../actions/api'
import { setLocation } from '../../actions/map'

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
      this.forceUpdate()
      return
    }

    const bounds = this.context.map.getBounds()
    const params = {
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLon: bounds.getWest(),
      maxLon: bounds.getEast()
    }
    setTimeout(() => { this.props.refreshStops(params) }, 300)
  }

  createLeafletElement () {
  }

  updateLeafletElement () {
  }

  render () {
    const { minZoom, queryMode, setLocation, stops } = this.props

    // don't render if below zoom threshold or transit not currently selected
    if (this.context.map.getZoom() < minZoom || !hasTransit(queryMode)) return <FeatureGroup />

    return (
      <FeatureGroup>
        {stops.map((stop) => {
          const idArr = stop.id.split(':')

          return (
            <CircleMarker
              key={stop.id}
              center={[stop.lat, stop.lon]}
              radius={4}
              fillOpacity={1}
              fillColor='#fff'
              color='#000'
              weight={1.5}
            >
              <Popup>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 18 }}>{stop.name}</div>
                  <div><b>Agency:</b> {idArr[0]} | <b>Stop ID:</b> {idArr[1]}</div>
                  <div style={{ marginTop: '10px' }}>
                    <span>Set as: </span>
                    <ButtonGroup>
                      <Button bsSize='xsmall' bsStyle='success'
                        onClick={() => {
                          setLocation(constructPayload(stop, 'from'))
                          this.context.map.closePopup()
                        }}
                      >
                        <i className='fa fa-star' /> Start
                      </Button>
                      <Button bsSize='xsmall' bsStyle='danger'
                        onClick={() => {
                          setLocation(constructPayload(stop, 'to'))
                          this.context.map.closePopup()
                        }}
                      >
                        <i className='fa fa-map-marker' /> End
                      </Button>
                    </ButtonGroup>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </FeatureGroup>
    )
  }
}

function constructPayload (stop, type) {
  return {
    type,
    location: {
      lat: stop.lat,
      lon: stop.lon,
      name: stop.name
    },
    reverseGeocode: false
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
  clearStops,
  setLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(StopsOverlay)

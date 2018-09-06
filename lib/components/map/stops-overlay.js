import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FeatureGroup, MapLayer, Popup, CircleMarker } from 'react-leaflet'
import { Button } from 'react-bootstrap'

import SetFromToButtons from './set-from-to'
import { hasTransit } from '../../util/itinerary'
import { findStopsWithinBBox, clearStops } from '../../actions/api'
import { setLocation } from '../../actions/map'
import { setViewedStop } from '../../actions/ui'

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
    // set up pan/zoom listener
    this.context.map.on('moveend', () => {
      this._refreshStops()
    })
  }

  // TODO: determine why the default MapLayer componentWillUnmount() method throws an error
  componentWillUnmount () { }

  _refreshStops () {
    if (this.context.map.getZoom() < this.props.minZoom) {
      this.forceUpdate()
      return
    }

    const bounds = this.context.map.getBounds()
    if (!bounds.equals(this.lastBounds)) {
      setTimeout(() => {
        this.props.refreshStops({
          minLat: bounds.getSouth(),
          maxLat: bounds.getNorth(),
          minLon: bounds.getWest(),
          maxLon: bounds.getEast()
        })
        this.lastBounds = bounds
      }, 300)
    }
  }

  createLeafletElement () {
  }

  updateLeafletElement () {
  }

  render () {
    const { minZoom, queryMode, setLocation, stops } = this.props

    // don't render if below zoom threshold or transit not currently selected
    if (
      this.context.map.getZoom() < minZoom ||
      !hasTransit(queryMode) ||
      !stops ||
      stops.length === 0
    ) return <FeatureGroup />

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
                <div className='map-overlay-popup'>
                  <div className='popup-title'>{stop.name}</div>

                  <div className='popup-row'><b>Agency:</b> {idArr[0]}</div>
                  <div className='popup-row'>
                    <span><b>Stop ID:</b> {idArr[1]}</span>
                    {/* The Stop Viewer button (Note: we use a vanilla Button
                      * instead of ViewStopButton because connected components
                      * don't work within react-leaflet Popups) */}
                    <Button
                      className='view-stop-button'
                      bsSize='xsmall'
                      onClick={() => {
                        this.props.setViewedStop({ stopId: stop.id })
                      }}
                    >Stop Viewer</Button>
                  </div>

                  {/* The "Set as [from/to]" ButtonGroup */}
                  <div className='popup-row'>
                    <SetFromToButtons
                      map={this.context.map}
                      location={{
                        lat: stop.lat,
                        lon: stop.lon,
                        name: stop.name
                      }}
                      setLocation={setLocation}
                    />
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
  setLocation,
  setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(StopsOverlay)

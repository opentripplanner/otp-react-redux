import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FeatureGroup, MapLayer, Marker, Popup, withLeaflet } from 'react-leaflet'
import { divIcon } from 'leaflet'

import { setLocation } from '../../actions/map'
import { zipcarLocationsQuery } from '../../actions/zipcar'

import SetFromToButtons from './set-from-to'

const zipcarIcon = '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120.09 120.1"><defs><style>.cls-1{fill:#59ad46;}.cls-2{fill:#fff;}.cls-3{fill:#5c5d5f;}</style></defs><title>zipcar-icon</title><path class="cls-1" d="M246.37,396.78a60,60,0,1,1,60,60,60.05,60.05,0,0,1-60-60" transform="translate(-246.37 -336.74)"/><path class="cls-2" d="M363.6,418.66q0.47-1.28.9-2.58H314.16l2.46-3.15h34.87a1.27,1.27,0,1,0,0-2.53H318.6l2.42-3.09h17.74a1.31,1.31,0,0,0,0-2.58H291.69l28.85-37.59H273.06v10.27h25.28l-26.48,34.34-5.45,6.9h21a12,12,0,0,1,22.29,0H363.6" transform="translate(-246.37 -336.74)"/><path class="cls-3" d="M307.84,423.3a9.27,9.27,0,1,1-9.27-9.27,9.27,9.27,0,0,1,9.27,9.27" transform="translate(-246.37 -336.74)"/></svg>'

class ZipcarOverlay extends MapLayer {
  static propTypes = {
    api: PropTypes.string,
    locations: PropTypes.array,
    setLocation: PropTypes.func,
    zipcarLocationsQuery: PropTypes.func
  }

  _startRefreshing () {
    // ititial station retrieval
    this.props.zipcarLocationsQuery(this.props.api)

    // set up timer to refresh stations periodically
    this._refreshTimer = setInterval(() => {
      this.props.zipcarLocationsQuery(this.props.api)
    }, 30000) // defaults to every 30 sec. TODO: make this configurable?*/
  }

  _stopRefreshing () {
    if (this._refreshTimer) clearInterval(this._refreshTimer)
  }

  componentDidMount () {
    this.props.registerOverlay(this)
  }

  onOverlayAdded = () => {
    this._startRefreshing()
  }

  onOverlayRemoved = () => {
    this._stopRefreshing()
  }

  componentWillUnmount () {
    this._stopRefreshing()
  }

  componentDidUpdate (prevProps) {
    if (!prevProps.visible && this.props.visible) {
      this._startRefreshing()
    } else if (prevProps.visible && !this.props.visible) {
      this._stopRefreshing()
    }
  }

  createLeafletElement () {}

  updateLeafletElement () {}

  render () {
    const { locations } = this.props
    if (!locations || locations.length === 0) return <FeatureGroup />

    const markerIcon = divIcon({
      className: '',
      html: zipcarIcon,
      iconSize: [24, 24],
      popupAnchor: [0, -12]
    })

    const bulletIconStyle = {
      color: 'gray',
      fontSize: 12,
      width: 15
    }

    return (
      <FeatureGroup>
        {locations.map((location) => {
          return (
            <Marker
              icon={markerIcon}
              key={location.location_id}
              position={[location.coordinates.lat, location.coordinates.lng]}
            >
              <Popup>
                <div className='map-overlay-popup'>
                  {/* Popup title */}
                  <div className='popup-title'>
                    Zipcar Location
                  </div>

                  {/* Location info bullet */}
                  <div className='popup-row'>
                    <i className='fa fa-map-marker' style={bulletIconStyle} /> {location.display_name}
                  </div>

                  {/* Vehicle-count bullet */}
                  <div className='popup-row'>
                    <i className='fa fa-car' style={bulletIconStyle} /> {location.num_vehicles} Vehicles
                  </div>

                  {/* Set as from/to toolbar */}
                  <div className='popup-row'>
                    <SetFromToButtons
                      location={{
                        lat: location.coordinates.lat,
                        lon: location.coordinates.lng,
                        name: location.display_name
                      }}
                      map={this.props.leaflet.map}
                      setLocation={this.props.setLocation}
                    />
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </FeatureGroup>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    locations: state.otp.overlay.zipcar && state.otp.overlay.zipcar.locations
  }
}

const mapDispatchToProps = {
  setLocation,
  zipcarLocationsQuery
}

export default connect(mapStateToProps, mapDispatchToProps)(withLeaflet(ZipcarOverlay))

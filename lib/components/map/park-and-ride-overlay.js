import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FeatureGroup, MapLayer, Marker, Popup, withLeaflet } from 'react-leaflet'
import { divIcon } from 'leaflet'

import SetFromToButtons from './set-from-to'
import { setLocation } from '../../actions/map'
import { parkAndRideQuery } from '../../actions/api'

class ParkAndRideOverlay extends MapLayer {
  static propTypes = {
    locations: PropTypes.array,
    zipcarLocationsQuery: PropTypes.func,
    setLocation: PropTypes.func
  }

  componentDidMount () {
    const params = {}
    if (this.props.maxTransitDistance) {
      params['maxTransitDistance'] = this.props.maxTransitDistance
    }
    // TODO: support config-defined bounding envelope

    this.props.parkAndRideQuery(params)
  }

  componentWillUnmount () {}

  createLeafletElement () {}

  updateLeafletElement () {}

  render () {
    const { locations } = this.props
    if (!locations || locations.length === 0) return <FeatureGroup />

    const markerIcon = divIcon({
      iconSize: [20, 20],
      popupAnchor: [0, -10],
      html: '<div style="width: 20px; height: 20px; background: #000; color: #fff; border-radius: 10px; font-weight: bold; font-size: 16px; padding-left: 4px; padding-top: 10px; line-height: 0px;">P</div>',
      className: ''
    })

    return (
      <FeatureGroup>
        {locations.map((location, k) => {
          const name = location.name.startsWith('P+R ') ? location.name.substring(4) : location.name
          return (
            <Marker
              icon={markerIcon}
              key={k}
              position={[location.y, location.x]}
            >
              <Popup>
                <div className='map-overlay-popup'>
                  {/* Popup title */}
                  <div className='popup-title'>
                    {name}
                  </div>

                  {/* Set as from/to toolbar */}
                  <div className='popup-row'>
                    <SetFromToButtons
                      map={this.props.leaflet.map}
                      location={{
                        lat: location.y,
                        lon: location.x,
                        name
                      }}
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
    locations: state.otp.overlay.parkAndRide && state.otp.overlay.parkAndRide.locations
  }
}

const mapDispatchToProps = {
  setLocation,
  parkAndRideQuery
}

export default connect(mapStateToProps, mapDispatchToProps)(withLeaflet(ParkAndRideOverlay))

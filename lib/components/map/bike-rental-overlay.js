import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { FeatureGroup, Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'

import { bikeRentalQuery } from '../../actions/api'
import SetFromToButtons from './set-from-to'
import { setLocation } from '../../actions/map'

class BikeRentalOverlay extends Component {
  static propTypes = {
    queryMode: PropTypes.string,
    stations: PropTypes.array,
    refreshStations: PropTypes.func
  }

  _startRefreshing () {
    // ititial station retrieval
    this.props.refreshStations()

    // set up timer to refresh stations periodically
    this._refreshTimer = setInterval(() => {
      this.props.refreshStations()
    }, 30000) // defaults to every 30 sec. TODO: make this configurable?*/
  }

  _stopRefreshing () {
    if (this._refreshTimer) clearInterval(this._refreshTimer)
  }

  componentDidMount () {
    if (this.props.visible) this._startRefreshing()
  }

  componentWillUnmount () {
    this._stopRefreshing()
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this._startRefreshing()
    } else if (this.props.visible && !nextProps.visible) {
      this._stopRefreshing()
    }
  }

  render () {
    const { stations } = this.props

    if (!stations || stations.length === 0) return <FeatureGroup />

    return (
      <FeatureGroup>
        {stations.map((station) => {
          let icon
          if (station.isFloatingBike) {
            icon = divIcon({
              iconSize: [24, 24],
              iconAnchor: [12, 24],
              popupAnchor: [0, -12],
              html: `<div class="bike-rental-hub-icon bike-rental-out-of-hub"></div>`,
              className: ''
            })
          } else {
            const pctFull = station.bikesAvailable / (station.bikesAvailable + station.spacesAvailable)
            const i = Math.round(pctFull * 9)
            icon = divIcon({
              iconSize: [24, 24],
              iconAnchor: [12, 24],
              popupAnchor: [0, -12],
              html: `<div class="bike-rental-hub-icon bike-rental-hub-icon-${i}"></div>`,
              className: ''
            })
          }
          return (
            <Marker
              icon={icon}
              key={station.id}
              position={[station.y, station.x]}
            >
              <Popup>
                <div>
                  {/* Popup title */}
                  <div style={{ fontSize: 18, fontWeight: '500', marginBottom: 6 }}>
                    {station.isFloatingBike
                      ? <span>Floating bike: {station.name}</span>
                      : <span>{station.name}</span>
                    }
                  </div>

                  {/* Details */}
                  {!station.isFloatingBike && (
                    <div style={{ marginBottom: 8 }}>
                      <div>Available bikes: {station.bikesAvailable}</div>
                      <div>Available docks: {station.spacesAvailable}</div>
                    </div>
                  )}

                  {/* Set as from/to toolbar */}
                  <SetFromToButtons
                    map={this.context.map}
                    location={{
                      lat: station.y,
                      lon: station.x,
                      name: station.name
                    }}
                    setLocation={this.props.setLocation}
                  />
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
    stations: state.otp.overlay.bikeRental.stations
  }
}

const mapDispatchToProps = {
  refreshStations: bikeRentalQuery,
  setLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(BikeRentalOverlay)

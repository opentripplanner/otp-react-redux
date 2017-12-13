import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { FeatureGroup, Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'

import { bikeRentalQuery } from '../../actions/api'

class BikeRentalOverlay extends Component {
  static propTypes = {
    queryMode: PropTypes.string,
    stations: PropTypes.array,
    refreshStations: PropTypes.func
  }

  componentDidMount () {
    // ititial station retrieval
    this.props.refreshStations()

    // set up timer to refresh stations periodically
    this._refreshTimer = setInterval(() => {
      this.props.refreshStations()
    }, 30000) // defaults to every 30 sec. TODO: make this configurable?
  }

  componentWillUnmount () {
    clearInterval(this._refreshTimer)
  }

  render () {
    const { queryMode, stations } = this.props
    const hasBikeRental = queryMode && queryMode.split(',').indexOf('BICYCLE_RENT') !== -1

    if (!hasBikeRental) return null

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
                {station.isFloatingBike
                  ? <span>
                    <b>Floating bike: {station.name}</b>
                  </span>
                  : <span>
                    <b>{station.name}</b><br />
                    Available bikes: {station.bikesAvailable}<br />
                    Available docks: {station.spacesAvailable}<br />
                  </span>
                }
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
    stations: state.otp.overlay.bikeRental.stations,
    queryMode: state.otp.currentQuery.mode
  }
}

const mapDispatchToProps = {
  refreshStations: bikeRentalQuery
}

export default connect(mapStateToProps, mapDispatchToProps)(BikeRentalOverlay)

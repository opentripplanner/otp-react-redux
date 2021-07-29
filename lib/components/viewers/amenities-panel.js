import { getCompanyIcon } from '@opentripplanner/icons/lib/companies'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { ComponentContext } from '../../util/contexts'

import RelatedPanel from './related-panel'

const StyledParkAndRideIcon = styled.div`
  background: #000;
  border-radius: 17px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  height: 22px;
  line-height: 0px;
  margin-right: 5px;
  padding-left: 7px;
  padding-top: 12px;
  width: 22px;
`

const parkAndRideMarker = <StyledParkAndRideIcon>P</StyledParkAndRideIcon>

class AmenitiesPanel extends Component {
  constructor (props) {
    super(props)
    this.state = {
      expanded: false
    }
  }

  static contextType = ComponentContext

  _toggleExpandedView = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  _renderParkAndRides = () => {
    const { parkAndRideLocations } = this.props.stopData
    return parkAndRideLocations && parkAndRideLocations.length > 0
      ? parkAndRideLocations.map(parkAndRide => (
        <li className='related-item' key={parkAndRide.name}>
          <div className='item-label'>
            <div
              className='overflow-ellipsis'
              style={{display: 'flex'}}
              title={parkAndRide.name}
            >
              {parkAndRideMarker}
              {parkAndRide.name}
            </div>
          </div>
        </li>
      ))
      : <li className='related-item'>
        <div className='item-label'>
          {parkAndRideMarker}No nearby park and ride lots found.
        </div>
      </li>
  }

  _renderBikeRentalStations = () => {
    const { stopData } = this.props
    if (!stopData || !stopData.bikeRental) return null
    const { stations } = stopData.bikeRental
    const stationCounts = {}
    stations.forEach(station => {
      const isHub = !station.isFloatingBike
      const key = `${station.networks[0]}${isHub ? station.id : ''}`
      if (!stationCounts[key]) {
        const name = isHub
          ? `${this._getCompany(station)} ${station.name}`
          : this._getCompany(station)
        stationCounts[key] = {
          icon: this._getStationIcon('BICYCLE', station),
          isHub,
          name,
          stations: []
        }
      }
      stationCounts[key].stations.push(station)
    })
    const keys = Object.keys(stationCounts)
    return keys.length > 0
      ? keys.map(key => {
        const company = stationCounts[key]
        const label = company.isHub
          ? company.name
          : `${company.stations.length} ${company.name} bikes nearby`
        return (
          <li className='related-item' key={key}>
            <div className='item-label'>
              <div className='overflow-ellipsis' title={label}>
                {company.icon}
                {label}
              </div>
            </div>
            {company.isHub &&
              <>
                <div>{company.stations[0].bikesAvailable} bikes available</div>
                <div>{company.stations[0].spacesAvailable} spaces available</div>
              </>
            }
          </li>
        )
      })
      : <li className='related-item'>
        {this._getModeIcon('BICYCLE')}
        No nearby bike rentals found.
      </li>
  }

  _getModeIcon = (mode) => {
    const { ModeIcon } = this.context
    return <ModeIcon height={22} mode={mode} style={{marginRight: '5px'}} width={22} />
  }

  _getStationIcon = (mode, station) => {
    const CompanyIcon = getCompanyIcon(station?.networks[0])
    return CompanyIcon
      ? <CompanyIcon height={22} style={{marginRight: '5px'}} width={22} />
      : this._getModeIcon()
  }

  _getCompany = (station) => {
    return this.props.configCompanies.find(c => c.id === station.networks[0])?.label || 'Unknown'
  }

  _renderVehicleRentalStations = () => {
    const { stopData } = this.props
    if (!stopData || !stopData.vehicleRental) return null
    const { stations } = stopData.vehicleRental
    const companyCounts = {}
    stations.forEach(station => {
      if (!companyCounts[station.networks[0]]) {
        companyCounts[station.networks[0]] = {
          icon: this._getStationIcon('MICROMOBILITY', station),
          name: this._getCompany(station),
          stations: []
        }
      }
      companyCounts[station.networks[0]].stations.push(station)
    })
    const keys = Object.keys(companyCounts)
    return keys.length > 0
      ? keys.map(key => {
        const company = companyCounts[key]
        return (
          <li className='related-item' key={key}>
            <div className='item-label'>
              {company.icon}
              {company.stations.length} {company.name} E-Scooters nearby
            </div>
          </li>
        )
      })
      : <li className='related-item'>
        {this._getModeIcon('MICROMOBILITY')}
        No nearby micromobility rentals found.
      </li>
  }

  render () {
    const { expanded } = this.state
    console.log(this.props.stopData)
    return (
      <RelatedPanel
        expanded={expanded}
        onToggleExpanded={this._toggleExpandedView}
        title='Nearby Amenities'
      >
        <ul className='related-items-list list-unstyled'>
          {this._renderParkAndRides()}
          {this._renderBikeRentalStations()}
          {this._renderVehicleRentalStations()}
        </ul>
      </RelatedPanel>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    configCompanies: state.otp.config.companies
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(AmenitiesPanel)

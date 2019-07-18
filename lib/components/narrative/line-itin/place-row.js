import React, { Component, PureComponent } from 'react'
import { connect } from 'react-redux'

import LocationIcon from '../../icons/location-icon'
import ViewStopButton from '../../viewers/view-stop-button'
import {
  getCompanyForNetwork,
  getModeForPlace,
  getPlaceName
} from '../../../util/itinerary'
import { formatTime } from '../../../util/time'

import TransitLegBody from './transit-leg-body'
import AccessLegBody from './access-leg-body'

// TODO: make this a prop
const defaultRouteColor = '#008'

class PlaceRow extends Component {
  _createLegLine (leg) {
    switch (leg.mode) {
      case 'WALK': return <div className='leg-line leg-line-walk' />
      case 'BICYCLE':
      case 'BICYCLE_RENT':
        return <div className='leg-line leg-line-bicycle' />
      case 'CAR': return <div className='leg-line leg-line-car' />
      case 'MICROMOBILITY':
      case 'MICROMOBILITY_RENT':
        return <div className='leg-line leg-line-micromobility' />
      default:
        return <div className='leg-line leg-line-transit' style={{
          backgroundColor: leg.routeColor ? '#' + leg.routeColor : defaultRouteColor
        }} />
    }
  }

  /* eslint-disable complexity */
  render () {
    const { config, customIcons, leg, legIndex, place, time, timeOptions, followsTransit } = this.props
    const stackIcon = (name, color, size) => <i className={`fa fa-${name} fa-stack-1x`} style={{ color, fontSize: size + 'px' }} />
    let icon
    if (!leg) { // This is the itinerary destination
      icon = (
        <span className='fa-stack place-icon-group'>
          {stackIcon('circle', 'white', 26)}
          <LocationIcon type='to' className='fa-stack-1x' style={{ fontSize: 20 }} />
        </span>
      )
    } else if (legIndex === 0) { // The is the origin
      icon = (
        <span className='fa-stack place-icon-group'>
          {stackIcon('circle', 'white', 26)}
          <LocationIcon type='from' className='fa-stack-1x' style={{ fontSize: 20 }} />
        </span>
      )
    } else { // This is an intermediate place
      icon = (
        <span className='fa-stack place-icon-group'>
          {stackIcon('circle', 'white', 22)}
          {stackIcon('circle-o', 'black', 22)}
        </span>
      )
    }
    // NOTE: Previously there was a check for itineraries that changed vehicles
    // at a single stop, which would render the stop place the same as the
    // interline stop. However, this prevents the user from being able to click
    // on the stop viewer in this case, which they may want to do in order to
    // check the real-time arrival information for the next leg of their journey.
    const interline = leg && leg.interlineWithPreviousLeg
    return (
      <div className='place-row' key={this.rowKey++}>
        <div className='time'>
          {time && formatTime(time, timeOptions)}
        </div>
        <div className='line-container'>
          {leg && this._createLegLine(leg) }
          <div>{!interline && icon}</div>
        </div>
        <div className='place-details'>
          {/* Dot separating interlined segments, if applicable */}
          {interline && <div className='interline-dot'>&bull;</div>}

          {/* The place name */}
          <div className='place-name'>
            {interline
              ? <div className='interline-name'>Stay on Board at <b>{place.name}</b></div>
              : <div>{getPlaceName(place, config.companies)}</div>
            }
          </div>

          {/* Place subheading: Transit stop */}
          {place.stopId && !interline && (
            <div className='place-subheader'>
              <span>Stop ID {place.stopId.split(':')[1]}</span>
              <ViewStopButton stopId={place.stopId} />
            </div>
          )}

          {/* Place subheading: rented vehicle (e.g., scooter, bike, car) pickup */}
          {leg && (leg.rentedVehicle || leg.rentedBike || leg.rentedCar) && (
            <RentedVehicleLeg config={config} leg={leg} />
          )}

          {/* Show the leg, if present */}
          {leg && (
            leg.transitLeg
              ? (/* This is a transit leg */
                <TransitLegBody
                  leg={leg}
                  legIndex={legIndex}
                  setActiveLeg={this.props.setActiveLeg}
                  customIcons={customIcons}
                />
              )
              : (/* This is an access (e.g. walk/bike/etc.) leg */
                <AccessLegBody
                  config={config}
                  customIcons={customIcons}
                  followsTransit={followsTransit}
                  leg={leg}
                  legIndex={legIndex}
                  routingType={this.props.routingType}
                  setActiveLeg={this.props.setActiveLeg}
                  timeOptions={timeOptions}
                />
              )
          )}
        </div>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    // Pass config in order to give access to companies definition (used to
    // determine proper place names for rental vehicles).
    config: state.otp.config
  }
}

const mapDispatchToProps = { }

export default connect(mapStateToProps, mapDispatchToProps)(PlaceRow)

/**
 * A component to display vehicle rental data. The word "Vehicle" has been used
 * because a future refactor is intended to combine car rental, bike rental
 * and micromobility rental all within this component. The future refactor is
 * assuming that the leg.rentedCar and leg.rentedBike response elements from OTP
 * will eventually be merged into the leg.rentedVehicle element.
 */
class RentedVehicleLeg extends PureComponent {
  render () {
    const { config, leg } = this.props
    const configCompanies = config.companies || []

    // Sometimes rented vehicles can be walked over things like stairs or other
    // ways that forbid the main mode of travel.
    if (leg.mode === 'WALK') {
      return (
        <div className='place-subheader'>
          Walk vehicle along {leg.from.name}
        </div>
      )
    }

    let pickUpString = 'Pick up'
    if (leg.rentedBike) {
      // TODO: Special case for TriMet may need to be refactored.
      pickUpString += ` shared bike`
    } else {
      // Add company and vehicle labels.
      let vehicleName = ''
      // TODO allow more flexibility in customizing these mode strings
      let modeString = leg.rentedVehicle
        ? 'eScooter'
        : leg.rentedBike
          ? 'bike'
          : 'car'

      // The networks attribute of the from data will only appear at the very
      // beggining of the rental. It is possible that there will be some forced
      // walking that occurs in the middle of the rental, so once the main mode
      // resumes there won't be any network info. In that case we simply return
      // that the rental is continuing.
      if (leg.from.networks) {
        const companies = leg.from.networks.map(n => getCompanyForNetwork(n, configCompanies))
        const companyLabel = companies.map(co => co.label).join('/')
        pickUpString += ` ${companyLabel}`
        // Only show vehicle name for car rentals. For bikes and eScooters, these
        // IDs/names tend to be less relevant (or entirely useless) in this context.
        if (leg.rentedCar && leg.from.name) {
          vehicleName = leg.from.name
        }
        modeString = getModeForPlace(leg.from)
      } else {
        pickUpString = 'Continue using rental'
      }

      pickUpString += ` ${modeString}${vehicleName}`
    }
    // e.g., Pick up REACHNOW rented car XYZNDB OR
    //       Pick up SPIN eScooter
    //       Pick up shared bike
    return (
      <div className='place-subheader'>
        {pickUpString}
      </div>
    )
  }
}

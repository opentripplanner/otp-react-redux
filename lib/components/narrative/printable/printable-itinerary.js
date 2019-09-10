import React, { Component } from 'react'
import PropTypes from 'prop-types'

import TripDetails from '../trip-details'
import { distanceString } from '../../../util/distance'
import { formatTime, formatDuration } from '../../../util/time'
import {
  getCompaniesLabelFromNetworks,
  getLegIcon,
  getLegModeLabel,
  getPlaceName,
  getStepDirection,
  getStepStreetName,
  getTimeZoneOffset
} from '../../../util/itinerary'

export default class PrintableItinerary extends Component {
  static propTypes = {
    itinerary: PropTypes.object
  }

  render () {
    const {
      configCompanies,
      customIcons,
      itinerary,
      timeFormat
    } = this.props

    const timeOptions = {
      format: timeFormat,
      offset: getTimeZoneOffset(itinerary)
    }

    return (
      <div className='printable-itinerary'>
        {itinerary.legs.length > 0 && (
          <div className='leg collapse-top'>
            <div className='leg-body'>
              <div className='leg-header'>
                <b>Depart</b> from <b>{itinerary.legs[0].from.name}</b>
              </div>
            </div>
          </div>
        )}
        {itinerary.legs.map((leg, k) => leg.transitLeg
          ? <TransitLeg
            key={k}
            customIcons={customIcons}
            interlineFollows={k < itinerary.legs.length - 1 &&
              itinerary.legs[k + 1].interlineWithPreviousLeg
            }
            leg={leg}
            timeOptions={timeOptions} />
          : leg.hailedCar
            ? <TNCLeg
              customIcons={customIcons}
              leg={leg}
              timeOptions={timeOptions} />
            : <AccessLeg
              key={k}
              configCompanies={configCompanies}
              customIcons={customIcons}
              leg={leg}
              timeOptions={timeOptions}
            />
        )}
        <TripDetails itinerary={itinerary} />
      </div>
    )
  }
}

class TransitLeg extends Component {
  static propTypes = {
    leg: PropTypes.object
  }

  render () {
    const { customIcons, leg, interlineFollows, timeOptions } = this.props

    // Handle case of transit leg interlined w/ previous
    if (leg.interlineWithPreviousLeg) {
      return (
        <div className='leg collapse-top'>
          <div className='leg-body'>
            <div className='leg-header'>
              Continues as{' '}
              <b>{leg.routeShortName} {leg.routeLongName}</b>{' '}
              to <b>{leg.to.name}</b>
            </div>
            <div className='leg-details'>
              <div className='leg-detail'>
                Get off at <b>{leg.to.name}</b>{' '}
                at {formatTime(leg.endTime, timeOptions)}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className='leg'>
        <div className='mode-icon'>{getLegIcon(leg, customIcons)}</div>
        <div className='leg-body'>
          <div className='leg-header'>
            <b>{leg.routeShortName} {leg.routeLongName}</b> to <b>{leg.to.name}</b>
          </div>
          <div className='leg-details'>
            <div className='leg-detail'>
              Board at <b>{leg.from.name}</b>{' '}
              at {formatTime(leg.startTime, timeOptions)}
            </div>
            <div className='leg-detail'>
              {interlineFollows
                ? <span>Stay on board at <b>{leg.to.name}</b></span>
                : <span>
                  Get off at <b>{leg.to.name}</b>{' '}
                  at {formatTime(leg.endTime, timeOptions)}
                </span>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class AccessLeg extends Component {
  static propTypes = {
    leg: PropTypes.object
  }

  render () {
    const { configCompanies, customIcons, leg } = this.props

    // calculate leg mode label in a special way for this component
    let legModeLabel = getLegModeLabel(leg)

    if (leg.rentedBike) {
      // FIXME: Special case for TriMet that needs to be refactored to
      // incorporate actual company.
      legModeLabel = 'Ride BIKETOWN bike'
    } else if (leg.rentedCar) {
      // Add extra information to printview that would otherwise clutter up
      // other places that use the getLegModeLabel function
      const companiesLabel = getCompaniesLabelFromNetworks(
        leg.from.networks,
        configCompanies
      )
      legModeLabel = `Drive ${companiesLabel} ${leg.from.name}`
    } else if (leg.rentedVehicle) {
      const companiesLabel = getCompaniesLabelFromNetworks(
        leg.from.networks,
        configCompanies
      )
      legModeLabel = `Ride ${companiesLabel} E-scooter`
    }

    return (
      <div className='leg'>
        <div className='mode-icon'>{getLegIcon(leg, customIcons)}</div>
        <div className='leg-body'>
          <div className='leg-header'>
            <b>{legModeLabel}</b>{' '}
            {!leg.hailedCar &&
              leg.distance > 0 &&
              <span> {distanceString(leg.distance)} </span>}
            to <b>{getPlaceName(leg.to, configCompanies)}</b>
          </div>
          {!leg.hailedCar && (
            <div className='leg-details'>
              {leg.steps.map((step, k) => {
                return (
                  <div key={k} className='leg-detail'>
                    {getStepDirection(step)} on <b>{getStepStreetName(step)}</b>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }
}

class TNCLeg extends Component {
  static propTypes = {
    leg: PropTypes.object
  }

  render () {
    const { customIcons, leg } = this.props
    const { tncData } = leg
    if (!tncData) return null

    return (
      <div className='leg'>
        <div className='mode-icon'>{getLegIcon(leg, customIcons)}</div>
        <div className='leg-body'>
          <div className='leg-header'>
            <b>Take {tncData.displayName}</b> to <b>{leg.to.name}</b>
          </div>
          <div className='leg-details'>
            <div className='leg-detail'>
              Estimated wait time for pickup:{' '}
              <b>{formatDuration(tncData.estimatedArrival)}</b>
            </div>
            <div className='leg-detail'>
              Estimated travel time:{' '}
              <b>{formatDuration(leg.duration)}</b> (does not account for traffic)
            </div>
          </div>
        </div>
      </div>
    )
  }
}

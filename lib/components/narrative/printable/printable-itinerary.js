import React, { Component } from 'react'
import PropTypes from 'prop-types'

import ModeIcon from '../../icons/mode-icon'
import TripDetails from '../trip-details'
import { formatTime, formatDuration } from '../../../util/time'
import { getLegModeString, getStepDirection, getStepStreetName, getLegMode, getTimeZoneOffset } from '../../../util/itinerary'

export default class PrintableItinerary extends Component {
  static propTypes = {
    itinerary: PropTypes.object
  }

  render () {
    const { itinerary, companies, timeFormat } = this.props

    const timeOptions = {
      format: timeFormat,
      offset: getTimeZoneOffset(itinerary)
    }

    return (
      <div className='printable-itinerary'>
        {itinerary.legs.map((leg, k) => leg.transitLeg
          ? <TransitLeg key={k} leg={leg} interlineFollows={k < itinerary.legs.length - 1 && itinerary.legs[k + 1].interlineWithPreviousLeg} timeOptions={timeOptions} />
          : leg.hailedCar
            ? <TNCLeg leg={leg} legMode={getLegMode(companies, leg)} timeOptions={timeOptions} />
            : <AccessLeg key={k} leg={leg} timeOptions={timeOptions} />
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
    const { leg, interlineFollows, timeOptions } = this.props

    // Handle case of transit leg interlined w/ previous
    if (leg.interlineWithPreviousLeg) {
      return (
        <div className='leg interlined'>
          <div className='leg-body'>
            <div className='leg-header'>
              Continues as <b>{leg.routeShortName} {leg.routeLongName}</b> to <b>{leg.to.name}</b>
            </div>
            <div className='leg-details'>
              <div className='leg-detail'>Get off at <b>{leg.to.name}</b> at {formatTime(leg.endTime, timeOptions)}</div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className='leg'>
        <div className='mode-icon'><ModeIcon mode={leg.mode} /></div>
        <div className='leg-body'>
          <div className='leg-header'>
            <b>{leg.routeShortName} {leg.routeLongName}</b> to <b>{leg.to.name}</b>
          </div>
          <div className='leg-details'>
            <div className='leg-detail'>Board at <b>{leg.from.name}</b> at {formatTime(leg.startTime, timeOptions)}</div>
            {interlineFollows
              ? <div className='leg-detail'>Stay on board at <b>{leg.to.name}</b></div>
              : <div className='leg-detail'>Get off at <b>{leg.to.name}</b> at {formatTime(leg.endTime, timeOptions)}</div>
            }
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
    const { leg } = this.props
    return (
      <div className='leg'>
        <div className='mode-icon'><ModeIcon mode={leg.mode} /></div>
        <div className='leg-body'>
          <div className='leg-header'>
            <b>{getLegModeString(leg)}</b> to <b>{leg.to.name}</b>
          </div>
          {!leg.hailedCar && (
            <div className='leg-details'>
              {leg.steps.map((step, k) => {
                return (
                  <div key={k} className='leg-detail'>{getStepDirection(step)} on <b>{getStepStreetName(step)}</b></div>
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
    const { leg } = this.props
    const { tncData } = leg
    if (!tncData) return null

    return (
      <div className='leg'>
        <div className='mode-icon'><ModeIcon mode={leg.mode} /></div>
        <div className='leg-body'>
          <div className='leg-header'>
            <b>Take {tncData.displayName}</b> to <b>{leg.to.name}</b>
          </div>
          <div className='leg-details'>
            <div className='leg-detail'>Estimated wait time for pickup: <b>{formatDuration(tncData.estimatedArrival)}</b></div>
            <div className='leg-detail'>Estimated travel time: <b>{formatDuration(leg.duration)}</b> (does not account for traffic)</div>
          </div>
        </div>
      </div>
    )
  }
}

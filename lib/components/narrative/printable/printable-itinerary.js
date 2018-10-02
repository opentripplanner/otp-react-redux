import React, { Component } from 'react'
import PropTypes from 'prop-types'

import ModeIcon from '../../icons/mode-icon'
import TripDetails from '../trip-details'
import { formatTime } from '../../../util/time'
import { getLegModeString, getStepDirection, getStepStreetName } from '../../../util/itinerary'

export default class PrintableItinerary extends Component {
  static propTypes = {
    itinerary: PropTypes.object
  }

  render () {
    const { itinerary } = this.props
    return (
      <div className='printable-itinerary'>
        {itinerary.legs.map((leg, k) => leg.transitLeg
          ? <TransitLeg key={k} leg={leg} />
          : <AccessLeg key={k} leg={leg} />
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
    const { leg } = this.props
    return (
      <div className='leg'>
        <div className='mode-icon'><ModeIcon mode={leg.mode} /></div>
        <div className='leg-body'>
          <div className='leg-header'>
            <b>{leg.routeShortName} {leg.routeLongName}</b> to <b>{leg.to.name}</b>
          </div>
          <div className='leg-details'>
            <div className='leg-detail'>Board at <b>{leg.from.name}</b> at {formatTime(leg.startTime)}</div>
            <div className='leg-detail'>Get off at <b>{leg.to.name}</b> at {formatTime(leg.endTime)}</div>
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

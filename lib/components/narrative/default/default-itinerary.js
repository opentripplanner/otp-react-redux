import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

import NarrativeItinerary from '../narrative-itinerary'
import ItinerarySummary from './itinerary-summary'
import ItineraryDetails from './itinerary-details'
import TripDetails from '../connected-trip-details'
import TripTools from '../trip-tools'

const { isBicycle, isBicycleRent, isTransit } = coreUtils.itinerary
const { formatDuration, formatTime } = coreUtils.time

// FIXME move to core utils
function getItineraryDescription (itinerary) {
  let primaryTransitDuration = 0
  let mainMode = 'Walk'
  let transitMode
  itinerary.legs.forEach((leg, i) => {
    const {duration, mode, rentedBike} = leg
    if (isTransit(mode) && duration > primaryTransitDuration) {
      primaryTransitDuration = duration
      transitMode = mode.toLowerCase()
    }
    if (isBicycle(mode)) mainMode = 'Bike'
    if (rentedBike) mainMode = 'Bikeshare'
    if (mode === 'CAR') mainMode = 'Drive'
  })
  let description = mainMode
  if (transitMode) description += ` to ${transitMode}`
  return description
}

export default class DefaultItinerary extends NarrativeItinerary {
  _onMouseOver = () => {
    const {index} = this.props
    // FIXME: Need to add focus call with ref?
    this.props.setVisibleItinerary({index})
  }

  _onMouseOut = () => {
    this.props.setVisibleItinerary({index: null})
  }

  render () {
    const {
      active,
      activeLeg,
      activeStep,
      expanded,
      itinerary,
      LegIcon,
      setActiveLeg,
      setActiveStep,
      timeFormat
    } = this.props
    const timeOptions = {
      format: timeFormat,
      offset: coreUtils.itinerary.getTimeZoneOffset(itinerary)
    }
    // FIXME: should the main div, just be the button?
    return (
      <div
        className={`option default-itin${active ? ' active' : ''}`}
        role='presentation'
        // TODO: Somehow set first itinerary as visible initially.
        // autoFocus={index === 0}
        onBlur={this._onMouseOut}
        onFocus={this._onMouseOver}
        onMouseOut={this._onMouseOut}
        onMouseOver={this._onMouseOver}
      >
        <button
          className='header'
          // _onHeaderClick comes from super component (NarrativeItinerary).
          onClick={this._onHeaderClick}
        >
          <span className='title'>
            {getItineraryDescription(itinerary)}
          </span>{' '}
          <span className='duration pull-right'>
            {formatDuration(itinerary.duration)}
          </span>{' '}
          <span className='arrivalTime'>
            {formatTime(itinerary.startTime, timeOptions)}
            —
            {formatTime(itinerary.endTime, timeOptions)}
          </span>
          <ItinerarySummary itinerary={itinerary} LegIcon={LegIcon} />
        </button>
        {(active || expanded) &&
          <div className='body'>
            <ItineraryDetails
              itinerary={itinerary}
              activeLeg={activeLeg}
              activeStep={activeStep}
              setActiveLeg={setActiveLeg}
              setActiveStep={setActiveStep}
              LegIcon={LegIcon}
            />
            <TripDetails itinerary={itinerary} />
            <TripTools itinerary={itinerary} />
          </div>
        }
      </div>
    )
  }
}

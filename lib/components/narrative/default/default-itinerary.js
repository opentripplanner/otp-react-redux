import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

import NarrativeItinerary from '../narrative-itinerary'
import ItinerarySummary from './itinerary-summary'
import ItineraryDetails from './itinerary-details'
import TripDetails from '../connected-trip-details'
import TripTools from '../trip-tools'

const { hasTransit, hasBike } = coreUtils.itinerary
const { formatDuration, formatTime } = coreUtils.time

// FIXME move to core utils
function getItineraryDescription (itinerary) {
  let transit = false
  let mainMode = 'WALK'
  itinerary.legs.forEach((leg, i) => {
    if (hasTransit(leg.mode)) {
      transit = true
      mainMode = leg.mode
    }
  })
  return `${mainMode}`
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
      setActiveStep
    } = this.props
    return (
      <div className={`option default-itin${active ? ' active' : ''}`}>
        <button
          className='header'
          onBlur={this._onMouseOut}
          // _onHeaderClick comes from super component (NarrativeItinerary).
          onClick={this._onHeaderClick}
          onFocus={this._onMouseOver}
          onMouseOut={this._onMouseOut}
          onMouseOver={this._onMouseOver}
        >
          <span className='title'>{getItineraryDescription(itinerary)}</span>{' '}
          <span className='duration pull-right'>{formatDuration(itinerary.duration)}</span>{' '}
          <span className='arrivalTime'>{formatTime(itinerary.startTime)}—{formatTime(itinerary.endTime)}</span>
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

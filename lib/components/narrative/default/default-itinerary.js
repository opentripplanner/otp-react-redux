import React from 'react'

import NarrativeItinerary from '../narrative-itinerary'
import ItinerarySummary from './itinerary-summary'
import ItineraryDetails from './itinerary-details'
import TripDetails from '../trip-details'
import TripTools from '../trip-tools'
import { formatDuration, formatTime } from '../../../util/time'

export default class DefaultItinerary extends NarrativeItinerary {
  render () {
    const {
      active,
      activeLeg,
      activeStep,
      expanded,
      index,
      itinerary,
      setActiveLeg,
      setActiveStep
    } = this.props
    return (
      <div className={`option default-itin${active ? ' active' : ''}`}>
        <button
          className='header'
          onClick={this._onHeaderClick}
        >
          <span className='title'>Itinerary {index + 1}</span>{' '}
          <span className='duration pull-right'>{formatDuration(itinerary.duration)}</span>{' '}
          <span className='arrivalTime'>{formatTime(itinerary.startTime)}—{formatTime(itinerary.endTime)}</span>
          <ItinerarySummary itinerary={itinerary} />
        </button>
        {(active || expanded) &&
          <div className='body'>
            <ItineraryDetails
              itinerary={itinerary}
              activeLeg={activeLeg}
              activeStep={activeStep}
              setActiveLeg={setActiveLeg}
              setActiveStep={setActiveStep}
            />
            <TripDetails itinerary={itinerary} />
            <TripTools itinerary={itinerary} />
          </div>
        }
      </div>
    )
  }
}

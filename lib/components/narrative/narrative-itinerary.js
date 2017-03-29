import React, { Component, PropTypes } from 'react'
// import Icon from './icon'

import ItinerarySummary from './itinerary-summary'
import ItineraryDetails from './itinerary-details'
import { formatDuration, formatTime } from '../../util/time'

export default class NarrativeItinerary extends Component {
  static propTypes = {
    active: PropTypes.bool,
    activeLeg: PropTypes.number,
    activeStep: PropTypes.number,
    expanded: PropTypes.bool,
    index: PropTypes.number,
    itinerary: PropTypes.object,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func
  }

  _onHeaderClick = () => {
    const { active, index, onClick, setActiveItinerary } = this.props
    if (onClick) {
      onClick()
    } else if (!active) {
      setActiveItinerary({index})
    } else {
      setActiveItinerary({index: null})
    }
  }

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
      <div className={`option itinerary${active ? ' active' : ''}`}>
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
          </div>
        }
      </div>
    )
  }
}

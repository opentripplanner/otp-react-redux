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
    if (!this.props.active) {
      this.props.setActiveItinerary(this.props.index)
    } else {
      this.props.setActiveItinerary(null)
    }
    this.props.onClick && this.props.onClick()
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

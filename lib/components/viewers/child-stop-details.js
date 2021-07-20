import React, { Component } from 'react'

import { getStopViewerConfig } from '../../util/state'
import { stopTimeComparator } from '../../util/viewer'

import StopTimeCell from './stop-time-cell'

class ChildStopDetails extends Component {
  componentDidMount () {
  }

  getStopTime (childStopTimes) {
    let sortedStopTimes = []
    sortedStopTimes = childStopTimes
      .concat()
      .sort(stopTimeComparator)
      .slice(0, getStopViewerConfig.numberOfDepartures)
    console.log(sortedStopTimes[0])
    return sortedStopTimes[0]
  }

  render () {
    const {
      childStops,
      homeTimezone,
      stopViewerArriving,
      timeFormat
    } = this.props

    const showChildStops = childStops?.map(s =>
      <div className='childstop__details'>
        {/* {s.stopTimes && this.getStopTime(s.stopTimes[0].times)} */}
        <div className='childstop__row1'>
          <span>
            {s.routes && s.routes[0].mode}
          </span>
          {s.name.charAt(0).toUpperCase()}{s.name.slice(1).toLowerCase()}
          <a href='/'>View Details</a>
        </div>
        <div className='childstop__row2'>
          <span className='childstop__route-short-name' style={{ border: '1px solid', borderRadius: '50%', padding: '3px' }}>
            {s.routes && s.routes[0].shortName}
          </span>
          <span>
            {s.routes && s.routes[0].longName}
          </span>
          {s.stopTimes && (
            <div className='next-trip-preview'>
              <StopTimeCell
                homeTimezone={homeTimezone}
                soonText={stopViewerArriving}
                stopTime={this.getStopTime(s.stopTimes[0].times)}
                timeFormat={timeFormat}
              />
            </div>)}
        </div>
      </div>
    )
    return (
      <>
        <h3>Related Stops</h3>
        <ul>{showChildStops}</ul>
      </>
    )
  }
}

export default ChildStopDetails

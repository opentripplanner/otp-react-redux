import React, { Component } from 'react'

import { stopTimeComparator } from '../../util/viewer'

import StopTimeCell from './stop-time-cell'

/**
 * Shows the next arrival for a pattern within the related stops view.
 */
export default class NextArrivalForPattern extends Component {
  render () {
    const {
      homeTimezone,
      route,
      stopTimes,
      stopViewerArriving,
      stopViewerConfig,
      timeFormat
    } = this.props

    // sort stop times by next departure
    let sortedStopTimes = []
    const hasStopTimes = stopTimes && stopTimes.length > 0
    if (hasStopTimes) {
      sortedStopTimes = stopTimes
        .concat()
        .sort(stopTimeComparator)
        // We request only x departures per pattern, but the patterns are merged
        // according to shared headsigns, so we need to slice the stop times
        // here as well to ensure only x times are shown per route/headsign combo.
        // This is applied after the sort, so we're keeping the soonest departures.
        .slice(0, stopViewerConfig.numberOfDepartures)
    } else {
      // Do not render pattern row if it has no stop times.
      return null
    }

    const routeName = route.shortName ? route.shortName : route.longName
    return (
      <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
        {/* route name */}
        <div style={{ display: 'flex', marginRight: '20px', alignItems: 'center' }}>
          <span style={{
            border: '1px solid',
            borderRadius: '50%',
            padding: '4px',
            fontSize: '13px',
            width: '24px',
            height: '24px',
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
            letterSpacing: '-1.5px',
            textAlign: 'center',
            marginRight: '5px'
          }}>{routeName}</span> To {route.longName}
        </div>
        {/* next departure preview */}
        {hasStopTimes && (
          <div>
            <StopTimeCell
              homeTimezone={homeTimezone}
              soonText={stopViewerArriving}
              stopTime={sortedStopTimes[0]}
              timeFormat={timeFormat}
            />
          </div>
        )}
      </div>
    )
  }
}

import React, { Component } from 'react'
import { VelocityTransitionGroup } from 'velocity-react'

import Icon from '../narrative/icon'
import { getFormattedStopTime } from '../../util/viewer'
import RealtimeStatusLabel from './realtime-status-label'

/**
 * Represents a single pattern row for displaying arrival times in the stop
 * viewer.
 */
export default class PatternRow extends Component {
  constructor () {
    super()
    this.state = { expanded: false }
  }

  _toggleExpandedView = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  _renderNextArrivalsView = () => {
    const {
      homeTimezone,
      pattern,
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
        .sort((a, b) => {
          const aTime = a.serviceDay + a.realtimeDeparture
          const bTime = b.serviceDay + b.realtimeDeparture
          return aTime - bTime
        })
        // We request only x departures per pattern, but the patterns are merged
        // according to shared headsigns, so we need to slice the stop times
        // here as well to ensure only x times are shown per route/headsign combo.
        // This is applied after the sort, so we're keeping the soonest departures.
        .slice(0, stopViewerConfig.numberOfDepartures)
    } else {
      // Do not include pattern row if it has no stop times.
      return null
    }
    const routeName = route.shortName ? route.shortName : route.longName

    return (
      <>
        {/* header row */}
        <div className='header'>
          {/* route name */}
          <div className='route-name'>
            <b>{routeName}</b> To {pattern.headsign}
          </div>
          {/* next departure preview */}
          {hasStopTimes && (
            <div className='next-trip-preview'>
              {getFormattedStopTime(sortedStopTimes[0], homeTimezone, stopViewerArriving, timeFormat)}
            </div>
          )}

          {/* expansion chevron button */}
          <div className='expansion-button-container'>
            <button className='expansion-button' onClick={this._toggleExpandedView}>
              <Icon type={`chevron-${this.state.expanded ? 'up' : 'down'}`} />
            </button>
          </div>
        </div>

        {/* expanded view */}
        <VelocityTransitionGroup
          enter={{ animation: 'slideDown' }}
          leave={{ animation: 'slideUp' }}>
          {this.state.expanded && (
            <div>
              <div className='trip-table'>
                {/* trips table header row */}
                <div className='header'>
                  <div className='cell' />
                  <div className='cell time-column'>DEPARTURE</div>
                  <div className='cell status-column'>STATUS</div>
                </div>

                {/* list of upcoming trips */}
                {hasStopTimes && (
                  sortedStopTimes.map((stopTime, i) => {
                    const { departureDelay: delay, realtimeState } = stopTime
                    return (
                      <div
                        className='trip-row'
                        style={{ display: 'table-row', marginTop: 6, fontSize: 14 }}
                        key={i}>
                        <div className='cell'>
                          To {stopTime.headsign}
                        </div>
                        <div className='cell time-column'>
                          {getFormattedStopTime(stopTime, homeTimezone, stopViewerArriving, timeFormat)}
                        </div>
                        <div className='cell status-column'>
                          <RealtimeStatusLabel
                            className='status-label'
                            delay={delay}
                            isRealtime={realtimeState === 'UPDATED'}
                            withBackground
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </VelocityTransitionGroup>
      </>
    )
  }

  _renderScheduleView = () => {
    const {
      pattern,
      route,
      stopTimes,
      homeTimezone,
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
        .sort((a, b) => {
          const aTime = a.serviceDay + a.scheduledDeparture
          const bTime = b.serviceDay + b.scheduledDeparture
          return aTime - bTime
        })
        // We request only x departures per pattern, but the patterns are merged
        // according to shared headsigns, so we need to slice the stop times
        // here as well to ensure only x times are shown per route/headsign combo.
        // This is applied after the sort, so we're keeping the soonest departures.
        .slice(0, stopViewerConfig.numberOfDepartures)
    } else {
      // Do not include pattern row if it has no stop times.
      return null
    }
    const routeName = route.shortName ? route.shortName : route.longName
    return (
      <>
        {/* header row */}
        <div className='header'>
          {/* route name */}
          <div className='route-name'>
            <b>{routeName}</b> To {pattern.headsign}
          </div>
        </div>
        <div>
          <div className='trip-table'>
            {/* trips table header row */}
            <div className='header'>
              <div className='cell' />
              <div className='cell'>BLOCK</div>
              <div className='cell time-column'>DEPARTURE</div>
            </div>

            {/* list of upcoming trips */}
            {hasStopTimes && (
              sortedStopTimes.map((stopTime, i) => {
                // Get formatted scheduled departure time.
                const time = getFormattedStopTime(stopTime, homeTimezone, stopViewerArriving, timeFormat, true)
                return (
                  <div
                    className='trip-row'
                    style={{ display: 'table-row', marginTop: 6, fontSize: 14 }}
                    key={i}>
                    <div className='cell'>
                      To {stopTime.headsign}
                    </div>
                    <div className='cell' style={{textAlign: 'center'}}>
                      {stopTime.blockId}
                    </div>
                    <div className='cell time-column'>
                      {time}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </>
    )
  }

  render () {
    return (
      <div className='route-row'>
        {this.props.showScheduleView
          ? this._renderScheduleView()
          : this._renderNextArrivalsView()
        }
      </div>
    )
  }
}

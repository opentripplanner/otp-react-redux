import coreUtils from '@opentripplanner/core-utils'
import React, { Component, createRef } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { isBlank } from '../../util/ui'
import {
  excludeLastStop,
  getRouteIdForPattern,
  getSecondsUntilDeparture,
  getStopTimesByPattern,
  stopTimeComparator
} from '../../util/viewer'
import StopTimeCell from './stop-time-cell'

const { getTimeFormat } = coreUtils.time

// Styles for the schedule table and its contents.
const StyledTable = styled.table`
  border-spacing: collapse;
  height: 100%;
  width: 100%;
  th {
    background-color: #fff;
    box-shadow: 0 1px 0px 0px #ccc;
    font-size: 75%;
    position: sticky;
    top: 0px;
  }
  tr > * {
    border-bottom: 1px solid #ccc;
    padding: 2px 0 2px 10px;
    vertical-align: top;
  }
  td:first-child, th:first-child {
    padding-left: 0;
  }
`

const RouteCell = styled.td`
  font-weight: bold;
`
const TimeCell = styled.td`
  font-weight: bold;
  text-align: right;
  white-space: nowrap;
`

class StopScheduleTable extends Component {
  firstDepartureRef = createRef()

  /*
   * Scroll to the first stop time that is departing from now.
   */
  _scrollToFirstDeparture = () => {
    const { current } = this.firstDepartureRef
    if (current) {
      current.scrollIntoView()
    }
  }

  componentDidMount () {
    this._scrollToFirstDeparture()
  }

  componentDidUpdate () {
    // Should only happen if user changes date and a new stopData is passed.
    this._scrollToFirstDeparture()
  }

  render () {
    const { homeTimezone, stopData, stopViewerArriving, timeFormat } = this.props
    const stopTimesByPattern = getStopTimesByPattern(stopData)

    // Merge stop times, so that we can sort them across all route patterns.
    // (stopData is assumed valid per StopViewer render condition.)
    let mergedStopTimes = []
    Object.values(stopTimesByPattern).forEach(({ pattern, route, times }) => {
      // TODO: refactor the IF block below (copied fromn StopViewer).
      // Only add pattern if route is found.
      // FIXME: there is currently a bug with the alernative transit index
      // where routes are not associated with the stop if the only stoptimes
      // for the stop are drop off only. See https://github.com/ibi-group/trimet-mod-otp/issues/217
      if (!route) {
        console.warn(`Cannot render stop times for missing route ID: ${getRouteIdForPattern(pattern)}`)
        return
      }

      const filteredTimes = times
        .filter(excludeLastStop)
        .map(stopTime => {
          // Add the route attribute and headsign to each stop time for rendering route info.
          const headsign = isBlank(stopTime.headsign) ? pattern.headsign : stopTime.headsign
          return {
            ...stopTime,
            route,
            headsign
          }
        })
      mergedStopTimes = mergedStopTimes.concat(filteredTimes)
    })

    mergedStopTimes = mergedStopTimes.sort(stopTimeComparator)

    // Find the next stop time that is departing. We will scroll to that stop time entry.
    let firstDepartureFromNow
    if (mergedStopTimes.length) {
      // Search starting from the last stop time (largest seconds until departure) for this pattern.
      const lastStopTime = mergedStopTimes[mergedStopTimes.length - 1]

      firstDepartureFromNow = mergedStopTimes.reduce((firstStopTime, stopTime) => {
        const firstStopTimeSeconds = getSecondsUntilDeparture(firstStopTime, true)
        const stopTimeSeconds = getSecondsUntilDeparture(stopTime, true)

        return stopTimeSeconds < firstStopTimeSeconds && stopTimeSeconds >= 0
          ? stopTime
          : firstStopTime
      }, lastStopTime)
    }

    return (
      <StyledTable>
        <thead>
          <tr>
            <th>Block</th>
            <th>Route</th>
            <th>To</th>
            <th>Departure</th>
          </tr>
        </thead>
        <tbody>
          {mergedStopTimes.map((stopTime, index) => {
            const { blockId, headsign, route } = stopTime
            const routeName = route.shortName ? route.shortName : route.longName
            // Add ref to scroll to the first stop time departing from now.
            const refProp = stopTime === firstDepartureFromNow ? this.firstDepartureRef : null

            return (
              <tr key={index} ref={refProp}>
                <td>{blockId}</td>
                <RouteCell>{routeName}</RouteCell>
                <td>{headsign}</td>
                <TimeCell>
                  <StopTimeCell
                    homeTimezone={homeTimezone}
                    showIcon={false}
                    soonText={stopViewerArriving}
                    stopTime={stopTime}
                    timeFormat={timeFormat}
                    useCountdown={false}
                    useSchedule
                  />
                </TimeCell>
              </tr>
            )
          })}
        </tbody>
      </StyledTable>
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  const { config, transitIndex, ui } = state.otp
  return {
    homeTimezone: config.homeTimezone,
    stopData: transitIndex.stops[ui.viewedStop.stopId],
    stopViewerArriving: config.language.stopViewerArriving,
    timeFormat: getTimeFormat(config)
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(StopScheduleTable)

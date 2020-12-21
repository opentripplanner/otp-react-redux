import moment from 'moment'
import React, { Component, createRef } from 'react'
import styled from 'styled-components'

import { isBlank } from '../../util/ui'
import {
  excludeLastStop,
  getRouteIdForPattern,
  getSecondsUntilDeparture,
  getStopTimesByPattern,
  routeIsValid,
  stopTimeComparator
} from '../../util/viewer'
import StopTimeCell from './stop-time-cell'

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

/**
 * Table showing scheduled departure times for the specified stop organized
 * chronologically.
 */
class StopScheduleTable extends Component {
  targetDepartureRef = createRef()

  /*
   * Scroll to the first stop time that is departing from now.
   */
  _scrollToFirstDeparture = () => {
    const { current } = this.targetDepartureRef
    if (current) {
      current.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
    const { date, homeTimezone, stopData, timeFormat } = this.props
    const stopTimesByPattern = getStopTimesByPattern(stopData)

    // Merge stop times, so that we can sort them across all route patterns.
    // (stopData is assumed valid per StopViewer render condition.)
    let mergedStopTimes = []
    Object.values(stopTimesByPattern).forEach(({ pattern, route, times }) => {
      // Only add pattern if route info is returned by OTP.
      if (routeIsValid(route, getRouteIdForPattern(pattern))) {
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
      }
    })

    mergedStopTimes = mergedStopTimes.sort(stopTimeComparator)
    const today = moment().startOf('day').format('YYYY-MM-DD')
    // Find the next stop time that is departing.
    // We will scroll to that stop time entry (if showing schedules for today).
    let firstDepartureFromNow
    if (mergedStopTimes.length && date === today) {
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
            // Highlight if this row is the imminent departure.
            const highlightRow = stopTime === firstDepartureFromNow
            const className = highlightRow ? 'highlighted-item' : null
            // FIXME: This is a bit of a hack to account for the sticky table
            // header interfering with the scrollIntoView. If the next stop time
            // is the imminent departure, we'll set the scrollTo to this row (the
            // stop time prior), which effectively applies an offset for the
            // scroll. If next row does not exist, default to this row.
            const nextStopTime = mergedStopTimes[index + 1]
            const scrollToRow = nextStopTime
              ? nextStopTime === firstDepartureFromNow
              : highlightRow
            const routeName = route.shortName ? route.shortName : route.longName
            // Add ref to scroll to the first stop time departing from now.
            const refProp = scrollToRow ? this.targetDepartureRef : null
            return (
              <tr key={index} className={className} ref={refProp}>
                <td>{blockId}</td>
                <RouteCell>{routeName}</RouteCell>
                <td>{headsign}</td>
                <TimeCell>
                  <StopTimeCell
                    homeTimezone={homeTimezone}
                    showIcon={false}
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

export default StopScheduleTable

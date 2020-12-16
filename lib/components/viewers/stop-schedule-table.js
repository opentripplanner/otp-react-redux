import coreUtils from '@opentripplanner/core-utils'
import React, { Component, createRef } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { isBlank } from '../../util/ui'
import {
  excludeLastStop,
  getFormattedStopTime,
  getSecondsUntilDeparture,
  getStopTimesByPattern,
  stopTimeComparator
} from '../../util/viewer'

const { getTimeFormat } = coreUtils.time

// Styles for the schedule table and its contents.
const StyledTable = styled.table`
  border-spacing: collapse;
  margin-top: 20px;
  width: 100%;
  th {
    font-size: 75%;
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
    this._scrollToFirstDeparture()
  }

  render () {
    const { homeTimezone, stopData, stopViewerArriving, timeFormat } = this.props
    const hasStopTimesAndRoutes = !!(stopData && stopData.stopTimes && stopData.stopTimes.length > 0 && stopData.routes)

    if (!hasStopTimesAndRoutes) {
      return <div>No stop times found for date.</div>
    }

    const stopTimesByPattern = getStopTimesByPattern(stopData)

    // Merge stop times, so that we can sort them across all route patterns.
    let mergedStopTimes = []
    Object.values(stopTimesByPattern).forEach(({ pattern, route, times }) => {
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
            const time = getFormattedStopTime(stopTime, homeTimezone, stopViewerArriving, timeFormat, true, false, false)
            // Add ref to scroll to the first stop time departing from now.
            const refProp = stopTime === firstDepartureFromNow ? this.firstDepartureRef : null

            return (
              <tr key={index} ref={refProp}>
                <td>{blockId}</td>
                <RouteCell>{routeName}</RouteCell>
                <td>{headsign}</td>
                <TimeCell>{time}</TimeCell>
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

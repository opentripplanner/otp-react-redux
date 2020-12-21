import moment from 'moment'
import React, { Component, createRef } from 'react'
import styled from 'styled-components'

import {
  formatDepartureTime,
  getFirstDepartureFromNow,
  mergeAndSortStopTimes
} from '../../util/viewer'

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

  /**
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
    const mergedStopTimes = mergeAndSortStopTimes(stopData)

    // FIXME: Shift today back one day if the current time is between midnight and the end of the service day.
    const today = moment().startOf('day').format('YYYY-MM-DD')
    // Find the next stop time that is departing.
    // We will scroll to that stop time entry (if showing schedules for today).
    const shouldHighlightFirstDeparture = mergedStopTimes.length && date === today
    const highlightedStopTime = shouldHighlightFirstDeparture
      ? getFirstDepartureFromNow(mergedStopTimes)
      : null

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
            // Highlight if this row is the imminent departure and schedule is shown for today.
            const highlightRow = stopTime === highlightedStopTime
            const className = highlightRow ? 'highlighted-item' : null
            // FIXME: This is a bit of a hack to account for the sticky table
            // header interfering with the scrollIntoView. If the next stop time
            // is the imminent departure, we'll set the scrollTo to this row (the
            // stop time prior), which effectively applies an offset for the
            // scroll. If next row does not exist, default to this row.
            const nextStopTime = mergedStopTimes[index + 1]
            const scrollToRow = nextStopTime
              ? nextStopTime === highlightedStopTime
              : highlightRow
            const routeName = route.shortName ? route.shortName : route.longName
            const formattedTime = formatDepartureTime(
              stopTime.scheduledDeparture,
              timeFormat,
              homeTimezone
            )

            // Add ref to scroll to the first stop time departing from now.
            const refProp = scrollToRow ? this.targetDepartureRef : null
            return (
              <tr key={index} className={className} ref={refProp}>
                <td>{blockId}</td>
                <RouteCell>{routeName}</RouteCell>
                <td>{headsign}</td>
                <TimeCell>{formattedTime}</TimeCell>
              </tr>
            )
          })}
        </tbody>
      </StyledTable>
    )
  }
}

export default StopScheduleTable

import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { isBlank } from '../../util/ui'
import { getFormattedStopTime, getStopTimesByPattern } from '../../util/viewer'

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

const DestHeader = styled.th`
  width: 100%;
`
const RouteCell = styled.td`
  font-weight: bold;
`
const DestCell = styled.td`
  width: 100%;
`
const TimeCell = styled.td`
  font-weight: bold;
  text-align: right;
  white-space: nowrap;
`

class StopScheduleTable extends Component {
  render () {
    const { homeTimezone, stopData, stopViewerArriving, timeFormat } = this.props
    const hasStopTimesAndRoutes = !!(stopData && stopData.stopTimes && stopData.stopTimes.length > 0 && stopData.routes)

    if (!hasStopTimesAndRoutes) {
      return <div>No stop times found for date.</div>
    }

    const stopTimesByPattern = getStopTimesByPattern(stopData)

    // Merge stop times, so that we can sort them across all route patterns.
    let mergedStopTimes = []
    Object.values(stopTimesByPattern).forEach(pattern => { //TODO:breakup pattern vars
      const filteredTimes = pattern.times
        //TODO refactor - Copied from util/viewers
        .filter(stopTime => {
          return stopTime.stopIndex < stopTime.stopCount - 1 // ensure that this isn't the last stop
        })
        .map(stopTime => {
          // Add the route attribute and headsign to each stop time for rendering route info.
          const headsign = isBlank(stopTime.headsign) ? pattern.pattern.headsign : stopTime.headsign
          return {
            ...stopTime,
            route: pattern.route,
            headsign
          }
        })
      mergedStopTimes = mergedStopTimes.concat(filteredTimes) // reduce?
    })

    //TODO Refactor - Copied from pattern-row
    mergedStopTimes = mergedStopTimes.sort((a, b) => {
      const aTime = a.serviceDay + a.scheduledDeparture
      const bTime = b.serviceDay + b.scheduledDeparture
      return aTime - bTime
    })

    return (
      <StyledTable>
        <thead>
          <tr>
            <th>Block</th>
            <th>Route</th>
            <DestHeader>To</DestHeader>
            <th>Departure</th>
          </tr>
        </thead>
        <tbody>
          {mergedStopTimes.map((stopTime, index) => {
            const { blockId, headsign, route } = stopTime
            const routeName = route.shortName ? route.shortName : route.longName
            const time = getFormattedStopTime(stopTime, homeTimezone, stopViewerArriving, timeFormat, true, false, false)
            return (
              <tr key={index}>
                <td>{blockId}</td>
                <RouteCell>{routeName}</RouteCell>
                <DestCell>{headsign}</DestCell>
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

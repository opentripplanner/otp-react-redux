import { FormattedMessage } from 'react-intl'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore TYPESCRIPT TODO: wait for typescripted core-utils
import coreUtils from '@opentripplanner/core-utils'
import React, { Component, createRef } from 'react'
import styled from 'styled-components'

import { FETCH_STATUS } from '../../util/constants'
import { getFirstDepartureFromNow } from '../../util/viewer'
import { isBlank } from '../../util/ui'
import { mergeAndSortStopTimes } from '../../util/stop-times'
import { StopData } from '../util/types'
import Loading from '../narrative/loading'

import DepartureTime from './departure-time'

// Styles for the schedule table and its contents.
const StyledTable = styled.table`
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  th {
    background-color: var(--main-base-color, white);
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
  td:first-child,
  th:first-child {
    padding-left: 0;
  }
`

// Limit the width of the block cell if agency uses very long block IDs,
// otherwise the table contents overflows the width of the side pane.
// FIXME: Determine a good way to display long block ids.
const BlockCell = styled.td`
  max-width: 100px;
  overflow-x: hidden;
  text-overflow: ellipsis;
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
class StopScheduleTable extends Component<{
  date: string
  homeTimezone: string
  showBlockIds?: boolean
  stopData: StopData
}> {
  /**
   * Link to the DOM for the next departure row, so we can scroll to it if needed.
   */
  targetDepartureRef = createRef<HTMLTableRowElement>()

  /**
   * Scroll to the first stop time that is departing from now.
   */
  _scrollToFirstDeparture = (): void => {
    const { current } = this.targetDepartureRef
    if (current) {
      current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  componentDidMount(): void {
    this._scrollToFirstDeparture()
  }

  componentDidUpdate(): void {
    // Should only happen if user changes date and a new stopData is passed.
    this._scrollToFirstDeparture()
  }

  render(): JSX.Element {
    const { date, homeTimezone, showBlockIds, stopData } = this.props
    // Show loading spinner if times are still being fetched.
    if (stopData.fetchStatus === FETCH_STATUS.FETCHING) {
      return <Loading small />
    }
    const mergedStopTimes = mergeAndSortStopTimes(stopData)

    const today = coreUtils.time.getCurrentDate(homeTimezone)

    // Find the next stop time that is departing.
    // We will scroll to that stop time entry (if showing schedules for today).
    const shouldHighlightFirstDeparture =
      mergedStopTimes.length && date === today
    const highlightedStopTime = shouldHighlightFirstDeparture
      ? getFirstDepartureFromNow(mergedStopTimes)
      : null

    return (
      <StyledTable>
        <thead>
          <tr>
            {showBlockIds && (
              <th scope="col">
                <FormattedMessage id="components.StopScheduleTable.block" />
              </th>
            )}
            <th scope="col">
              <FormattedMessage id="components.StopScheduleTable.route" />
            </th>
            <th scope="col">
              <FormattedMessage id="components.StopScheduleTable.destination" />
            </th>
            <th scope="col">
              <FormattedMessage id="components.StopScheduleTable.departure" />
            </th>
          </tr>
        </thead>
        <tbody>
          {mergedStopTimes.map((stopTime, index) => {
            const { blockId, headsign, route } = stopTime
            // Highlight if this row is the imminent departure and schedule is shown for today.
            const highlightRow = stopTime === highlightedStopTime
            const className = highlightRow ? 'highlighted-item' : ''
            // This is a bit of a hack to account for the sticky table
            // header interfering with the scrollIntoView. If the next stop time
            // is the imminent departure, we'll set the scrollTo to this row (the
            // stop time prior), which effectively applies an offset for the
            // scroll. If next row does not exist, default to this row.
            const nextStopTime = mergedStopTimes[index + 1]
            const scrollToRow = nextStopTime
              ? nextStopTime === highlightedStopTime
              : highlightRow
            const routeName = route
              ? !isBlank(route.shortName)
                ? route.shortName
                : route.longName
              : ''

            // Add ref to scroll to the first stop time departing from now.
            const refProp = scrollToRow ? this.targetDepartureRef : undefined

            return (
              <tr className={className} key={index} ref={refProp}>
                {showBlockIds && (
                  <BlockCell title={blockId}>{blockId}</BlockCell>
                )}
                <RouteCell>{routeName}</RouteCell>
                <td>{headsign}</td>
                <TimeCell>
                  <DepartureTime stopTime={stopTime} />
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

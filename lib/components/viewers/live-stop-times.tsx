import { format, utcToZonedTime } from 'date-fns-tz'
import { FormattedMessage, FormattedTime } from 'react-intl'
import { Redo } from '@styled-icons/fa-solid/Redo'
import { TransitOperator } from '@opentripplanner/types'
import coreUtils from '@opentripplanner/core-utils'
import isSameDay from 'date-fns/isSameDay'
import React, { Component } from 'react'

import {
  getRouteIdForPattern,
  getStopTimesByPattern,
  routeIsValid,
  stopTimeComparator
} from '../../util/viewer'
import { IconWithText } from '../util/styledIcon'
import FormattedDayOfWeek from '../util/formatted-day-of-week'
import SpanWithSpace from '../util/span-with-space'

import { addHours, isBefore } from 'date-fns'

import AmenitiesPanel from './amenities-panel'
import PatternRow from './pattern-row'
import RelatedStopsPanel from './related-stops-panel'

const { getUserTimezone } = coreUtils.time

const defaultState = {
  spin: false,
  timer: null
}

type Props = {
  autoRefreshStopTimes: boolean
  findStopTimesForStop: ({ stopId }: { stopId: string }) => void
  homeTimezone: string
  nearbyStops: any // TODO: shared types
  setHoveredStop: (stopId: string) => void
  showNearbyStops: boolean
  showOperatorLogo?: boolean
  // TODO: shared types
  stopData: any
  stopViewerArriving: React.ReactNode
  // TODO: shared types
  stopViewerConfig: any
  toggleAutoRefresh: (enable: boolean) => void
  // TODO: shared types
  transitOperators: any
  viewedStop: { stopId: string }
}

type State = {
  spin?: boolean
  timer?: number | null
}

/**
 * Table showing next arrivals (refreshing every 10 seconds) for the specified
 * stop organized by route pattern.
 */
class LiveStopTimes extends Component<Props, State> {
  state = defaultState

  _refreshStopTimes = (): void => {
    const { findStopTimesForStop, viewedStop } = this.props
    findStopTimesForStop({ stopId: viewedStop.stopId })
    // FIXME: We need to refresh child stop arrivals, but this could be a ton of
    // requests!!! Is there a better way?
    // Also, we probably need to refresh vehicle locations.
    // update: We could use the new endpoint, but that would still be a massive request
    // if (nearbyStops) {
    //   nearbyStops.forEach(s => { findStopTimesForStop({ stopId: s.id }) })
    // }
    this.setState({ spin: true })
    window.setTimeout(this._stopSpin, 1000)
  }

  _onToggleAutoRefresh = (): void => {
    const { autoRefreshStopTimes, toggleAutoRefresh } = this.props
    if (autoRefreshStopTimes) {
      toggleAutoRefresh(false)
    } else {
      // Turn on auto-refresh and refresh immediately to give user feedback.
      this._refreshStopTimes()
      toggleAutoRefresh(true)
    }
  }

  _stopSpin = (): void => this.setState({ spin: false })

  _startAutoRefresh = (): void => {
    const timer = window.setInterval(this._refreshStopTimes, 10000)
    this.setState({ timer })
  }

  _stopAutoRefresh = (): void => {
    if (!this.state.timer) return
    window.clearInterval(this.state.timer)
  }

  componentDidMount(): void {
    this._refreshStopTimes()
    // Turn on stop times refresh if enabled.
    if (this.props.autoRefreshStopTimes) this._startAutoRefresh()
  }

  componentWillUnmount(): void {
    // Turn off auto refresh unconditionally (just in case).
    this._stopAutoRefresh()
  }

  componentDidUpdate(prevProps: Props): void {
    if (
      prevProps.viewedStop &&
      this.props.viewedStop &&
      prevProps.viewedStop.stopId !== this.props.viewedStop.stopId
    ) {
      this._refreshStopTimes()
    }
    // Handle stopping or starting the auto refresh timer.
    if (prevProps.autoRefreshStopTimes && !this.props.autoRefreshStopTimes)
      this._stopAutoRefresh()
    else if (!prevProps.autoRefreshStopTimes && this.props.autoRefreshStopTimes)
      this._startAutoRefresh()
  }

  renderDay = (homeTimezone: string, day: number): JSX.Element => {
    const today = utcToZonedTime(Date.now(), homeTimezone)
    const formattedDay = utcToZonedTime(day * 1000, homeTimezone)
    return (
      <div className="day-container" key={day}>
        {/* If the service day is not today, add a label */}
        {!isSameDay(today, formattedDay) && (
          <p>
            <FormattedDayOfWeek
              // 'iiii' returns the long ISO day of the week (independent of browser locale).
              // See https://date-fns.org/v2.28.0/docs/format
              day={format(formattedDay, 'iiii', {
                timeZone: homeTimezone
              }).toLowerCase()}
            />
          </p>
        )}
      </div>
    )
  }

  render(): JSX.Element {
    const {
      homeTimezone,
      nearbyStops,
      setHoveredStop,
      showNearbyStops,
      showOperatorLogo,
      stopData,
      stopViewerArriving,
      stopViewerConfig,
      transitOperators
    } = this.props
    const { spin } = this.state
    const userTimezone = getUserTimezone()
    // construct a lookup table mapping pattern (e.g. 'ROUTE_ID-HEADSIGN') to
    // an array of stoptimes
    const stopTimesByPattern = getStopTimesByPattern(stopData)
    const now = utcToZonedTime(Date.now(), homeTimezone)

    // TODO: Shared types
    const patternComparator = (patternA: any, patternB: any) => {
      const stopTimesA = [].concat(patternA.times).sort(stopTimeComparator)
      const stopTimesB = [].concat(patternB.times).sort(stopTimeComparator)
      // sort by first departure time
      return stopTimeComparator(stopTimesA[0], stopTimesB[0])
    }

    const routeTimes = Object.values(stopTimesByPattern)
      .filter(({ times }) => times.length !== 0)
      .sort(patternComparator)
      .map((route) => {
        const sortedTimes = route.times
          .concat()
          ?.sort(stopTimeComparator)
          // Only show times within 24 hours of next arrival time
          .filter((time: any, i: number, array: Array<any>) => {
            const firstDepartureTime =
              array[0].serviceDay + array[0].realtimeDeparture
            const departureTime = time.serviceDay + time.realtimeDeparture
            return i === 0 || (departureTime - firstDepartureTime) / 3600 < 24
          })
        const { serviceDay } = sortedTimes[0]
        return {
          ...route,
          day: serviceDay,
          times: sortedTimes
        }
      })
      .filter(({ pattern, route }) =>
        routeIsValid(route, getRouteIdForPattern(pattern))
      )
      .filter((route) => {
        /* If the route's first departure time falls on the 2nd available service day,
      only show it if it's within 6 hours of now. */
        if (!isSameDay(utcToZonedTime(route.day * 1000, homeTimezone), now)) {
          const departureTime = route.times[0].realtimeDeparture + route.day
          return isBefore(departureTime * 1000, addHours(now, 6))
        }
        return route
      })

    return (
      <>
        <div className="departures">
          <ul className="route-row-container">
            {routeTimes.map((time: any, index: number) => {
              const { id, pattern, route, times } = time
              return (
                <React.Fragment key={id}>
                  {((index > 0 &&
                    !isSameDay(time.day, routeTimes[index - 1])) ||
                    // TODO: is new Date() the right approach?
                    (index === 0 && !isSameDay(new Date(), time.day))) &&
                    this.renderDay(homeTimezone, time.day)}
                  <PatternRow
                    homeTimezone={homeTimezone}
                    pattern={pattern}
                    route={{
                      ...route,
                      operator: transitOperators.find(
                        (o: TransitOperator) => o.agencyId === route.agencyId
                      )
                    }}
                    showOperatorLogo={showOperatorLogo}
                    stopTimes={times}
                    stopViewerArriving={stopViewerArriving}
                    stopViewerConfig={stopViewerConfig}
                  />
                </React.Fragment>

              )
            })}
          </ul>
        </div>

        {/* Auto update controls for realtime arrivals */}
        <div style={{ marginTop: '20px' }}>
          {/* eslint-disable-next-line jsx-a11y/label-has-for */}
          <label style={{ fontSize: 'small', fontWeight: 300 }}>
            <SpanWithSpace margin={0.25}>
              <input
                defaultChecked={this.props.autoRefreshStopTimes}
                name="autoUpdate"
                onChange={this._onToggleAutoRefresh}
                type="checkbox"
                value={this.props.autoRefreshStopTimes?.toString()}
              />
            </SpanWithSpace>
            <FormattedMessage id="components.LiveStopTimes.autoRefresh" />
          </label>
          <button
            // Functionality is provided by auto-refresh, this only adds confusion
            // in a screen reader context
            aria-hidden
            className="link-button pull-right percy-hide"
            onClick={this._refreshStopTimes}
            style={{ fontSize: 'small' }}
          >
            <IconWithText Icon={Redo} spin={spin}>
              <FormattedTime
                timeStyle="short"
                timeZone={userTimezone}
                value={stopData.stopTimesLastUpdated}
              />
            </IconWithText>
          </button>
          {showNearbyStops && (
            <>
              <RelatedStopsPanel
                homeTimezone={homeTimezone}
                nearbyStops={nearbyStops}
                setHoveredStop={setHoveredStop}
                stopData={stopData}
                stopViewerArriving={stopViewerArriving}
                stopViewerConfig={stopViewerConfig}
                transitOperators={transitOperators}
              />
              <AmenitiesPanel stopData={stopData} />
            </>
          )}
        </div>
      </>
    )
  }
}

export default LiveStopTimes

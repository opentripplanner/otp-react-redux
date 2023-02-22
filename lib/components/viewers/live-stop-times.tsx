import { format, utcToZonedTime } from 'date-fns-tz'
import { FormattedMessage, FormattedTime } from 'react-intl'
import { Redo } from '@styled-icons/fa-solid/Redo'
import { TransitOperator } from '@opentripplanner/types'
import coreUtils from '@opentripplanner/core-utils'

import FormattedDayOfWeek from '../util/formatted-day-of-week'
import isSameDay from 'date-fns/isSameDay'
import React, { Component } from 'react'

import {
  getRouteIdForPattern,
  getStopTimesByPattern,
  routeIsValid,
  stopTimeComparator
} from '../../util/viewer'
import { IconWithText } from '../util/styledIcon'
import SpanWithSpace from '../util/span-with-space'

import AmenitiesPanel from './amenities-panel'
import PatternRow from './pattern-row'
import RelatedStopsPanel from './related-stops-panel'

const { getUserTimezone } = coreUtils.time

const defaultState = {
  spin: false,
  timer: null
}

const ONE_DAY_IN_SECONDS = 86400

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
        return {
          ...route,
          times: route.times.concat()?.sort(stopTimeComparator)
        }
      })
      .filter(({ pattern, route }) =>
        routeIsValid(route, getRouteIdForPattern(pattern))
      )

    const routesByDay: any = []
    const firstDayOfService = routeTimes[0].times[0].serviceDay

    // Loop through all routes, and sort based on that route's next available day of service.
    routeTimes.forEach((route) => {
      const { serviceDay } = route.times[0]
      const daysPastFirstService =
        (serviceDay - firstDayOfService) / ONE_DAY_IN_SECONDS

      // Create a separate array for each service day
      routesByDay[daysPastFirstService]
        ? routesByDay[daysPastFirstService].push(route)
        : routesByDay.push([route])
    })

    return (
      <>
        <div className="departures">
          {routesByDay.length > 0 && (
            <div className="list-container">
              {routesByDay.map((routes: any) => {
                const { serviceDay } = routes[0].times[0]
                return (
                  <div className="day-container" key={routes.id}>
                    {/* If the service day is not today, add a label */}
                    {!isSameDay(
                      // service day has to be converted to milliseconds
                      serviceDay * 1000,
                      utcToZonedTime(Date.now(), homeTimezone)
                    ) && (
                      <p>
                        <FormattedDayOfWeek
                          // 'iiii' returns the long ISO day of the week (independent of browser locale).
                          // See https://date-fns.org/v2.28.0/docs/format
                          day={format(serviceDay * 1000, 'iiii', {
                            timeZone: homeTimezone
                          }).toLowerCase()}
                        />
                      </p>
                    )}
                    <ul className="route-row-container">
                      {routes.map((time: any) => {
                        const { id, pattern, route, times } = time
                        return (
                          <PatternRow
                            homeTimezone={homeTimezone}
                            key={id}
                            pattern={pattern}
                            route={{
                              ...route,
                              operator: transitOperators.find(
                                (o: TransitOperator) =>
                                  o.agencyId === route.agencyId
                              )
                            }}
                            showOperatorLogo={showOperatorLogo}
                            stopTimes={times}
                            stopViewerArriving={stopViewerArriving}
                            stopViewerConfig={stopViewerConfig}
                          />
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
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

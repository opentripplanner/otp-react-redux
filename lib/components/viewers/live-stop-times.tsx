import { addDays, isBefore } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'
import {
  FormattedMessage,
  FormattedTime,
  injectIntl,
  IntlShape
} from 'react-intl'
import { Redo } from '@styled-icons/fa-solid/Redo'
import { TransitOperator } from '@opentripplanner/types'
import coreUtils from '@opentripplanner/core-utils'
import isSameDay from 'date-fns/isSameDay'
import React, { Component } from 'react'

import {
  getRouteIdForPattern,
  getStopTimesByPattern,
  patternComparator,
  routeIsValid,
  stopTimeComparator
} from '../../util/viewer'
import { IconWithText } from '../util/styledIcon'
import FormattedDayOfWeek from '../util/formatted-day-of-week'
import SpanWithSpace from '../util/span-with-space'

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
  intl: IntlShape
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

  renderDay = (homeTimezone: string, day: number, now: Date): JSX.Element => {
    const formattedDay = utcToZonedTime(day * 1000, homeTimezone)
    return (
      <React.Fragment key={day}>
        {/* If the service day is not today, add a label */}
        {!isSameDay(now, formattedDay) && (
          <p aria-hidden className="day-label">
            <FormattedDayOfWeek
              // 'iiii' returns the long ISO day of the week (independent of browser locale).
              // See https://date-fns.org/v2.28.0/docs/format
              day={format(formattedDay, 'iiii', {
                timeZone: homeTimezone
              }).toLowerCase()}
            />
          </p>
        )}
      </React.Fragment>
    )
  }

  render(): JSX.Element {
    const {
      homeTimezone,
      intl,
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

    // Time range is set in seconds, so convert to days
    const timeRange = stopViewerConfig.timeRange / 86400 || 2

    const refreshButtonText = intl.formatMessage({
      id: 'components.LiveStopTimes.refresh'
    })

    const routeTimes = Object.values(stopTimesByPattern)
      .filter(
        ({ pattern, route, times }) =>
          times &&
          times.length !== 0 &&
          routeIsValid(route, getRouteIdForPattern(pattern))
      )
      .sort(patternComparator)
      .map((route) => {
        const sortedTimes = route.times
          .concat()
          ?.sort(stopTimeComparator)
          // filter any times according to time range set in config.
          .filter((time: any, i: number, array: Array<any>) => {
            const departureTime = time.serviceDay + time.realtimeDeparture
            return isBefore(departureTime, addDays(now, timeRange))
          })
        const { serviceDay } = sortedTimes[0]
        return {
          ...route,
          day: serviceDay || null,
          times: sortedTimes
        }
      })
      // if the time range filter removes all times, remove route
      .filter(({ times }) => times.length !== 0)

    return (
      <>
        <ul className="route-row-container">
          {routeTimes.map((time: any, index: number) => {
            const { id, pattern, route, times } = time
            return (
              <React.Fragment key={id}>
                {((index > 0 &&
                  !isSameDay(
                    time.day * 1000,
                    routeTimes[index - 1]?.day * 1000
                  )) ||
                  (index === 0 && !isSameDay(now, time.day * 1000))) &&
                  this.renderDay(homeTimezone, time.day, now)}
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
            aria-label={refreshButtonText}
            className="link-button pull-right percy-hide"
            onClick={this._refreshStopTimes}
            style={{ fontSize: 'small' }}
            title={refreshButtonText}
          >
            <IconWithText
              Icon={Redo}
              spin={spin}
              styleProps={{ display: 'flex', gap: '5px' }}
            >
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

export default injectIntl(LiveStopTimes)

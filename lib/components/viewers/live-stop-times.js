import moment from 'moment'
import 'moment-timezone'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'

import Icon from '../util/icon'
import {
  getRouteIdForPattern,
  getStopTimesByPattern,
  routeIsValid
} from '../../util/viewer'

import AmenitiesPanel from './amenities-panel'
import PatternRow from './pattern-row'
import RelatedStopsPanel from './related-stops-panel'

const { getUserTimezone } = coreUtils.time

const defaultState = {
  spin: false,
  timer: null
}

/**
 * Table showing next arrivals (refreshing every 10 seconds) for the specified
 * stop organized by route pattern.
 */
class LiveStopTimes extends Component {
  state = defaultState

  _refreshStopTimes = () => {
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

  _onToggleAutoRefresh = () => {
    const { autoRefreshStopTimes, toggleAutoRefresh } = this.props
    if (autoRefreshStopTimes) {
      toggleAutoRefresh(false)
    } else {
      // Turn on auto-refresh and refresh immediately to give user feedback.
      this._refreshStopTimes()
      toggleAutoRefresh(true)
    }
  }

  _stopSpin = () => this.setState({ spin: false })

  _startAutoRefresh = () => {
    const timer = window.setInterval(this._refreshStopTimes, 10000)
    this.setState({ timer })
  }

  _stopAutoRefresh = () => {
    window.clearInterval(this.state.timer)
  }

  componentDidMount () {
    this._refreshStopTimes()
    // Turn on stop times refresh if enabled.
    if (this.props.autoRefreshStopTimes) this._startAutoRefresh()
  }

  componentWillUnmount () {
    // Turn off auto refresh unconditionally (just in case).
    this._stopAutoRefresh()
  }

  componentDidUpdate (prevProps) {
    if (
      prevProps.viewedStop &&
      this.props.viewedStop &&
      prevProps.viewedStop.stopId !== this.props.viewedStop.stopId
    ) {
      this._refreshStopTimes()
    }
    // Handle stopping or starting the auto refresh timer.
    if (prevProps.autoRefreshStopTimes && !this.props.autoRefreshStopTimes) this._stopAutoRefresh()
    else if (!prevProps.autoRefreshStopTimes && this.props.autoRefreshStopTimes) this._startAutoRefresh()
  }

  render () {
    const {
      homeTimezone,
      nearbyStops,
      setHoveredStop,
      showNearbyStops,
      stopData,
      stopViewerArriving,
      stopViewerConfig,
      timeFormat,
      transitOperators
    } = this.props
    const { spin } = this.state
    // construct a lookup table mapping pattern (e.g. 'ROUTE_ID-HEADSIGN') to
    // an array of stoptimes
    const stopTimesByPattern = getStopTimesByPattern(stopData)
    const routeComparator = coreUtils.route.makeRouteComparator(
      transitOperators
    )
    const patternHeadsignComparator = coreUtils.route.makeStringValueComparator(
      pattern => pattern.pattern.headsign
    )
    const patternComparator = (patternA, patternB) => {
      // first sort by routes
      const routeCompareValue = routeComparator(
        patternA.route,
        patternB.route
      )
      if (routeCompareValue !== 0) return routeCompareValue

      // if same route, sort by headsign
      return patternHeadsignComparator(patternA, patternB)
    }

    return (
      <>
        <div>
          {Object.values(stopTimesByPattern)
            .sort(patternComparator)
            .map(({ id, pattern, route, times }) => {
              // Only add pattern if route info is returned by OTP.
              return routeIsValid(route, getRouteIdForPattern(pattern))
                ? (
                  <PatternRow
                    homeTimezone={homeTimezone}
                    key={id}
                    pattern={pattern}
                    route={route}
                    stopTimes={times}
                    stopViewerArriving={stopViewerArriving}
                    stopViewerConfig={stopViewerConfig}
                    timeFormat={timeFormat}
                  />
                )
                : null
            })
          }
        </div>

        {/* Auto update controls for realtime arrivals */}
        <div style={{ marginTop: '20px' }}>
          {/* eslint-disable-next-line jsx-a11y/label-has-for */}
          <label style={{ fontSize: 'small', fontWeight: 300 }}>
            <input
              checked={this.props.autoRefreshStopTimes}
              name='autoUpdate'
              onChange={this._onToggleAutoRefresh}
              type='checkbox'
            />{' '}Auto-refresh arrivals?
          </label>
          <button
            className='link-button pull-right'
            onClick={this._refreshStopTimes}
            style={{ fontSize: 'small' }}
          >
            <Icon
              className={spin ? 'fa-spin' : ''}
              type='refresh' />{' '}
            {moment(stopData.stopTimesLastUpdated)
              .tz(getUserTimezone())
              .format(timeFormat)}
          </button>
          {showNearbyStops &&
            <>
              <RelatedStopsPanel
                homeTimezone={homeTimezone}
                nearbyStops={nearbyStops}
                setHoveredStop={setHoveredStop}
                stopData={stopData}
                stopViewerArriving={stopViewerArriving}
                stopViewerConfig={stopViewerConfig}
                timeFormat={timeFormat} />
              <AmenitiesPanel
                stopData={stopData}
                stopViewerArriving={stopViewerArriving}
                stopViewerConfig={stopViewerConfig}
                timeFormat={timeFormat} />
            </>
          }
        </div>
      </>
    )
  }
}

export default LiveStopTimes

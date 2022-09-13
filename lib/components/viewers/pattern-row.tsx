import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
// @ts-expect-error no types available
import { VelocityTransitionGroup } from 'velocity-react'
import AnimateHeight from 'react-animate-height'
import React, { Component } from 'react'
import type { Route, Stop } from '@opentripplanner/types'

import { ComponentContext } from '../../util/contexts'
import {
  generateFakeLegForRouteRenderer,
  getContrastYIQ,
  stopTimeComparator
} from '../../util/viewer'
import { Pattern, StopTime, Time } from '../util/types'
import DefaultRouteRenderer from '../narrative/metro/default-route-renderer'
import Icon from '../util/icon'
import Strong from '../util/strong-text'

import RealtimeStatusLabel from './realtime-status-label'
import StopTimeCell from './stop-time-cell'

type Props = {
  homeTimezone?: any
  intl: IntlShape
  pattern: Pattern
  route: Route
  stopTimes: Time[]
  stopViewerArriving: React.ReactNode
  stopViewerConfig: { numberOfDepartures: number }
}
type State = { expanded: boolean }
/**
 * Represents a single pattern row for displaying arrival times in the stop
 * viewer.
 */
class PatternRow extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { expanded: false }
  }

  static contextType = ComponentContext

  _toggleExpandedView = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  render() {
    const { RouteRenderer: CustomRouteRenderer } = this.context
    const RouteRenderer = CustomRouteRenderer || DefaultRouteRenderer
    const { homeTimezone, intl, pattern, route, stopTimes, stopViewerConfig } =
      this.props

    // sort stop times by next departure
    let sortedStopTimes: Time[] = []
    const hasStopTimes = stopTimes && stopTimes.length > 0
    if (hasStopTimes) {
      sortedStopTimes = stopTimes
        .concat()
        .sort(stopTimeComparator)
        // We request only x departures per pattern, but the patterns are merged
        // according to shared headsigns, so we need to slice the stop times
        // here as well to ensure only x times are shown per route/headsign combo.
        // This is applied after the sort, so we're keeping the soonest departures.
        .slice(0, stopViewerConfig.numberOfDepartures)
    } else {
      // Do not render pattern row if it has no stop times.
      return null
    }

    const routeName = route.shortName ? route.shortName : route.longName
    const routeColor = route.color ? `#${route.color}` : '#333'

    return (
      <div className="route-row" role="table">
        {/* header row */}
        <div
          className="header"
          role="row"
          style={{
            backgroundColor: routeColor,
            color: `#${getContrastYIQ(routeColor)}`
          }}
        >
          {/* route name */}
          <div className="route-name">
            <strong
              style={
                routeName && routeName?.length >= 4 ? { fontSize: '3vb' } : {}
              }
            >
              <RouteRenderer leg={generateFakeLegForRouteRenderer(route)} />
            </strong>
            <span>{pattern.headsign}</span>
          </div>
          {/* next departure preview */}
          {hasStopTimes && (
            <div className="next-trip-preview">
              {[0, 1, 2].map(
                (index) =>
                  sortedStopTimes?.[index] && (
                    <span>
                      <StopTimeCell
                        homeTimezone={homeTimezone}
                        key={index}
                        stopTime={sortedStopTimes[index]}
                      />
                    </span>
                  )
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default injectIntl(PatternRow)

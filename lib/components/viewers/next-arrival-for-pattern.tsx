import { injectIntl, IntlShape } from 'react-intl'
import { Route } from '@opentripplanner/types'
import React, { useContext } from 'react'

import { ComponentContext } from '../../util/contexts'
import {
  extractHeadsignFromPattern,
  generateFakeLegForRouteRenderer,
  getContrastYIQ,
  stopTimeComparator
} from '../../util/viewer'
import DefaultRouteRenderer from '../narrative/metro/default-route-renderer'
import type { Pattern, Time } from '../util/types'

import StopTimeCell from './stop-time-cell'

type Props = {
  homeTimezone?: string
  intl: IntlShape
  pattern: Pattern
  route: Route
  stopTimes: Time[]
  stopViewerArriving: React.ReactNode
  stopViewerConfig: { numberOfDepartures: number }
}
/**
 * Shows the next arrival for a pattern within the related stops view.
 */
function NextArrivalForPattern(props: Props) {
  const { homeTimezone, intl, pattern, route, stopTimes, stopViewerConfig } =
    props

  // @ts-expect-error React context is populated dynamically
  const { RouteRenderer: CustomRouteRenderer } = useContext(ComponentContext)
  const RouteRenderer = CustomRouteRenderer || DefaultRouteRenderer

  // sort stop times by next departure
  let sortedStopTimes = []
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
  // Splitting on the route name allows us to remove the route name from head sign,
  // should the GTFS include it
  let headsign = extractHeadsignFromPattern(pattern).split(`${routeName} `)
  // If the route name is not embedded, this will select the single element.
  // If the route name is embedded, this will select only the second component
  headsign = headsign[headsign.length - 1]
  const toHeadsign = intl.formatMessage(
    { id: 'common.routing.routeToHeadsign' },
    { headsign }
  )
  const title = `${routeName} ${toHeadsign}`

  return (
    <div
      className="next-arrival-row"
      style={{
        backgroundColor: '#' + route.color,
        color: '#' + getContrastYIQ(route.color)
      }}
    >
      {/* route name */}
      <div className="next-arrival-label overflow-ellipsis" title={title}>
        <span className="route-name">
          <RouteRenderer leg={generateFakeLegForRouteRenderer(route)} />
        </span>
        {toHeadsign}
      </div>
      {/* next departure preview */}
      {hasStopTimes && (
        <div className="next-arrival-time">
          <StopTimeCell
            homeTimezone={homeTimezone}
            stopTime={sortedStopTimes[0]}
          />
        </div>
      )}
    </div>
  )
}

export default injectIntl(NextArrivalForPattern)

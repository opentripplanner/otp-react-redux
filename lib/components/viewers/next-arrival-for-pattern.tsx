import { getMostReadableTextColor } from '@opentripplanner/core-utils/lib/route'
import { injectIntl, IntlShape } from 'react-intl'
import { Route } from '@opentripplanner/types'
import React, { useContext } from 'react'

import { ComponentContext } from '../../util/contexts'
import {
  extractHeadsignFromPattern,
  generateFakeLegForRouteRenderer,
  routeNameFontSize,
  stopTimeComparator
} from '../../util/viewer'
import DefaultRouteRenderer from '../narrative/metro/default-route-renderer'
import type { Pattern, Time } from '../util/types'

import StopTimeCell from './stop-time-cell'

type Props = {
  homeTimezone?: string
  intl: IntlShape
  pattern: Pattern
  // Not the true operator type, but the one that's used here
  // It is annoying to shoehorn the operator in here like this, but passing
  // it in individually would cause a situation where a list of routes
  // needs to be matched up with a list of operators
  route: Route & { operator?: { colorMode?: string } }
  routeColor: string
  stopTimes: Time[]
  stopViewerArriving: React.ReactNode
  stopViewerConfig: { numberOfDepartures: number }
}
/**
 * Shows the next arrival for a pattern within the related stops view.
 */
function NextArrivalForPattern({
  homeTimezone,
  intl,
  pattern,
  route,
  routeColor,
  stopTimes,
  stopViewerConfig
}: Props) {
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

  return (
    <li
      className="next-arrival-row"
      style={{
        backgroundColor: routeColor,
        color: getMostReadableTextColor(routeColor, route?.textColor)
      }}
    >
      {/* route name */}
      <div className="next-arrival-label">
        <span className="route-name">
          <RouteRenderer
            isOnColoredBackground={route.operator?.colorMode?.includes('gtfs')}
            // All GTFS bg colors look strange with the top border
            leg={generateFakeLegForRouteRenderer(route, true)}
            style={{ fontSize: routeNameFontSize(routeName) }}
          />
        </span>
        <span className="overflow-ellipsis" title={toHeadsign}>
          {toHeadsign}
        </span>
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
    </li>
  )
}

export default injectIntl(NextArrivalForPattern)

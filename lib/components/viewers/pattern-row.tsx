import { getMostReadableTextColor } from '@opentripplanner/core-utils/lib/route'
import React, { useContext } from 'react'
import type { Route, TransitOperator } from '@opentripplanner/types'

import { ComponentContext } from '../../util/contexts'
import {
  generateFakeLegForRouteRenderer,
  getRouteColorBasedOnSettings,
  routeNameFontSize
} from '../../util/viewer'
import { Pattern, Time } from '../util/types'
import DefaultRouteRenderer from '../narrative/metro/default-route-renderer'
import OperatorLogo from '../util/operator-logo'

import StopTimeCell from './stop-time-cell'

type Props = {
  homeTimezone?: string
  pattern: Pattern
  route: Route & { operator?: TransitOperator & { colorMode?: string } }
  showOperatorLogo?: boolean
  stopTimes: Time[]
}

/**
 * Represents a single pattern row for displaying arrival times in the stop
 * viewer.
 */
const PatternRow = ({
  homeTimezone,
  pattern,
  route,
  showOperatorLogo,
  stopTimes
}: Props): JSX.Element | null => {
  // @ts-expect-error FIXME: No type on ComponentContext
  const { RouteRenderer: CustomRouteRenderer } = useContext(ComponentContext)
  const RouteRenderer = CustomRouteRenderer || DefaultRouteRenderer

  const hasStopTimes = stopTimes && stopTimes.length > 0
  if (!hasStopTimes) {
    return null
  }

  const routeName = route.shortName ? route.shortName : route.longName
  const routeColor = getRouteColorBasedOnSettings(route.operator, route)

  return (
    <li className="route-row">
      {/* header row */}
      <div
        className="header stop-view"
        style={{
          backgroundColor: routeColor,
          color: getMostReadableTextColor(routeColor, route?.textColor)
        }}
      >
        {/* route name */}
        <div className="route-name">
          <span className="route-name-container" title={routeName}>
            {showOperatorLogo && <OperatorLogo operator={route?.operator} />}
            <RouteRenderer
              // All GTFS bg colors look strange with the top border
              isOnColoredBackground={route?.operator?.colorMode?.includes(
                'gtfs'
              )}
              leg={generateFakeLegForRouteRenderer(route, true)}
              style={{ fontSize: routeNameFontSize(routeName) }}
            />
          </span>
          <span title={pattern.headsign}>{pattern.headsign}</span>
        </div>
        {/* next departure preview (only shows up to 3 entries) */}
        {hasStopTimes && (
          <ol className="next-trip-preview">
            {[0, 1, 2].map(
              (index) =>
                stopTimes?.[index] && (
                  <li>
                    <StopTimeCell
                      homeTimezone={homeTimezone}
                      key={index}
                      stopTime={stopTimes[index]}
                    />
                  </li>
                )
            )}
          </ol>
        )}
      </div>
    </li>
  )
}

export default PatternRow

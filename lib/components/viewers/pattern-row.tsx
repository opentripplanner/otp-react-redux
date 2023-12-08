import { getMostReadableTextColor } from '@opentripplanner/core-utils/lib/route'
import React, { useContext } from 'react'
import type { Route, TransitOperator } from '@opentripplanner/types'

import { ComponentContext } from '../../util/contexts'
import {
  extractHeadsignFromPattern,
  generateFakeLegForRouteRenderer,
  getRouteColorBasedOnSettings,
  routeNameFontSize
} from '../../util/viewer'
import { Pattern, Time } from '../util/types'
import DefaultRouteRenderer from '../narrative/metro/default-route-renderer'
import OperatorLogo from '../util/operator-logo'

import { NextTripPreview, PatternRowItem } from './styled'
import StopTimeCell from './stop-time-cell'

type Props = {
  homeTimezone?: string
  pattern: Pattern
  roundedTop?: boolean
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
  roundedTop = true,
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
    <PatternRowItem roundedTop={roundedTop}>
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
          <span style={{ wordBreak: 'break-word' }} title={pattern.headsign}>
            {extractHeadsignFromPattern(pattern) ||
              (pattern.route.longName !== routeName && pattern.route.longName)}
          </span>
        </div>
        {/* next departure preview (only shows up to 3 entries) */}
        {hasStopTimes && (
          <NextTripPreview>
            {[0, 1, 2].map(
              (index) =>
                stopTimes?.[index] && (
                  // TODO: use stop time id as index
                  <li key={index}>
                    <StopTimeCell
                      homeTimezone={homeTimezone}
                      key={index}
                      stopTime={stopTimes[index]}
                    />
                  </li>
                )
            )}
          </NextTripPreview>
        )}
      </div>
    </PatternRowItem>
  )
}

export default PatternRow

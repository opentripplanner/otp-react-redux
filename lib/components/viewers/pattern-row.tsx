import { Calendar } from '@styled-icons/fa-regular'
import { format, utcToZonedTime } from 'date-fns-tz'
import { getMostReadableTextColor } from '@opentripplanner/core-utils/lib/route'
import { isSameDay } from 'date-fns'
import React, { useContext } from 'react'
import type { Route, TransitOperator } from '@opentripplanner/types'

import { ComponentContext } from '../../util/contexts'
import {
  extractHeadsignFromPattern,
  generateFakeLegForRouteRenderer,
  getRouteColorBasedOnSettings,
  routeNameFontSize
} from '../../util/viewer'
import { IconWithText } from '../util/styledIcon'
import { Pattern, Time } from '../util/types'
import DefaultRouteRenderer from '../narrative/metro/default-route-renderer'
import FormattedDayOfWeek from '../util/formatted-day-of-week'
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

const renderDay = (homeTimezone: string, day: number): JSX.Element => {
  const now = new Date()
  const formattedDay = utcToZonedTime(day * 1000, homeTimezone)
  return (
    <React.Fragment key={day}>
      {/* If the service day is not today, add a label */}
      {!isSameDay(now, formattedDay) && (
        <p aria-hidden className="day-label">
          <IconWithText Icon={Calendar}>
            <FormattedDayOfWeek
              // 'iiii' returns the long ISO day of the week (independent of browser locale).
              // See https://date-fns.org/v2.28.0/docs/format
              day={format(formattedDay, 'iiii', {
                timeZone: homeTimezone
              }).toLowerCase()}
            />
          </IconWithText>
        </p>
      )}
    </React.Fragment>
  )
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
            {homeTimezone && renderDay(homeTimezone, stopTimes?.[0].serviceDay)}
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

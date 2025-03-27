import { Calendar } from '@styled-icons/fa-solid/Calendar'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'
import styled from 'styled-components'

import { AppReduxState } from '../../../util/state-types'

import { Card, PatternRowContainer, StyledAlert } from './styled'
import { extractHeadsignFromPattern } from '../../../util/viewer'
import { IconWithText } from '../../util/styledIcon'
import { NearbyViewConfig } from '../../../util/config-types'
import { PatternStopTime, StopData, StopTime } from '../../util/types'
import Link from '../../util/link'
import PatternRow from '../pattern-row'
import TimezoneWarning from '../timezone-warning'

import StopCardHeader from './stop-card-header'

const { getUserTimezone } = coreUtils.time

export const fullTimestamp = (stoptime: StopTime) =>
  (stoptime.serviceDay || 0) + (stoptime.realtimeDeparture || 0)

// Style for child stop headers
const ChildStopHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 14px;
  padding: 8px 16px;
`

type Props = {
  fromToSlot: JSX.Element
  homeTimezone: string
  nearbyViewConfig?: NearbyViewConfig
  routeSortComparator: (a: PatternStopTime, b: PatternStopTime) => number
  stopData: StopData & { nearbyRoutes?: string[]; stops?: StopData[] }
}

export const patternArrayforStops = (
  stopData: StopData & { nearbyRoutes?: string[] },
  routeSortComparator: (a: PatternStopTime, b: PatternStopTime) => number
): Array<PatternStopTime> | undefined => {
  return stopData?.stoptimesForPatterns
    ?.reduce<PatternStopTime[]>((acc, cur) => {
      const currentHeadsign = extractHeadsignFromPattern(cur.pattern)
      const dupe = acc.findIndex((p) => {
        // TODO: use OTP_generated ids
        let sameRoute = false
        if (p.pattern.route?.shortName && cur.pattern.route?.shortName) {
          sameRoute =
            p.pattern.route?.shortName === cur.pattern.route?.shortName
        } else if (p.pattern.route?.longName && cur.pattern.route?.longName) {
          sameRoute = p.pattern.route?.longName === cur.pattern.route?.longName
        } else if (
          p?.stoptimes?.[0]?.headsign &&
          cur?.stoptimes?.[0]?.headsign
        ) {
          sameRoute =
            p?.stoptimes?.[0]?.headsign === cur?.stoptimes?.[0]?.headsign
        }
        return (
          extractHeadsignFromPattern(p.pattern) === currentHeadsign && sameRoute
        )
      })
      if (dupe === -1) {
        acc.push(cur)
      } else {
        // TODO: is there a method that already does this?
        const filteredNewStopTimes = cur.stoptimes.filter(
          (stoptime: StopTime) =>
            !acc[dupe].stoptimes.find(
              (s: StopTime) => fullTimestamp(stoptime) === fullTimestamp(s)
            )
        )
        acc[dupe].stoptimes = [...acc[dupe].stoptimes, ...filteredNewStopTimes]
      }
      return acc
    }, [])
    .sort(routeSortComparator)
}

// Helper function to render pattern rows for a stop
const renderPatternRows = (
  stopData: StopData & { nearbyRoutes?: string[] },
  patternArray: Array<PatternStopTime> | undefined,
  homeTimezone: string,
  nearbyViewConfig?: NearbyViewConfig
) => {
  return patternArray?.map((st: any, index: number) => {
    const sortedStopTimes = st.stoptimes.sort(
      (a: StopTime, b: StopTime) => fullTimestamp(a) - fullTimestamp(b)
    )
    if (
      // NearbyRoutes if present is populated with a list of routes that appear
      // in the current service period.
      stopData.nearbyRoutes &&
      !stopData.nearbyRoutes.includes(st?.pattern?.route?.gtfsId)
    ) {
      return <></>
    }
    return (
      <PatternRow
        alwaysShowLongName={nearbyViewConfig?.alwaysShowLongName}
        homeTimezone={homeTimezone}
        key={index}
        pattern={st.pattern}
        roundedTop={false}
        route={st.pattern.route}
        stopTimes={sortedStopTimes}
      />
    )
  })
}

const Stop = ({
  fromToSlot,
  homeTimezone,
  nearbyViewConfig,
  routeSortComparator,
  stopData
}: Props): JSX.Element => {
  const patternArray = patternArrayforStops(stopData, routeSortComparator)
  const patternRows = renderPatternRows(
    stopData,
    patternArray,
    homeTimezone,
    nearbyViewConfig
  )

  const inHomeTimezone = homeTimezone && homeTimezone === getUserTimezone()
  const timezoneWarning = !inHomeTimezone && (
    <StyledAlert>
      <TimezoneWarning homeTimezone={homeTimezone} />
    </StyledAlert>
  )

  const isParentStop = stopData.stops?.length && stopData.stops?.length > 0

  return (
    <Card>
      <StopCardHeader
        actionIcon={Calendar}
        // Remove entityId URL parameter when leaving nearby view.
        actionParams={{ entityId: undefined }}
        actionPath={!isParentStop ? `/schedule/${stopData.gtfsId}` : undefined}
        actionText={
          !isParentStop ? (
            <FormattedMessage id="components.StopViewer.viewSchedule" />
          ) : undefined
        }
        fromToSlot={fromToSlot}
        stopData={stopData}
      />
      <div>
        <div>{timezoneWarning}</div>

        {/* Main stop patterns */}
        {!isParentStop && (
          <PatternRowContainer>{patternRows}</PatternRowContainer>
        )}

        {/* Child stops */}
        {stopData.stops?.map((childStop, index) => {
          const childPatternArray = patternArrayforStops(
            childStop,
            routeSortComparator
          )
          const childPatternRows = renderPatternRows(
            childStop,
            childPatternArray,
            homeTimezone,
            nearbyViewConfig
          )

          // Only render child stops that have patterns
          if (!childPatternArray?.length) return null

          return (
            <React.Fragment key={childStop.gtfsId || index}>
              <ChildStopHeader>
                {childStop.name}
                <Link
                  className="pull-right"
                  style={{ color: 'inherit', fontSize: 'small' }}
                  to={`/schedule/${childStop.gtfsId}`}
                >
                  <IconWithText Icon={Calendar}>
                    <FormattedMessage id="components.StopViewer.viewSchedule" />
                  </IconWithText>
                </Link>
              </ChildStopHeader>
              <PatternRowContainer>{childPatternRows}</PatternRowContainer>
            </React.Fragment>
          )
        })}
      </div>
    </Card>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  const { config } = state.otp
  const nearbyViewConfig = config?.nearbyView
  const transitOperators = config?.transitOperators || []

  // Default sort: departure time
  let routeSortComparator = (a: PatternStopTime, b: PatternStopTime) =>
    fullTimestamp(a.stoptimes?.[0]) - fullTimestamp(b.stoptimes?.[0])

  if (nearbyViewConfig?.useRouteViewSort) {
    routeSortComparator = (a: PatternStopTime, b: PatternStopTime) =>
      coreUtils.route.makeRouteComparator(transitOperators)(
        // @ts-expect-error core-utils types are wrong!
        a.pattern.route,
        b.pattern.route
      )
  }

  return {
    homeTimezone: config.homeTimezone,
    nearbyViewConfig,
    routeSortComparator
  }
}

export default connect(mapStateToProps)(Stop)

import { Calendar } from '@styled-icons/fa-solid'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { TransitOperator } from '@opentripplanner/types'
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

import { AppReduxState } from '../../../util/state-types'
import { extractHeadsignFromPattern } from '../../../util/viewer'
import { NearbyViewConfig } from '../../../util/config-types'
import { PatternStopTime, StopData, StopTime } from '../../util/types'
import PatternRow from '../pattern-row'
import TimezoneWarning from '../timezone-warning'

import { Card, PatternRowContainer, StyledAlert } from './styled'
import StopCardHeader from './stop-card-header'

const { getUserTimezone } = coreUtils.time

const fullTimestamp = (stoptime: StopTime) =>
  (stoptime.serviceDay || 0) + (stoptime.realtimeDeparture || 0)

type Props = {
  fromToSlot: JSX.Element
  homeTimezone: string
  nearbyViewConfig?: NearbyViewConfig
  routeSortComparator: (a: PatternStopTime, b: PatternStopTime) => number
  stopData: StopData
}

const Stop = ({
  fromToSlot,
  homeTimezone,
  nearbyViewConfig,
  routeSortComparator,
  stopData
}: Props): JSX.Element => {
  const patternRows = (stopData.stoptimesForPatterns || [])
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
    .map((st: any, index: number) => {
      const sortedStopTimes = st.stoptimes.sort(
        (a: StopTime, b: StopTime) => fullTimestamp(a) - fullTimestamp(b)
      )
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
  const inHomeTimezone = homeTimezone && homeTimezone === getUserTimezone()
  const timezoneWarning = !inHomeTimezone && (
    <StyledAlert>
      <TimezoneWarning homeTimezone={homeTimezone} />
    </StyledAlert>
  )

  if (nearbyViewConfig?.hideEmptyStops && patternRows.length === 0) return <></>

  return (
    <Card>
      <StopCardHeader
        actionIcon={Calendar}
        // Remove entityId URL parameter when leaving nearby view.
        actionParams={{ entityId: undefined }}
        actionPath={`/schedule/${stopData.gtfsId}`}
        actionText={
          <FormattedMessage id="components.StopViewer.viewSchedule" />
        }
        fromToSlot={fromToSlot}
        stopData={stopData}
      />
      <div>
        <div>{timezoneWarning}</div>
        <PatternRowContainer>{patternRows}</PatternRowContainer>
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

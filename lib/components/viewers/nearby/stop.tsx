import { Calendar } from '@styled-icons/fa-solid'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Place } from '@opentripplanner/types'
import coreUtils from '@opentripplanner/core-utils'
import React, { useCallback } from 'react'

import * as uiActions from '../../../actions/ui'
import { AppReduxState } from '../../../util/state-types'
import { extractHeadsignFromPattern } from '../../../util/viewer'
import { NearbyViewConfig } from '../../../util/config-types'
import { Pattern, StopTime } from '../../util/types'
import PatternRow from '../pattern-row'
import TimezoneWarning from '../timezone-warning'

import { Card, PatternRowContainer, StyledAlert } from './styled'
import StopCardHeader from './stop-card-header'

const { getUserTimezone } = coreUtils.time

type PatternStopTime = {
  pattern: Pattern
  stoptimes: StopTime[]
}

type StopData = Place & {
  code: string
  gtfsId: string
  stoptimesForPatterns: PatternStopTime[]
}

const fullTimestamp = (stoptime: StopTime) =>
  (stoptime.serviceDay || 0) + (stoptime.realtimeDeparture || 0)

type Props = {
  fromToSlot: JSX.Element
  homeTimezone: string
  nearbyViewConfig?: NearbyViewConfig
  setHoveredStop: (stopId?: string) => void
  stopData: StopData
}

const Stop = ({
  fromToSlot,
  homeTimezone,
  nearbyViewConfig,
  setHoveredStop,
  stopData
}: Props): JSX.Element => {
  const patternRows = stopData.stoptimesForPatterns
    ?.reduce<PatternStopTime[]>((acc, cur) => {
      const currentHeadsign = extractHeadsignFromPattern(cur.pattern)
      const dupe = acc.findIndex(
        (p) => extractHeadsignFromPattern(p.pattern) === currentHeadsign
      )
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
    .sort(
      (a: PatternStopTime, b: PatternStopTime) =>
        fullTimestamp(a.stoptimes?.[0]) - fullTimestamp(b.stoptimes?.[0])
    )
    .map((st: any, index: number) => {
      const sortedStopTimes = st.stoptimes.sort(
        (a: StopTime, b: StopTime) => fullTimestamp(a) - fullTimestamp(b)
      )
      return (
        <PatternRow
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

  const onMouseEnter = useCallback(() => {
    setHoveredStop(stopData.gtfsId)
  }, [setHoveredStop, stopData.gtfsId])

  const onMouseLeave = useCallback(() => {
    setHoveredStop(undefined)
  }, [setHoveredStop])

  if (nearbyViewConfig?.hideEmptyStops && patternRows.length === 0) return <></>

  return (
    <Card onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <StopCardHeader
        actionIcon={Calendar}
        actionText={
          <FormattedMessage id="components.StopViewer.viewSchedule" />
        }
        actionUrl={`/schedule/${stopData.gtfsId}`}
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
  return {
    homeTimezone: config.homeTimezone,
    nearbyViewConfig: config?.nearbyView
  }
}

const mapDispatchToProps = {
  setHoveredStop: uiActions.setHoveredStop
}

export default connect(mapStateToProps, mapDispatchToProps)(Stop)

import { Calendar, MapPin } from '@styled-icons/fa-solid'
import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { Place, TransitOperator } from '@opentripplanner/types'
import coreUtils from '@opentripplanner/core-utils'
import React, { useCallback } from 'react'

import * as uiActions from '../../../actions/ui'
import { AppReduxState } from '../../../util/state-types'
import { extractHeadsignFromPattern } from '../../../util/viewer'
import { IconWithText } from '../../util/styledIcon'
import { NearbyViewConfig } from '../../../util/config-types'
import { Pattern, StopTime } from '../../util/types'
import OperatorLogo from '../../util/operator-logo'
import PatternRow from '../pattern-row'
import Strong from '../../util/strong-text'
import TimezoneWarning from '../timezone-warning'

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  PatternRowContainer,
  StyledAlert
} from './styled'

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
  setViewedStop: (stop: any, nearby: string) => void
  showOperatorLogo: boolean
  stopData: StopData
  transitOperators?: TransitOperator[]
}

const Operator = ({ operator }: { operator?: TransitOperator }) => {
  const intl = useIntl()
  return operator && operator.logo ? (
    <OperatorLogo
      alt={intl.formatMessage(
        {
          id: 'components.StopViewer.operatorLogoAriaLabel'
        },
        {
          operatorName: operator.name
        }
      )}
      operator={operator}
    />
  ) : (
    <MapPin />
  )
}

const Stop = ({
  fromToSlot,
  homeTimezone,
  nearbyViewConfig,
  setHoveredStop,
  setViewedStop,
  stopData,
  transitOperators
}: Props): JSX.Element => {
  const agencies = stopData.stoptimesForPatterns?.reduce<Set<string>>(
    // @ts-expect-error The agency type is not yet compatible with OTP2
    (prev, cur) => prev.add(cur.pattern.route.agency.gtfsId),
    new Set()
  )

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
        (a.stoptimes?.[0].serviceDay || 0) - (b.stoptimes?.[0].serviceDay || 0)
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

  const operator =
    agencies.size === 1
      ? transitOperators?.find((o) => o.agencyId === Array.from(agencies)[0])
      : undefined

  if (nearbyViewConfig?.hideEmptyStops && patternRows.length === 0) return <></>

  return (
    <Card onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <CardHeader>
        <CardTitle>
          <IconWithText icon={<Operator operator={operator} />}>
            {stopData.name}
          </IconWithText>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <div>
          <FormattedMessage
            id="components.StopViewer.displayStopId"
            values={{
              stopId: stopData.code || stopData.gtfsId,
              strong: Strong
            }}
          />
          <button
            className="link-button pull-right"
            onClick={() => setViewedStop({ stopId: stopData.gtfsId }, 'stop')}
            style={{ fontSize: 'small' }}
          >
            <IconWithText Icon={Calendar}>
              <FormattedMessage id="components.StopViewer.viewSchedule" />
            </IconWithText>
          </button>
        </div>
        {fromToSlot}
      </CardBody>
      <div>
        <div>{timezoneWarning}</div>
        <PatternRowContainer>{patternRows}</PatternRowContainer>
      </div>
    </Card>
  )
}

const mapDispatchToProps = {
  setHoveredStop: uiActions.setHoveredStop,
  setMainPanelContent: uiActions.setMainPanelContent,
  setViewedStop: uiActions.setViewedStop,
  toggleAutoRefresh: uiActions.toggleAutoRefresh
}

const mapStateToProps = (state: AppReduxState) => {
  const { config } = state.otp
  return {
    homeTimezone: config.homeTimezone,
    nearbyViewConfig: config?.nearbyView,
    transitOperators: config.transitOperators
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Stop)

import { Calendar, MapPin } from '@styled-icons/fa-solid'
import { connect } from 'react-redux'
import { format } from 'date-fns-tz'
import { FormattedMessage, useIntl } from 'react-intl'
import { InfoCircle } from '@styled-icons/fa-solid/InfoCircle'
import { Place, TransitOperator } from '@opentripplanner/types'
import { useMap } from 'react-map-gl'
import coreUtils from '@opentripplanner/core-utils'
import dateFnsUSLocale from 'date-fns/locale/en-US'
import React, { useCallback } from 'react'

import * as mapActions from '../../../actions/map'
import * as uiActions from '../../../actions/ui'
import { AppReduxState } from '../../../util/state-types'
import { IconWithText } from '../../util/styledIcon'
import { Pattern, StopTime } from '../../util/types'
import OperatorLogo from '../../util/operator-logo'
import PatternRow from '../pattern-row'
import Strong from '../../util/strong-text'

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

const getTimezoneWarning = (homeTimezone: string): JSX.Element => {
  const timezoneCode = format(Date.now(), 'z', {
    // To avoid ambiguities for now, use the English-US timezone abbreviations ("EST", "PDT", etc.)
    locale: dateFnsUSLocale,
    timeZone: homeTimezone
  })

  // Display a banner about the departure timezone if user's timezone is not the configured 'homeTimezone'
  // (e.g. cases where a user in New York looks at a schedule in Los Angeles).
  return (
    <StyledAlert>
      <IconWithText Icon={InfoCircle}>
        <FormattedMessage
          id="components.StopViewer.timezoneWarning"
          values={{ strong: Strong, timezoneCode }}
        />
      </IconWithText>
    </StyledAlert>
  )
}

type Props = {
  fromToSlot: JSX.Element
  homeTimezone: string
  setHoveredStop: (stopId?: string) => void
  setViewedStop: (stop: any, nearby: string) => void
  showOperatorLogo: boolean
  stopData: StopData
  transitOperators?: TransitOperator[]
  zoomToPlace: (map: any, stopData: any) => void
}

const Operator = ({ operator }: { operator?: TransitOperator }) => {
  const intl = useIntl()
  return operator ? (
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
  setHoveredStop,
  setViewedStop,
  stopData,
  transitOperators,
  zoomToPlace
}: Props): JSX.Element => {
  const map = useMap()

  const agencies = stopData.stoptimesForPatterns?.reduce<Set<string>>(
    // @ts-expect-error The agency type is not yet compatible with OTP2
    (prev, cur) => prev.add(cur.pattern.route.agency.gtfsId),
    new Set()
  )

  // TODO: We need to bring back the day break-up we had with the old stop viewer
  const patternRows = stopData.stoptimesForPatterns
    ?.reduce<PatternStopTime[]>((acc, cur) => {
      const dupe = acc.findIndex(
        (p) => p.pattern.headsign === cur.pattern.headsign
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
  const timezoneWarning = !inHomeTimezone && getTimezoneWarning(homeTimezone)

  const zoomToStop = useCallback(() => {
    zoomToPlace(map.default, stopData)
  }, [zoomToPlace, map.default, stopData])

  const onMouseEnter = useCallback(() => {
    zoomToStop()
    setHoveredStop(stopData.gtfsId)
  }, [zoomToStop, setHoveredStop, stopData.gtfsId])

  const onMouseLeave = useCallback(() => {
    setHoveredStop(undefined)
  }, [setHoveredStop])

  const operator =
    agencies.size === 1
      ? transitOperators?.find((o) => o.agencyId === Array.from(agencies)[0])
      : undefined

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
  toggleAutoRefresh: uiActions.toggleAutoRefresh,
  zoomToPlace: mapActions.zoomToPlace
}

const mapStateToProps = (state: AppReduxState) => {
  const { config } = state.otp
  return {
    homeTimezone: config.homeTimezone,
    transitOperators: config.transitOperators
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Stop)

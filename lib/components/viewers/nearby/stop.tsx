import { connect } from 'react-redux'
import { format } from 'date-fns-tz'
import { FormattedMessage, useIntl } from 'react-intl'
import { InfoCircle } from '@styled-icons/fa-solid/InfoCircle'
import { Place } from '@opentripplanner/types'
import { Search } from '@styled-icons/fa-solid/Search'
import { useMap } from 'react-map-gl'
import coreUtils from '@opentripplanner/core-utils'
import dateFnsUSLocale from 'date-fns/locale/en-US'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React from 'react'

import * as mapActions from '../../../actions/map'
import * as uiActions from '../../../actions/ui'

import {
  Card,
  CardBody,
  CardHeader,
  PatternRowContainer,
  StyledAlert
} from './styled'
import { Icon, IconWithText } from '../../util/styledIcon'
import { Pattern, StopTime } from '../../util/types'
import PatternRow from '../pattern-row'
import Strong from '../../util/strong-text'

const { getUserTimezone } = coreUtils.time

type PatternStopTime = {
  pattern: Pattern
  stoptimes: StopTime[]
}

type StopData = Place & {
  code: string
  stoptimesForPatterns: PatternStopTime[]
}

const fullTimestamp = (stoptime: StopTime) =>
  stoptime.serviceDay + stoptime.realtimeDeparture

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
  homeTimezone: string
  setLocation: (args: any) => void
  showOperatorLogo: boolean
  stopData: StopData
  zoomToPlace: (map: any, stopData: any) => void
}

const Stop = ({
  homeTimezone,
  setLocation,
  stopData,
  zoomToPlace
}: Props): JSX.Element => {
  const intl = useIntl()
  const map = useMap()

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

  const setLocationFromStop = (locationType: 'from' | 'to') => {
    const location = {
      lat: stopData.lat,
      lon: stopData.lon,
      name: stopData.name
    }
    setLocation({ location, locationType, reverseGeocode: false })
  }

  const zoomToStop = () => {
    zoomToPlace(map.default, stopData)
  }

  return (
    <Card onMouseEnter={zoomToStop}>
      <CardHeader>{stopData.name}</CardHeader>
      <CardBody>
        <div>
          <FormattedMessage
            id="components.StopViewer.displayStopId"
            values={{ stopId: stopData.code, strong: Strong }}
          />
          <button
            className="link-button"
            onClick={zoomToStop}
            title={intl.formatMessage({
              id: 'components.StopViewer.zoomToStop'
            })}
          >
            <Icon Icon={Search} style={{ marginLeft: '0.2em' }} />
          </button>
        </div>
        <span role="group">
          <FromToLocationPicker
            label
            onFromClick={() => setLocationFromStop('from')}
            onToClick={() => setLocationFromStop('to')}
          />
        </span>
      </CardBody>
      <div>
        <div>{timezoneWarning}</div>
        <PatternRowContainer>{patternRows}</PatternRowContainer>
      </div>
    </Card>
  )
}

const mapDispatchToProps = {
  setLocation: mapActions.setLocation,
  setMainPanelContent: uiActions.setMainPanelContent,
  toggleAutoRefresh: uiActions.toggleAutoRefresh,
  zoomToPlace: mapActions.zoomToPlace
}

const mapStateToProps = (state: any) => {
  const { config } = state.otp
  return {
    homeTimezone: config.homeTimezone
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Stop)

import { Calendar, Clock, InfoCircle, Search } from '@styled-icons/fa-solid'
import { format } from 'date-fns-tz'
import { FormattedMessage, useIntl } from 'react-intl'
import { getUserTimezone } from '@opentripplanner/core-utils/lib/time'
import dateFnsUSLocale from 'date-fns/locale/en-US'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { useEffect, useState } from 'react'

import * as apiActions from '../../../actions/api'
import * as mapActions from '../../../actions/map'
import * as uiActions from '../../../actions/ui'
import * as userActions from '../../../actions/user'
import { connect } from 'react-redux'

import {
  Card,
  CardBody,
  CardHeader,
  PatternRowContainer,
  StyledAlert
} from './styled'
import { Icon, IconWithText } from '../../util/styledIcon'
import { stopIsFlex } from '../../../util/viewer'

import { useMap } from 'react-map-gl'

import PatternRow from '../pattern-row'
import Strong from '../../util/strong-text'

const fullTimestamp = (stoptime) =>
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
  allStopData: any
  findStopTimesForStop: ({ stopId }: { stopId: string }) => void
  homeTimezone: string
  setHoveredStop: () => void
  setLocation: (args: any) => void
  showOperatorLogo: boolean
  stopData: any
  transitOperators: any
  zoomToPlace: (map: any, stopData: any) => void
}

const Stop = ({
  allStopData,
  findStopTimesForStop,
  homeTimezone,
  setHoveredStop,
  setLocation,
  showOperatorLogo,
  stopData,
  transitOperators,
  zoomToPlace
}: Props): JSX.Element => {
  const intl = useIntl()
  const map = useMap()
  const [isShowingSchedule, setIsShowingSchedule] = useState(false)

  // TODO: Let's have some typescript here first that'll help
  // TODO: We need to bring back the day break-up we had with the old stop viewer
  const patternRows = stopData.stoptimesForPatterns
    ?.reduce((acc, cur) => {
      const dupe = acc.findIndex(
        (p) => p.pattern.headsign === cur.pattern.headsign
      )
      if (dupe === -1) {
        acc.push(cur)
      } else {
        // TODO: is there a method that already does this?
        const filteredNewStopTimes = cur.stoptimes.filter(
          (stoptime) =>
            !acc[dupe].stoptimes.find(
              (s) => fullTimestamp(stoptime) === fullTimestamp(s)
            )
        )
        acc[dupe].stoptimes = [...acc[dupe].stoptimes, ...filteredNewStopTimes]
      }
      return acc
    }, [])
    .map((st: any, index: number) => {
      const sortedStopTimes = st.stoptimes.sort(
        (a, b) => fullTimestamp(a) - fullTimestamp(b)
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
  const isFlex = stopIsFlex(stopData)
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
          {!isFlex && (
            <button
              className="link-button pull-right"
              // onClick={this._toggleScheduleView}
              style={{ fontSize: 'small' }}
            >
              <IconWithText Icon={isShowingSchedule ? Clock : Calendar}>
                {isShowingSchedule ? (
                  <FormattedMessage id="components.StopViewer.viewNextArrivals" />
                ) : (
                  <FormattedMessage id="components.StopViewer.viewSchedule" />
                )}
              </IconWithText>
            </button>
          )}
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
  fetchStopInfo: apiActions.fetchStopInfo,
  findStopTimesForStop: apiActions.findStopTimesForStop,
  forgetStop: userActions.forgetStop,
  rememberStop: userActions.rememberStop,
  setHoveredStop: uiActions.setHoveredStop,
  setLocation: mapActions.setLocation,
  setMainPanelContent: uiActions.setMainPanelContent,
  toggleAutoRefresh: uiActions.toggleAutoRefresh,
  zoomToPlace: mapActions.zoomToPlace
}

const mapStateToProps = (state: any) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Stop)

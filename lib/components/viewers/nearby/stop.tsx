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

import { Card, CardHeader, PatternRowContainer, StyledAlert } from './styled'
import { Icon, IconWithText } from '../../util/styledIcon'
import { stopIsFlex } from '../../../util/viewer'
import PatternRow from '../pattern-row'
import Strong from '../../util/strong-text'

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
  showOperatorLogo: boolean
  stopData: any
  transitOperators: any
}

const Stop = ({
  allStopData,
  findStopTimesForStop,
  homeTimezone,
  setHoveredStop,
  showOperatorLogo,
  stopData,
  transitOperators
}: Props): JSX.Element => {
  const intl = useIntl()
  const [isShowingSchedule, setIsShowingSchedule] = useState(false)

  // TODO: Let's have some typescript here first that'll help
  console.log(stopData.stoptimesForPatterns)
  const patternRows = stopData.stoptimesForPatterns?.map(
    (st: any, index: number) => {
      return (
        <PatternRow
          homeTimezone={homeTimezone}
          key={index}
          pattern={st.pattern}
          route={st.pattern.route}
          stopTimes={st.stoptimes}
        />
      )
    }
  )
  const inHomeTimezone = homeTimezone && homeTimezone === getUserTimezone()
  const isFlex = stopIsFlex(stopData)
  const timezoneWarning = !inHomeTimezone && getTimezoneWarning(homeTimezone)

  return (
    <Card>
      <CardHeader>{stopData.name}</CardHeader>
      <p>
        <div>
          <FormattedMessage
            id="components.StopViewer.displayStopId"
            values={{ stopId: stopData.code, strong: Strong }}
          />
          <button
            className="link-button"
            // onClick={this._zoomToStop}
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
            // onFromClick={this._onClickPlanFrom}
            // onToClick={this._onClickPlanTo}
          />
        </span>
      </p>
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

import { connect } from 'react-redux'
import { decodeQueryParams, StringParam } from 'serialize-query-params'
import coreUtils from '@opentripplanner/core-utils'
import React, { useCallback } from 'react'

import { AppConfig } from '../../util/config-types'
import { AppReduxState } from '../../util/state-types'
import { setQueryParam } from '../../actions/form'

import { StyledDateTimeSelector } from './styled'

export type DepartArriveValue = 'NOW' | 'DEPART' | 'ARRIVE'

type Props = {
  config: AppConfig
  date: any
  dateFormatLegacy: string
  departArrive: DepartArriveValue
  setQueryParam: (params: any) => void
  time: any
  timeFormatLegacy: string
}

function DateTimeModal({
  config,
  date,
  dateFormatLegacy,
  departArrive,
  setQueryParam,
  time,
  timeFormatLegacy
}: Props) {
  /**
   * Stores parameters in both the Redux `currentQuery` and URL
   * @param params Params to store
   */
  const _onSettingsUpdate = useCallback(
    (params: any) => {
      console.log('setting')
      setQueryParam({ queryParamData: params, ...params })
    },
    [setQueryParam]
  )

  const { homeTimezone, isTouchScreenOnDesktop } = config
  const touchClassName = isTouchScreenOnDesktop
    ? 'with-desktop-touchscreen'
    : ''

  return (
    <div className="date-time-modal">
      <div className="main-panel">
        <StyledDateTimeSelector
          className={`date-time-selector ${touchClassName}`}
          date={date}
          dateFormatLegacy={dateFormatLegacy}
          departArrive={departArrive}
          onQueryParamChange={_onSettingsUpdate}
          time={time}
          // These props below are for Safari on MacOS, and legacy browsers
          // that don't support `<input type="time|date">`.
          // These props are not relevant in modern browsers,
          // where `<input type="time|date">` already
          // formats the time|date according to the OS settings.
          // eslint-disable-next-line react/jsx-sort-props
          timeFormatLegacy={timeFormatLegacy}
          timeZone={homeTimezone}
        />
      </div>
    </div>
  )
}

const queryParamConfig = {
  date: StringParam,
  departArrive: StringParam,
  time: StringParam
}

const mapStateToProps = (state: AppReduxState) => {
  const config = state.otp.config
  const urlSearchParams = new URLSearchParams(state.router.location.search)
  const { date, departArrive, time } = decodeQueryParams(queryParamConfig, {
    date: urlSearchParams.get('date'),
    departArrive: urlSearchParams.get('departArrive'),
    time: urlSearchParams.get('time')
  })

  return {
    config,
    date: date || coreUtils.time.getCurrentDate(),
    // This prop is for legacy browsers (see render method above).
    // @ts-expect-error why do we have two config types?
    dateFormatLegacy: coreUtils.time.getDateFormat(config),
    departArrive: (departArrive as DepartArriveValue) || 'NOW',
    time: time || coreUtils.time.getCurrentTime(),
    // This prop is for legacy browsers (see render method above).
    // @ts-expect-error why do we have two config types?
    timeFormatLegacy: coreUtils.time.getTimeFormat(config)
  }
}

const mapDispatchToProps = {
  setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeModal)

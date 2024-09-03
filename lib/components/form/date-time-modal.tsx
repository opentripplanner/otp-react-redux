// TODO: TypeScript with props.
/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

import { AppConfig } from '../../util/config-types'
import { AppReduxState, FilterType, SortType } from '../../util/state-types'
import { setQueryParam } from '../../actions/form'

import { StyledDateTimeSelector } from './styled'
import { updateItineraryFilter } from '../../actions/narrative'

type Props = {
  config: AppConfig
  date: string
  dateFormatLegacy?: string
  departArrive: DepartArriveValue
  setQueryParam: (params: any) => void
  sort: SortType
  time: string
  timeFormatLegacy?: string
  updateItineraryFilter: (payload: FilterType) => void
}

type DepartArriveValue = 'NOW' | 'DEPART' | 'ARRIVE'

function DateTimeModal(props: Props) {
  const {
    config,
    date,
    dateFormatLegacy,
    departArrive,
    setQueryParam,
    sort,
    time,
    timeFormatLegacy,
    updateItineraryFilter
  } = props
  const { homeTimezone, isTouchScreenOnDesktop } = config
  const touchClassName = isTouchScreenOnDesktop
    ? 'with-desktop-touchscreen'
    : ''

  const setQueryParamMiddleware = (params: any) => {
    switch (params.departArrive) {
      case 'NOW':
        updateItineraryFilter({ sort: { ...sort, type: 'DURATION' } })
        break
      case 'DEPART':
        updateItineraryFilter({ sort: { ...sort, type: 'DEPARTURETIME' } })
        break
      case 'ARRIVE':
        updateItineraryFilter({ sort: { ...sort, type: 'ARRIVALTIME' } })
        break
    }
    setQueryParam(params)
  }
  return (
    <div className="date-time-modal">
      <div className="main-panel">
        <StyledDateTimeSelector
          className={`date-time-selector ${touchClassName}`}
          date={date}
          dateFormatLegacy={dateFormatLegacy}
          departArrive={departArrive}
          onQueryParamChange={setQueryParamMiddleware}
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

const mapStateToProps = (state: AppReduxState) => {
  const { date, departArrive, time } = state.otp.currentQuery
  const config = state.otp.config
  const { sort } = state.otp.filter
  return {
    config,
    date,
    // This prop is for legacy browsers (see render method above).
    // @ts-expect-error Msimatched config types
    dateFormatLegacy: coreUtils.time.getDateFormat(config),
    departArrive,
    sort,
    time,
    // This prop is for legacy browsers (see render method above).
    // @ts-expect-error Msimatched config types
    timeFormatLegacy: coreUtils.time.getTimeFormat(config)
  }
}

const mapDispatchToProps = {
  setQueryParam,
  updateItineraryFilter
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeModal)

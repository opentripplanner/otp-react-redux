// TODO: TypeScript with props.
/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import coreUtils from '@opentripplanner/core-utils'
import React, { useCallback } from 'react'

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

const DepartArriveTypeMap: Record<
  DepartArriveValue,
  FilterType['sort']['type']
> = {
  ARRIVE: 'ARRIVALTIME',
  DEPART: 'DEPARTURETIME',
  NOW: 'DURATION'
}

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

  const syncSortWithDepartArrive = config?.itinerary?.syncSortWithDepartArrive
  const setQueryParamMiddleware = useCallback(
    (params: any) => {
      if (syncSortWithDepartArrive) {
        updateItineraryFilter({
          sort: {
            ...sort,
            type: DepartArriveTypeMap[params.departArrive as DepartArriveValue]
          }
        })
      }
      setQueryParam(params)
    },
    [setQueryParam, updateItineraryFilter, sort, syncSortWithDepartArrive]
  )
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

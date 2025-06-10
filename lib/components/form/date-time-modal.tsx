import { connect } from 'react-redux'
import coreUtils from '@opentripplanner/core-utils'
import React, { useCallback } from 'react'

import * as formActions from '../../actions/form'
import * as narrativeActions from '../../actions/narrative'
import { AppConfig } from '../../util/config-types'
import { AppReduxState, FilterType, SortType } from '../../util/state-types'

import { StyledDateTimeSelector } from './styled'

type Props = {
  config: AppConfig
  date: string
  dateFormatLegacy?: string
  departArrive: DepartArriveValue
  departArriveDropdown?: boolean
  setQueryParam: (params: any) => void
  sort: SortType
  time: string
  timeFormatLegacy?: string
  updateItineraryFilter: (payload: FilterType) => void
}

export type DepartArriveValue = 'NOW' | 'DEPART' | 'ARRIVE'

export const DepartArriveTypeMap: Record<
  DepartArriveValue,
  FilterType['sort']['type']
> = {
  ARRIVE: 'ARRIVALTIME',
  DEPART: 'DEPARTURETIME',
  NOW: 'DURATION'
}

export const DepartArriveDefaultSortDirectionMap: Record<
  DepartArriveValue,
  FilterType['sort']['direction']
> = {
  ARRIVE: 'ASC',
  DEPART: 'DESC',
  NOW: 'DESC'
}

export const setQueryParamMiddleware = (
  syncSortWithDepartArrive: boolean | undefined,
  updateItineraryFilter: (payload: FilterType) => void,
  params: any,
  setQueryParam: (params: any) => void,
  sort: SortType
): void => {
  if (syncSortWithDepartArrive) {
    updateItineraryFilter({
      sort: {
        ...sort,
        direction:
          DepartArriveDefaultSortDirectionMap[
            params.departArrive as DepartArriveValue
          ] || sort.direction,
        type: DepartArriveTypeMap[params.departArrive as DepartArriveValue]
      }
    })
  }
  return setQueryParam(params)
}

function DateTimeModal({
  config,
  date,
  dateFormatLegacy,
  departArrive,
  departArriveDropdown,
  setQueryParam,
  sort,
  time,
  timeFormatLegacy,
  updateItineraryFilter
}: Props) {
  const { homeTimezone, isTouchScreenOnDesktop } = config
  const touchClassName = isTouchScreenOnDesktop
    ? 'with-desktop-touchscreen'
    : ''

  const syncSortWithDepartArrive = config?.itinerary?.syncSortWithDepartArrive
  // Note the side effect that this will resort the results of a previous query
  // if the user changes the depart/arrive setting before the query is run.

  const onQueryParamChange = useCallback(
    (params: any) => {
      setQueryParamMiddleware(
        syncSortWithDepartArrive,
        updateItineraryFilter,
        params,
        setQueryParam,
        sort
      )
    },
    [syncSortWithDepartArrive, updateItineraryFilter, setQueryParam, sort]
  )

  return (
    <StyledDateTimeSelector
      className={`date-time-selector ${touchClassName}`}
      date={date}
      departArrive={departArrive}
      departArriveDropdown={departArriveDropdown}
      onQueryParamChange={onQueryParamChange}
      time={time}
      // These props below are for legacy browsers
      // that don't support `<input type="time|date">`.
      // These props are not relevant in modern browsers,
      // where `<input type="time|date">` already
      // formats the time|date according to the OS settings.
      // eslint-disable-next-line react/jsx-sort-props
      dateFormatLegacy={dateFormatLegacy}
      timeFormatLegacy={timeFormatLegacy}
      timeZone={homeTimezone}
    />
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
    // @ts-expect-error Mismatched config types
    dateFormatLegacy: coreUtils.time.getDateFormat(config),
    departArrive,
    sort,
    time,
    // This prop is for legacy browsers (see render method above).
    // @ts-expect-error Mismatched config types
    timeFormatLegacy: coreUtils.time.getTimeFormat(config)
  }
}

const mapDispatchToProps = {
  setQueryParam: formActions.setQueryParam,
  updateItineraryFilter: narrativeActions.updateItineraryFilter
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeModal)

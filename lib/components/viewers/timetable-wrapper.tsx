import { connect, useSelector } from 'react-redux'
import { endOfDay, format } from 'date-fns'
import { FormattedMessage } from 'react-intl'
import { matchPath } from 'react-router'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import TimeTable from '@opentripplanner/timetable'

import * as apiActions from '../../actions/api'
import { AppReduxState } from '../../util/state-types'
import { TIMETABLE_PATH } from '../../util/constants'
import { TimetableDataParams } from '../util/types'
import AppModule from '../app/app-module'
import Loading from '../narrative/loading'

interface TimeTableWrapperProps {
  closedStops?: Set<string>
  getStopClosures: (date: Date) => void
  getTimetableData: (params: TimetableDataParams) => void
  homeTimezone: string
  routeId: string
  stopClosuresError?: string
}

const TimeTableWrapper = (props: TimeTableWrapperProps): JSX.Element => {
  const {
    closedStops,
    getStopClosures,
    getTimetableData,
    homeTimezone,
    routeId,
    stopClosuresError
  } = props

  const timetable = useSelector(
    (state: AppReduxState) => state.otp.ui.timetable
  )

  const handleRouteUrlClick = useCallback(
    (e) => {
      e.preventDefault()
      window.open(timetable?.route?.url, undefined, 'width=1000,height=800')
    },
    [timetable]
  )

  const [directionId, setDirectionId] = useState<0 | 1>(0)
  const [timepointsOnly, setTimepointsOnly] = useState(true)
  const [loading, setLoading] = useState(true)
  // Initialize to the current date in the config's timezone
  const [date, setDate] = useState<string>(
    format(utcToZonedTime(Date.now(), homeTimezone), 'yyyy-MM-dd')
  )

  useEffect(() => {
    setLoading(true)
    // TODO: Determine best way to handle stop closures that start/end somewhere in the
    // middle of a service day. For now, we will be conservative and ask for stop closures
    // that are valid at 23:59 of the given day; this will capture closures that took effect
    // (started) during the service day, but will not include closures that ended sometime
    // during the service day.

    // Midnight local time at beginning of service day:
    const stopClosuresDate = zonedTimeToUtc(date, homeTimezone)
    // Shift to end of day to capture stop closures that begin on this date:
    getStopClosures(endOfDay(stopClosuresDate))

    getTimetableData({
      date,
      routeGtfsId: routeId
    })
  }, [date, getTimetableData, routeId, getStopClosures, homeTimezone])

  const routeInformation = useMemo(() => timetable?.route, [timetable])

  useEffect(() => {
    // TODO: improve handling of data fetching to avoid issues with useEffect and stale data.
    // This will be important when the capability to fetch timetables for different dates via a calendar
    // is added.
    if (routeInformation) setLoading(false)
  }, [routeInformation])

  const directionIdsAreInvalid = useMemo(() => {
    const invalid = routeInformation?.patterns?.some(
      (pattern: any) => ![0, 1].includes(pattern?.directionId)
    )

    if (invalid)
      console.warn(
        'Direction IDs of timetable data are not valid (must be 0 or 1 for every pattern)'
      )

    return invalid
  }, [routeInformation])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length) setDate(e.target.value)
  }

  if (loading) {
    // TODO: add aria status region to the body
    return <Loading />
  }

  if (stopClosuresError)
    console.warn('Error loading stop closures', stopClosuresError)

  if (!closedStops) console.warn('No stop closures object is defined')

  return (
    <AppModule load={['call']}>
      {routeId && routeInformation && !directionIdsAreInvalid ? (
        <div>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {(stopClosuresError || !closedStops) && (
              <FormattedMessage id="components.Timetable.errorLoadingStopClosures" />
            )}
            <button
              onClick={() => {
                setTimepointsOnly(!timepointsOnly)
              }}
            >
              {timepointsOnly ? (
                <FormattedMessage id="components.Timetable.showAllStops" />
              ) : (
                <FormattedMessage id="components.Timetable.showTimepointsOnly" />
              )}
            </button>
            <button onClick={() => setDirectionId(directionId === 1 ? 0 : 1)}>
              <FormattedMessage id="components.Timetable.switchDirection" />
            </button>
            <span>{`${routeInformation.shortName}: ${routeInformation.desc}`}</span>
            {routeInformation.url && (
              <a href={routeInformation.url} onClick={handleRouteUrlClick}>
                <FormattedMessage id="components.Timetable.routeInformation" />
              </a>
            )}
            <label htmlFor="date-picker">
              <FormattedMessage id="components.Timetable.timetableDate" />
            </label>
            <input
              id="date-picker"
              onChange={handleDateChange}
              type="date"
              value={date}
            />
          </div>
          {routeInformation && (
            <div style={{ overflow: 'scroll' }}>
              <TimeTable
                additionalColumns={[
                  'NOTICES',
                  'BLOCK_ID',
                  'TRIP_SHORT_NAME',
                  'TRIP_HEADSIGN',
                  'TRIP_ID'
                ]}
                closedStops={closedStops}
                directionId={directionId}
                includeDwellStops
                route={routeInformation}
                timepointsOnly={timepointsOnly}
              />
            </div>
          )}
        </div>
      ) : (
        <FormattedMessage id="components.Timetable.errorLoadingTimetable" />
      )}
    </AppModule>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  const { pathname } = state.router.location
  const match = matchPath<{ routeId: string }>(pathname, {
    exact: true,
    path: TIMETABLE_PATH(':routeId'),
    strict: false
  })
  const routeId = match?.params.routeId ?? ''

  return {
    closedStops: state.otp.ui.stopClosures.closedStops,
    homeTimezone: state.otp.config.homeTimezone,
    routeId,
    stopClosuresError: state.otp.ui.stopClosures.error
  }
}

const mapDispatchToProps = {
  getStopClosures: apiActions.getStopClosures,
  getTimetableData: apiActions.getTimetableData
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeTableWrapper)

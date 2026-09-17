import { connect, useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { matchPath } from 'react-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import TimeTable from '@opentripplanner/timetable'

import * as apiActions from '../../actions/api'
import { AppReduxState } from '../../util/state-types'
import { TIMETABLE_PATH } from '../../util/constants'
import { TimetableDataParams } from '../util/types'
import Loading from '../narrative/loading'

interface TimeTableWrapperProps {
  /** A map of closed stops. Keys are route gtfsIds, values are sets of gtfsIds for stops that are closed on that route */
  closedStops?: Map<string, Set<string>>
  getStopClosures: () => void
  getTimetableData: (params: TimetableDataParams) => void
  routeId: string
  stopClosuresError?: string
}

// eslint-disable-next-line complexity
const TimeTableWrapper = (props: TimeTableWrapperProps): JSX.Element => {
  const {
    closedStops,
    getStopClosures,
    getTimetableData,
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

  const closedStopsSet = useMemo(
    () => closedStops?.get(routeId),
    [closedStops, routeId]
  )

  useEffect(() => {
    getStopClosures()

    getTimetableData({
      date: new Date(),
      routeGtfsId: routeId
    })
  }, [getTimetableData, routeId, getStopClosures])

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

  const directionNames = useMemo(() => {
    const map = new Map<number, string[]>()

    routeInformation?.patterns?.forEach((pattern: any) => {
      const dirId = pattern.directionId
      const names = (map.get(dirId) || []).concat([pattern.name])
      map.set(dirId, names)
    })

    return map
  }, [routeInformation])

  if (loading) {
    // TODO: add aria status region to the body
    return <Loading />
  }

  if (stopClosuresError)
    console.warn('Error loading stop closures', stopClosuresError)

  if (!closedStops) console.warn('No stop closures object is defined')

  return routeId && routeInformation && !directionIdsAreInvalid ? (
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
        {(directionNames.get(directionId) || []).map((dirName) => (
          <span key={dirName}>{dirName}</span>
        ))}
        {routeInformation.url && (
          <a href={routeInformation.url} onClick={handleRouteUrlClick}>
            <FormattedMessage id="components.Timetable.routeInformation" />
          </a>
        )}
      </div>
      {routeInformation && (
        <div style={{ overflow: 'scroll' }}>
          <TimeTable
            closedStops={closedStopsSet}
            directionId={directionId}
            includeDwellStops
            route={timetable.route}
            showBlockId
            timepointsOnly={timepointsOnly}
          />
        </div>
      )}
    </div>
  ) : (
    <FormattedMessage id="components.Timetable.errorLoadingTimetable" />
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
    routeId,
    stopClosuresError: state.otp.ui.stopClosures.error
  }
}

const mapDispatchToProps = {
  getStopClosures: apiActions.getStopClosures,
  getTimetableData: apiActions.getTimetableData
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeTableWrapper)

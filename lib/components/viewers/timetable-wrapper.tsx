import { connect, useSelector } from 'react-redux'
import { format } from 'date-fns'
import { FormattedMessage } from 'react-intl'
import { matchPath } from 'react-router'
import React, { useEffect, useMemo, useState } from 'react'
import TimeTable from '@opentripplanner/timetable'

import * as apiActions from '../../actions/api'
import { AppReduxState } from '../../util/state-types'
import { TIMETABLE_PATH } from '../../util/constants'
import { TimetableDataParams } from '../util/types'
import Loading from '../narrative/loading'

interface TimeTableWrapperProps {
  /** A map of closed stops. Keys are route gtfsIds, values are sets of gtfsIds for stops that are closed on that route */
  closedStops?: Map<string, Set<string>>
  getTimetableData: (params: TimetableDataParams) => void
  routeId: string
  stopClosuresError?: string
  stopClosuresQuery: () => void
}

const TimeTableWrapper = (props: TimeTableWrapperProps): JSX.Element => {
  const {
    closedStops,
    getTimetableData,
    routeId,
    stopClosuresError,
    stopClosuresQuery
  } = props

  const timetable = useSelector(
    (state: AppReduxState) => state.otp.ui.timetable
  )

  const [directionId, setDirectionId] = useState<0 | 1>(0)
  const [timepointsOnly, setTimepointsOnly] = useState(true)
  const [loading, setLoading] = useState(true)

  const closedStopsSet = useMemo(
    () => closedStops?.get(routeId),
    [closedStops, routeId]
  )

  useEffect(() => {
    stopClosuresQuery()
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    getTimetableData({
      end: format(tomorrow, 'yyyy-MM-dd'),
      gtfsId: routeId,
      serviceDate: format(today, 'yyyyMMdd'),
      start: format(today, 'yyyy-MM-dd')
    })
  }, [getTimetableData, routeId, stopClosuresQuery])

  useEffect(() => {
    if (timetable?.route) setLoading(false)
  }, [timetable])

  const directionNames = useMemo(() => {
    const map = new Map<number, string[]>()

    timetable?.route?.patterns?.forEach((pattern: any) => {
      const dirId = pattern.directionId
      const names = (map.get(dirId) || []).concat([pattern.name])
      map.set(dirId, names)
    })

    return map
  }, [timetable])

  if (loading) {
    return <Loading />
  }

  return routeId && timetable?.route ? (
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
      </div>
      {timetable && (
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
    path: TIMETABLE_PATH,
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
  getTimetableData: apiActions.getTimetableData,
  stopClosuresQuery: apiActions.stopClosuresQuery
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeTableWrapper)

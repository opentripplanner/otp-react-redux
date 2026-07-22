import { connect, useSelector } from 'react-redux'
import { format } from 'date-fns'
import React, { useEffect, useMemo, useState } from 'react'
import TimeTable from '@opentripplanner/timetable'

import * as apiActions from '../../actions/api'
import { AppReduxState } from '../../util/state-types'

interface TimeTableWrapperProps {
  /** A map of closed stops. Keys are route gtfsIds, values are sets of gtfsIds for stops that are closed on that route */
  closedStops?: Map<string, Set<string>>
  getTimetableData: (params: any) => void // TYPE TYPE TYPE
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

  // TODO: improve this with typing on timetable object
  const directionNames = new Map<number, string[]>()

  const closedStopsSet = useMemo(
    () => closedStops?.get(routeId || ''),
    [closedStops, routeId]
  )

  useEffect(() => {
    stopClosuresQuery()
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // need to migrate data fetching to local state instead of redux
    getTimetableData({
      end: format(tomorrow, 'yyyy-MM-dd'),
      gtfsId: routeId,
      serviceDate: format(today, 'yyyyMMdd'),
      start: format(today, 'yyyy-MM-dd')
    })
  }, [])

  useEffect(() => {
    if (timetable?.route) setLoading(false)
  }, [timetable])

  timetable?.route?.patterns?.forEach((pattern: any) => {
    const dirId = pattern.directionId
    const names = (directionNames.get(dirId) || []).concat([pattern.name])
    directionNames.set(dirId, names)
  })

  if (loading) {
    return <div>loading!</div>
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
          <span>Error loading stop closures</span>
        )}
        <button
          onClick={() => {
            setTimepointsOnly(!timepointsOnly)
          }}
        >
          {timepointsOnly ? 'Show All Stops' : 'Show Timepoints Only'}
        </button>
        <button onClick={() => setDirectionId(directionId === 1 ? 0 : 1)}>
          Switch Direction
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
    <>no route ID provided</>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  const { pathname } = state.router.location
  const split = pathname.split('/')
  const routeId = split[split.length - 1]

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

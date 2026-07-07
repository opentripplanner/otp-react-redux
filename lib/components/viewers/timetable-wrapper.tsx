import { connect } from 'react-redux'
import React, { useState } from 'react'
import TimeTable from '@opentripplanner/timetable'

import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'

import PortalWrapper from './popout'

interface TimeTableWrapperProps {
  /** A map of closed stops. Keys are route gtfsIds, values are sets of gtfsIds for stops that are closed on that route */
  closedStops?: Map<string, Set<string>>
  /** The value of the portal ID in application state. If defined, it refers to the gtfsId of the route whose timetable
   * is to be displayed in the portal
   */
  portalId: string | undefined
  setPortalId: (portalId?: string) => void
  stopClosuresError?: string
  timetable: any // TODO: add typing
}

const TimeTableWrapper = (props: TimeTableWrapperProps): JSX.Element => {
  const { closedStops, portalId, setPortalId, stopClosuresError, timetable } =
    props

  const [directionId, setDirectionId] = useState<0 | 1>(0)
  const [timepointsOnly, setTimepointsOnly] = useState(true)

  // TODO: improve this with typing on timetable object
  const directionNames = new Map<number, string[]>()
  timetable?.route?.patterns?.forEach((pattern: any) => {
    const dirId = pattern.directionId
    const names = (directionNames.get(dirId) || []).concat([pattern.name])
    directionNames.set(dirId, names)
  })

  const closedStopsSet = closedStops?.get(portalId || '')

  return portalId ? (
    <PortalWrapper
      onClose={() => {
        setPortalId(undefined)
      }}
      title="timetable"
    >
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
    </PortalWrapper>
  ) : (
    <></>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  return {
    closedStops: state.otp.ui.stopClosures.closedStops,
    portalId: state.otp.ui.portalId,
    stopClosuresError: state.otp.ui.stopClosures.error,
    timetable: state.otp.ui.timetable
  }
}

const mapDispatchToProps = {
  setPortal: uiActions.setPortalId
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeTableWrapper)

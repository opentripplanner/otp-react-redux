import { connect } from 'react-redux'
import React, { useState } from 'react'
import TimeTable from '@opentripplanner/timetable'

import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'

import WindowPortal from './popout'

interface TimeTableWrapperProps {
  portal: boolean
  setPortal: (portal: boolean) => void
  timetable: any
}

const TimeTableWrapper = (props: TimeTableWrapperProps): JSX.Element => {
  const { portal, setPortal, timetable } = props

  const [directionId, setDirectionId] = useState<0 | 1>(0)
  const [timepointsOnly, setTimepointsOnly] = useState(true)

  // TODO: move this to the timetable package
  const directionNames = new Map<number, string[]>()
  timetable?.route?.patterns?.forEach((pattern) => {
    const dirId = pattern.directionId
    const names = (directionNames.get(dirId) || []).concat([pattern.name])
    directionNames.set(dirId, names)
  })

  return portal ? (
    <WindowPortal onClose={() => setPortal(false)}>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
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
            directionId={directionId}
            includeDwellStops
            route={timetable.route}
            showBlockId
            timepointsOnly={timepointsOnly}
          />
        </div>
      )}
    </WindowPortal>
  ) : (
    <></>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  return {
    portal: state.otp.ui.portal,
    timetable: state.otp.ui.timetable
  }
}

const mapDispatchToProps = {
  setPortal: uiActions.setPortal
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeTableWrapper)

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

  console.log('hello world')

  return portal ? (
    <WindowPortal onClose={() => setPortal(false)}>
      <button
        onClick={() => {
          setTimepointsOnly(!timepointsOnly)
          console.log('click!')
        }}
      >
        {timepointsOnly ? 'Show All Stops' : 'Show Timepoints Only'}
      </button>
      <button onClick={() => setDirectionId(directionId === 1 ? 0 : 1)}>
        {directionId === 0 ? 'One Direction' : 'Another Direction'}
      </button>
      {timetable && (
        <TimeTable
          directionId={directionId}
          route={timetable.route}
          timepointsOnly={timepointsOnly}
        />
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

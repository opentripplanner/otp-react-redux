import { connect } from 'react-redux'
import React, { useState } from 'react'
import styled from 'styled-components'
import TimeTable from '@opentripplanner/timetable'

import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'

import WindowPortal from './popout'

const TimetableButtonsWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const TimetableScrollContainer = styled.div`
  overflow: scroll;
`

interface TimeTableWrapperProps {
  portal: boolean
  setPortal: (portal: boolean) => void
  timetable: any // TODO: add typing
}

const TimeTableWrapper = (props: TimeTableWrapperProps): JSX.Element => {
  const { portal, setPortal, timetable } = props

  const [directionId, setDirectionId] = useState<0 | 1>(0)
  const [timepointsOnly, setTimepointsOnly] = useState(true)

  // TODO: improve this with typing on timetable object
  const directionNames = new Map<number, string[]>()
  timetable?.route?.patterns?.forEach((pattern: any) => {
    const dirId = pattern.directionId
    const names = (directionNames.get(dirId) || []).concat([pattern.name])
    directionNames.set(dirId, names)
  })

  return portal ? (
    <WindowPortal onClose={() => setPortal(false)}>
      <TimetableButtonsWrapper>
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
      </TimetableButtonsWrapper>
      {timetable && (
        <TimetableScrollContainer>
          <TimeTable
            directionId={directionId}
            includeDwellStops
            route={timetable.route}
            showBlockId
            timepointsOnly={timepointsOnly}
          />
        </TimetableScrollContainer>
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

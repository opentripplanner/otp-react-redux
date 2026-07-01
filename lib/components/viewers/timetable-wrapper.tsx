import { connect } from 'react-redux'
import React, { useState } from 'react'
import TimeTable from '@opentripplanner/timetable'

import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'

import PortalWrapper from './popout'

interface TimeTableWrapperProps {
  closedStops: Map<string, Set<string>>
  portal: string | undefined
  setPortal: (portal: string | undefined) => void
  timetable: any // TODO: add typing
}

const TimeTableWrapper = (props: TimeTableWrapperProps): JSX.Element => {
  const { closedStops, portal, setPortal, timetable } = props

  const [directionId, setDirectionId] = useState<0 | 1>(0)
  const [timepointsOnly, setTimepointsOnly] = useState(true)

  // TODO: improve this with typing on timetable object
  const directionNames = new Map<number, string[]>()
  timetable?.route?.patterns?.forEach((pattern: any) => {
    const dirId = pattern.directionId
    const names = (directionNames.get(dirId) || []).concat([pattern.name])
    directionNames.set(dirId, names)
  })

  const stopsSet = closedStops?.get(portal || '')

  return portal ? (
    <PortalWrapper
      onClose={() => {
        setPortal(undefined)
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
            closedStops={stopsSet}
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
    closedStops: state.otp.ui.stopClosures,
    portal: state.otp.ui.portal,
    timetable: state.otp.ui.timetable
  }
}

const mapDispatchToProps = {
  setPortal: uiActions.setPortal
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeTableWrapper)

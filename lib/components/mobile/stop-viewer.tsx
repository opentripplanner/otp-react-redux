import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import React, { useCallback } from 'react'

import * as uiActions from '../../actions/ui'
import { SetViewedStopHandler } from '../util/types'
import DefaultMap from '../map/default-map'
import StopScheduleViewer from '../viewers/stop-schedule-viewer'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

interface Props {
  setViewedStop: SetViewedStopHandler
}

const MobileStopViewer = ({ setViewedStop }: Props) => {
  const intl = useIntl()
  return (
    <MobileContainer>
      <MobileNavigationBar
        headerText={intl.formatMessage({ id: 'components.StopViewer.header' })}
        onBackClicked={useCallback(() => setViewedStop(null), [setViewedStop])}
      />
      <main tabIndex={-1}>
        <div className="viewer-container">
          <StopScheduleViewer hideBackButton />
        </div>

        {/* The map is less important semantically, so keyboard focus and screen readers
            will focus on the stop viewer first. The map will still appear first visually. */}
        <div className="viewer-map">
          <DefaultMap />
        </div>
      </main>
    </MobileContainer>
  )
}

// connect to the redux store

const mapDispatchToProps = {
  setViewedStop: uiActions.setViewedStop
}

export default connect(null, mapDispatchToProps)(MobileStopViewer)

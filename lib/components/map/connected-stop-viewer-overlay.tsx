import { connect } from 'react-redux'
import { Stop } from '@opentripplanner/types'
import DefaultStopMarker from '@opentripplanner/stop-viewer-overlay/esm/default-stop-marker'
import React from 'react'
import StopViewerOverlay from '@opentripplanner/stop-viewer-overlay'

import { AppReduxState } from '../../util/state-types'
import { MainPanelContent } from '../../actions/ui-constants'

interface Props {
  stop?: Stop
}

const Overlay = ({ stop }: Props): JSX.Element | null => {
  // FIXME: In its current form, the StopViewerOverlay component only accepts valid stops (with lat, lon)
  // and the marker and visible props must be specified.
  if (stop?.lat && stop?.lon) {
    return (
      <StopViewerOverlay stop={stop} StopMarker={DefaultStopMarker} visible />
    )
  }
  return null
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => {
  const { transitIndex, ui } = state.otp
  if (ui.mainPanelContent === MainPanelContent.STOP_VIEWER) {
    const stopLookup = transitIndex.stops
    const stopId = ui.viewedStop?.stopId
    const stopData = stopLookup[stopId]

    if (stopData?.lat && stopData?.lon) {
      return {
        stop: stopData
      }
    }
  }

  return {
    stop: null
  }
}

export default connect(mapStateToProps)(Overlay)

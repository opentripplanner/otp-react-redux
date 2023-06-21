import { connect } from 'react-redux'
import React, { HTMLAttributes } from 'react'

import { MainPanelContent } from '../../actions/ui-constants'

import PatternViewer from './pattern-viewer'
import RouteViewer from './route-viewer'
import StopViewer from './stop-viewer'
import TripViewer from './trip-viewer'

interface Props extends HTMLAttributes<HTMLDivElement> {
  isViewingStop: boolean
  mainPanelContent: number
}

const ViewerContainer = ({
  children,
  className,
  isViewingStop,
  mainPanelContent,
  style
}: Props) => {
  // check for main panel content
  switch (mainPanelContent) {
    case MainPanelContent.ROUTE_VIEWER:
      return <RouteViewer hideBackButton hideHeader />
    case MainPanelContent.PATTERN_VIEWER:
      return <PatternViewer hideBackButton />
    case MainPanelContent.TRIP_VIEWER:
      return <TripViewer hideBackButton />
    default:
      // check for stop viewer
      if (isViewingStop) {
        return <StopViewer hideBackButton />
      }

      // otherwise, return default content
      return (
        <div className={className} style={style}>
          {children}
        </div>
      )
  }
}

// connect to the redux store

const mapStateToProps = (state: any) => {
  const { mainPanelContent, viewedStop } = state.otp.ui
  return {
    isViewingStop: !!viewedStop,
    mainPanelContent
  }
}

export default connect(mapStateToProps)(ViewerContainer)

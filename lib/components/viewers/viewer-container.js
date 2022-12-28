import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { MainPanelContent } from '../../actions/ui'

import RouteViewer from './route-viewer'
import StopViewer from './stop-viewer'
import TripViewer from './trip-viewer'

class ViewerContainer extends Component {
  static propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
    style: PropTypes.object,
    uiState: PropTypes.object
  }

  render() {
    const { className, style, uiState } = this.props

    // check for main panel content
    if (
      uiState.mainPanelContent === MainPanelContent.ROUTE_VIEWER ||
      uiState.mainPanelContent === MainPanelContent.PATTERN_VIEWER
    ) {
      return <RouteViewer hideBackButton />
    }

    // check for stop viewer
    if (uiState.viewedStop) {
      return <StopViewer hideBackButton />
    }

    if (uiState.mainPanelContent === MainPanelContent.TRIP_VIEWER) {
      return <TripViewer hideBackButton />
    }

    // check for trip viewer

    // otherwise, return default content
    return (
      <div className={className} style={style}>
        {this.props.children}
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    uiState: state.otp.ui
  }
}

export default connect(mapStateToProps)(ViewerContainer)

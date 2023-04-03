import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { MainPanelContent } from '../../actions/ui-constants'

import PatternViewer from './pattern-viewer'
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
    if (uiState.mainPanelContent === MainPanelContent.ROUTE_VIEWER) {
      return <RouteViewer hideBackButton />
    } else if (uiState.mainPanelContent === MainPanelContent.PATTERN_VIEWER) {
      return <PatternViewer hideBackButton />
    }

    // check for stop viewer
    if (uiState.viewedStop) {
      return <StopViewer hideBackButton />
    }

    // check for trip viewer
    if (uiState.mainPanelContent === MainPanelContent.TRIP_VIEWER) {
      return <TripViewer hideBackButton />
    }

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

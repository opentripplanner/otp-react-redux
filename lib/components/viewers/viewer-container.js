import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { MainPanelContent } from '../../actions/ui'

import StopViewer from './stop-viewer'
import TripViewer from './trip-viewer'
import RouteViewer from './route-viewer'

class ViewerContainer extends Component {
  static propTypes = {
    className: PropTypes.string,
    uiState: PropTypes.object
  }

  render () {
    const { className, uiState } = this.props

    // check for main panel content
    if (uiState.mainPanelContent === MainPanelContent.ROUTE_VIEWER) {
      return <RouteViewer />
    }

    // check for stop viewer
    if (uiState.viewedStop) {
      return <StopViewer />
    }

    if (uiState.viewedTrip) {
      return <TripViewer />
    }

    // check for trip viewer

    // otherwise, return default content
    return (
      <div className={className}>
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

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
//import { Navbar, Button } from 'react-bootstrap'

import StopViewer from './stop-viewer'
import TripViewer from './trip-viewer'
//import { setMobileScreen } from '../../actions/ui'

class ViewerContainer extends Component {
  static propTypes = {
    uiState: PropTypes.object
  }

  render () {
    const { uiState } = this.props

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
      <div>
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

const mapDispatchToProps = {
}

export default connect(mapStateToProps)(ViewerContainer)

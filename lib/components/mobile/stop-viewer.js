import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

import StopViewer from '../viewers/stop-viewer'
import DefaultMap from '../map/default-map'

import { clearViewedStop } from '../../actions/ui'

class MobileStopViewer extends Component {
  static propTypes = {
  }

  render () {
    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText={'STOP VIEWER'}
          showBackButton
          onBackClicked={() => { this.props.clearViewedStop() }}
        />

        {/* include map as fixed component */}
        <div style={{ height: 200 }}>
          <DefaultMap />
        </div>

        {/* include StopViewer in embedded scrollable panel */}
        <div className='viewer-container'>
          <StopViewer hideBackButton />
        </div>
      </MobileContainer>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return { }
}

const mapDispatchToProps = {
  clearViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileStopViewer)

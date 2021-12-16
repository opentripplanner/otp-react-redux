import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import StopViewer from '../viewers/stop-viewer'
import DefaultMap from '../map/default-map'
import { setViewedStop } from '../../actions/ui'

import MobileNavigationBar from './navigation-bar'
import MobileContainer from './container'

class MobileStopViewer extends Component {
  static propTypes = {
    setViewedStop: PropTypes.func
  }

  render () {
    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText={<FormattedMessage id='components.StopViewer.header' />}
          onBackClicked={() => { this.props.setViewedStop(null) }}
          showBackButton
        />

        {/* include map as fixed component */}
        <div className='viewer-map'>
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
  setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileStopViewer)

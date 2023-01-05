import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { setViewedStop } from '../../actions/ui'
import DefaultMap from '../map/default-map'
import StopViewer from '../viewers/stop-viewer'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

class MobileStopViewer extends Component {
  static propTypes = {
    setViewedStop: PropTypes.func
  }

  render() {
    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText={<FormattedMessage id="components.StopViewer.header" />}
          onBackClicked={() => {
            this.props.setViewedStop(null)
          }}
        />

        {/* include map as fixed component */}
        <div className="viewer-map">
          <DefaultMap />
        </div>

        {/* include StopViewer in embedded scrollable panel */}
        <div className="viewer-container">
          <StopViewer hideBackButton />
        </div>
      </MobileContainer>
    )
  }
}

// connect to the redux store

const mapDispatchToProps = {
  setViewedStop
}

export default connect(null, mapDispatchToProps)(MobileStopViewer)

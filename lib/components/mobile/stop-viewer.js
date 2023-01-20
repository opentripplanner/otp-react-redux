import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import * as uiActions from '../../actions/ui'
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
        <main tabIndex={-1}>
          <div className="viewer-container">
            <StopViewer hideBackButton />
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
}

// connect to the redux store

const mapDispatchToProps = {
  setViewedStop: uiActions.setViewedStop
}

export default connect(null, mapDispatchToProps)(MobileStopViewer)

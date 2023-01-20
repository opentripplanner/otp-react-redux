import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import * as uiActions from '../../actions/ui'
import DefaultMap from '../map/default-map'
import TripViewer from '../viewers/trip-viewer'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

class MobileTripViewer extends Component {
  static propTypes = {
    setViewedTrip: PropTypes.func
  }

  _onBackClicked = () => {
    this.props.setViewedTrip(null)
  }

  render() {
    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText={<FormattedMessage id="components.TripViewer.header" />}
          onBackClicked={this._onBackClicked}
        />
        <main tabIndex={-1}>
          <div className="viewer-container">
            <TripViewer hideBackButton />
          </div>

          {/* The map is less important semantically, so keyboard focus and screen readers
              will focus on the route viewer first. The map will still appear first visually. */}
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
  setViewedTrip: uiActions.setViewedTrip
}

export default connect(null, mapDispatchToProps)(MobileTripViewer)

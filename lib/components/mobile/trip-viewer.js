import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { setViewedTrip } from '../../actions/ui'
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

        {/* include map as fixed component */}
        <div className="viewer-map">
          <DefaultMap />
        </div>

        {/* include TripViewer in embedded scrollable panel */}
        <div className="viewer-container">
          <TripViewer hideBackButton />
        </div>
      </MobileContainer>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = {
  setViewedTrip
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileTripViewer)

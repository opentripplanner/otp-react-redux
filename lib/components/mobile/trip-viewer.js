import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import TripViewer from '../viewers/trip-viewer'
import DefaultMap from '../map/default-map'
import { setViewedTrip } from '../../actions/ui'

import MobileNavigationBar from './navigation-bar'
import MobileContainer from './container'

class MobileTripViewer extends Component {
  static propTypes = {
    setViewedTrip: PropTypes.func
  }

  _onBackClicked = () => { this.props.setViewedTrip(null) }

  render () {
    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText={this.props.languageConfig.tripViewer || 'Trip Viewer'}
          onBackClicked={this._onBackClicked}
          showBackButton
        />

        {/* include map as fixed component */}
        <div className='viewer-map'>
          <DefaultMap />
        </div>

        {/* include TripViewer in embedded scrollable panel */}
        <div className='viewer-container'>
          <TripViewer hideBackButton />
        </div>
      </MobileContainer>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    languageConfig: state.otp.config.language
  }
}

const mapDispatchToProps = {
  setViewedTrip
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileTripViewer)

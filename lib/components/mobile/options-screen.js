import React, { Component } from 'react'
import { connect } from 'react-redux'

import ConnectedSettingsSelectorPanel from '../form/connected-settings-selector-panel'
import PlanTripButton from '../form/plan-trip-button'
import { MobileScreens, setMobileScreen } from '../../actions/ui'

import MobileNavigationBar from './navigation-bar'
import MobileContainer from './container'

class MobileOptionsScreen extends Component {
  _planTripClicked = () => {
    this.props.setMobileScreen(MobileScreens.RESULTS_SUMMARY)
  }

  render () {
    return (
      <MobileContainer>
        <MobileNavigationBar
          backScreen={MobileScreens.SEARCH_FORM}
          headerText='Set Search Options'
          showBackButton
        />

        <div className='options-main-content mobile-padding'>
          <ConnectedSettingsSelectorPanel />
        </div>

        <div className='options-lower-tray mobile-padding'>
          <PlanTripButton onClick={this._planTripClicked} />
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
  setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileOptionsScreen)

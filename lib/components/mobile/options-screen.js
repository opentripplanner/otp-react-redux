import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'
import SettingsSelectorPanel from '../form/settings-selector-panel'
import PlanTripButton from '../form/plan-trip-button'

import { MobileScreens, setMobileScreen } from '../../actions/ui'

class MobileOptionsScreen extends Component {
  static propTypes = {
    icons: PropTypes.object
  }

  _planTripClicked = () => {
    this.props.setMobileScreen(MobileScreens.RESULTS_SUMMARY)
  }

  render () {
    const { icons } = this.props

    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText='Set Search Options'
          showBackButton
          backScreen={MobileScreens.SEARCH_FORM}
        />

        <div className='options-main-content mobile-padding'>
          <SettingsSelectorPanel icons={icons} />
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

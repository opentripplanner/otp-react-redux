import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'
import DateTimeModal from '../form/date-time-modal'
import PlanTripButton from '../form/plan-trip-button'

import { MobileScreens, setMobileScreen } from '../../actions/ui'

class MobileDateTimeScreen extends Component {
  static propTypes = {
    setMobileScreen: PropTypes.func
  }

  _planTripClicked = () => {
    this.props.setMobileScreen(MobileScreens.RESULTS_SUMMARY)
  }

  render () {
    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText='Set Date/Time'
          showBackButton
          backScreen={MobileScreens.SEARCH_FORM}
        />

        <div className='options-main-content mobile-padding'>
          <DateTimeModal />
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

export default connect(mapStateToProps, mapDispatchToProps)(MobileDateTimeScreen)

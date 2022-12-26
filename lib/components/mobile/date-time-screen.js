import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { MobileScreens } from '../../actions/ui-constants'
import { setMobileScreen } from '../../actions/ui'
import DateTimeModal from '../form/date-time-modal'
import PlanTripButton from '../form/plan-trip-button'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

class MobileDateTimeScreen extends Component {
  static propTypes = {
    setMobileScreen: PropTypes.func
  }

  _planTripClicked = () => {
    this.props.setMobileScreen(MobileScreens.RESULTS_SUMMARY)
  }

  render() {
    return (
      <MobileContainer>
        <MobileNavigationBar
          backScreen={MobileScreens.SEARCH_FORM}
          headerText={
            <FormattedMessage id="components.DateTimeScreen.header" />
          }
          showBackButton
        />

        <div className="options-main-content mobile-padding">
          <DateTimeModal />
        </div>

        <div className="options-lower-tray mobile-padding">
          <PlanTripButton onClick={this._planTripClicked} />
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
  setMobileScreen
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MobileDateTimeScreen)

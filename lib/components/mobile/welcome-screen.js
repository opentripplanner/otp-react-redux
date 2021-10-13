import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import LocationField from '../form/connected-location-field'
import DefaultMap from '../map/default-map'
import { MobileScreens, setMobileScreen } from '../../actions/ui'
import { setLocationToCurrent } from '../../actions/map'

import MobileNavigationBar from './navigation-bar'
import MobileContainer from './container'

class MobileWelcomeScreen extends Component {
  static propTypes = {
    setLocationToCurrent: PropTypes.func,
    setMobileScreen: PropTypes.func
  }

  _toFieldClicked = () => {
    this.props.setMobileScreen(MobileScreens.SET_INITIAL_LOCATION)
  }

  /* Called when the user selects a from/to location using the selection
   * popup (invoked in mobile mode via a long tap). Note that BaseMap already
   * takes care of updating the query in the store w/ the selected location */

  _locationSetFromPopup = (selection) => {
    // If the tapped location was selected as the 'from' endpoint, set the 'to'
    // endpoint to be the current user location. (If selected as the 'to' point,
    // no action is needed since 'from' is the current location by default.)
    if (selection.type === 'from') {
      this.props.setLocationToCurrent({ locationType: 'to' })
    }
  }

  render () {
    return (
      <MobileContainer>
        <MobileNavigationBar headerText='Plan Your Trip' />
        <div className='welcome-location mobile-padding'>
          <LocationField
            inputPlaceholder='Where do you want to go?'
            locationType='to'
            onTextInputClick={this._toFieldClicked}
            showClearButton={false}
          />
        </div>
        <div className='welcome-map'>
          <DefaultMap onSetLocation={this._locationSetFromPopup} />
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
  setLocationToCurrent,
  setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileWelcomeScreen)

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import DefaultMap from '../map/default-map'
import LocationField from '../form/location-field'
import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

import { MobileScreens, setMobileScreen } from '../../actions/mobile'
import { setLocation } from '../../actions/map'
import { constructLocation } from '../../util/map'

class MobileWelcomeScreen extends Component {
  static propTypes = {
    map: PropTypes.element,

    setLocation: PropTypes.func,
    setMobileScreen: PropTypes.func
  }

  _mapClicked = (clickEvent) => {
    this.props.setLocation({
      type: 'to',
      location: constructLocation(clickEvent.latlng),
      reverseGeocode: true
    })
    this.props.setMobileScreen(MobileScreens.SEARCH_FORM)
  }

  _toFieldClicked = () => {
    this.props.setMobileScreen(MobileScreens.SET_INITIAL_LOCATION)
  }

  render () {
    return (
      <MobileContainer>
        <MobileNavigationBar />
        <div className='mobile-padding'>
          <LocationField
            type='to'
            label='Where do you want to go?'
            onClick={this._toFieldClicked}
            showClearButton={false}
          />
        </div>
        <div className='welcome-map'>
          <DefaultMap onClick={this._mapClicked} />
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
  setLocation,
  setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileWelcomeScreen)

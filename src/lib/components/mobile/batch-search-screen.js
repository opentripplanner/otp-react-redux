import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import BatchSettings from '../form/batch-settings'
import DefaultMap from '../map/default-map'
import LocationField from '../form/connected-location-field'
import SwitchButton from '../form/switch-button'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

import { MobileScreens, setMobileScreen } from '../../actions/ui'

const {
  SET_DATETIME,
  SET_FROM_LOCATION,
  SET_TO_LOCATION
} = MobileScreens

class BatchSearchScreen extends Component {
  static propTypes = {
    map: PropTypes.element,
    setMobileScreen: PropTypes.func
  }

  _fromFieldClicked = () => this.props.setMobileScreen(SET_FROM_LOCATION)

  _toFieldClicked = () => this.props.setMobileScreen(SET_TO_LOCATION)

  _expandDateTimeClicked = () => this.props.setMobileScreen(SET_DATETIME)

  render () {
    return (
      <MobileContainer>
        <MobileNavigationBar headerText='Plan Your Trip' />
        <div className='batch-search-settings mobile-padding'>
          <LocationField
            locationType='from'
            onTextInputClick={this._fromFieldClicked}
            showClearButton={false}
          />
          <LocationField
            locationType='to'
            onTextInputClick={this._toFieldClicked}
            showClearButton={false}
          />
          <div className='switch-button-container-mobile'>
            <SwitchButton content={<i className='fa fa-exchange fa-rotate-90' />} />
          </div>
          <BatchSettings />
        </div>
        <div className='batch-search-map'>
          <DefaultMap />
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

export default connect(mapStateToProps, mapDispatchToProps)(BatchSearchScreen)

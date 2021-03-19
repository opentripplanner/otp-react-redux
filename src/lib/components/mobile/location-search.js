import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'
import LocationField from '../form/connected-location-field'

import { MobileScreens, setMobileScreen } from '../../actions/ui'

class MobileLocationSearch extends Component {
  static propTypes = {
    backScreen: PropTypes.number,
    locationType: PropTypes.string
  }

  _locationSelected = () => {
    this.props.setMobileScreen(MobileScreens.SEARCH_FORM)
  }

  render () {
    const {
      backScreen,
      location,
      locationType,
      otherLocation
    } = this.props
    const suppressNearby = otherLocation &&
      otherLocation.category === 'CURRENT_LOCATION'
    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText={`Set ${locationType === 'to' ? 'Destination' : 'Origin'}`}
          showBackButton
          backScreen={backScreen}
        />
        <div className='location-search mobile-padding'>
          <LocationField
            hideExistingValue
            inputPlaceholder={location ? location.name : 'Enter location'}
            locationType={locationType}
            onLocationSelected={this._locationSelected}
            static
            suppressNearby={suppressNearby}
          />
        </div>
      </MobileContainer>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    location: state.otp.currentQuery[ownProps.locationType],
    otherLocation: ownProps.type === 'from'
      ? state.otp.currentQuery.to
      : state.otp.currentQuery.from
  }
}

const mapDispatchToProps = {
  setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileLocationSearch)

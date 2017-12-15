import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'
import LocationField from '../form/location-field'

import { MobileScreens, setMobileScreen } from '../../actions/mobile'

class MobileLocationSearch extends Component {
  static propTypes = {
    backScreen: PropTypes.number,
    locationType: PropTypes.string
  }

  _locationSelected = () => {
    this.props.setMobileScreen(MobileScreens.SEARCH_FORM)
  }

  render () {
    const { backScreen, locationType } = this.props
    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText={`SET ${locationType.toUpperCase()} LOCATION`}
          showBackButton
          backScreen={backScreen}
        />
        <div className='mobile-padding'>
          <LocationField
            type={locationType}
            hideExistingValue
            label='Enter location'
            static
            onLocationSelected={this._locationSelected}
          />
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

export default connect(mapStateToProps, mapDispatchToProps)(MobileLocationSearch)

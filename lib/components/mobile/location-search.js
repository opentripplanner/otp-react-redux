import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'

import LocationField from '../form/connected-location-field'
import { MobileScreens, setMobileScreen } from '../../actions/ui'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

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
      intl,
      location,
      locationType,
      otherLocation
    } = this.props
    const suppressNearby = otherLocation &&
      otherLocation.category === 'CURRENT_LOCATION'
    return (
      <MobileContainer>
        <MobileNavigationBar
          backScreen={backScreen}
          headerText={intl.formatMessage({
            id: `components.LocationSearch.set${locationType === 'to' ? 'Destination' : 'Origin'}`
          })}
          showBackButton
        />
        <div className='location-search mobile-padding'>
          <LocationField
            hideExistingValue
            inputPlaceholder={location
              ? location.name
              : intl.formatMessage({id: 'components.LocationSearch.enterLocation'})
            }
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

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(MobileLocationSearch))

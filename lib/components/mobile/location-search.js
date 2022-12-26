/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { MobileScreens } from '../../actions/ui-constants'
import { setMobileScreen } from '../../actions/ui'
import LocationField from '../form/connected-location-field'

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

  render() {
    const { backScreen, intl, location, locationType, otherLocation } =
      this.props
    const suppressNearby =
      otherLocation && otherLocation.category === 'CURRENT_LOCATION'
    return (
      <MobileContainer>
        <MobileNavigationBar
          backScreen={backScreen}
          headerText={
            locationType === 'to'
              ? intl.formatMessage({
                  id: 'components.LocationSearch.setDestination'
                })
              : intl.formatMessage({
                  id: 'components.LocationSearch.setOrigin'
                })
          }
        />
        <div className="location-search mobile-padding">
          <LocationField
            hideExistingValue
            inputPlaceholder={
              location
                ? location.name
                : intl.formatMessage({
                    id: 'components.LocationSearch.enterLocation'
                  })
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
    otherLocation:
      ownProps.type === 'from'
        ? state.otp.currentQuery.to
        : state.otp.currentQuery.from
  }
}

const mapDispatchToProps = {
  setMobileScreen
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(MobileLocationSearch))

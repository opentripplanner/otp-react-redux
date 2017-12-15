import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import MobileDateTimeScreen from './date-time-screen'
import MobileOptionsScreen from './options-screen'
import MobileLocationSearch from './location-search'
import MobileWelcomeScreen from './welcome-screen'
import MobileResultsScreen from './results-screen'
import MobileSearchScreen from './search-screen'

import { MobileScreens } from '../../actions/ui'

class MobileMain extends Component {
  static propTypes = {
    currentQuery: PropTypes.object,
    icons: PropTypes.object,
    itineraryClass: PropTypes.func,
    map: PropTypes.element,
    uiState: PropTypes.object
  }

  componentWillReceiveProps (nextProps) {
  }

  render () {
    const { icons, itineraryClass, map, uiState } = this.props

    switch (uiState.mobileScreen) {
      case MobileScreens.WELCOME_SCREEN:
        return <MobileWelcomeScreen map={map} />

      case MobileScreens.SET_INITIAL_LOCATION:
        return (
          <MobileLocationSearch
            locationType='to'
            backScreen={MobileScreens.WELCOME_SCREEN}
          />
        )

      case MobileScreens.SEARCH_FORM:
        return (
          <MobileSearchScreen
            icons={icons}
            map={map}
            newScreen={this.newScreen}
          />
        )

      case MobileScreens.SET_FROM_LOCATION:
        return (
          <MobileLocationSearch
            locationType='from'
            backScreen={MobileScreens.SEARCH_FORM}
          />
        )

      case MobileScreens.SET_TO_LOCATION:
        return (
          <MobileLocationSearch
            locationType='to'
            backScreen={MobileScreens.SEARCH_FORM}
          />
        )

      case MobileScreens.SET_DATETIME:
        return <MobileDateTimeScreen />

      case MobileScreens.SET_OPTIONS:
        return <MobileOptionsScreen icons={icons} />

      case MobileScreens.RESULTS_SUMMARY:
        return <MobileResultsScreen map={map} itineraryClass={itineraryClass} />

      default:
        return <p>Invalid mobile screen</p>
    }
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    uiState: state.otp.ui,
    currentQuery: state.otp.currentQuery
  }
}

export default connect(mapStateToProps)(MobileMain)

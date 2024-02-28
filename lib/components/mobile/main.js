import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { ComponentContext } from '../../util/contexts'
import { getActiveSearch } from '../../util/state'
import { MainPanelContent, MobileScreens } from '../../actions/ui-constants'
import { setMobileScreen } from '../../actions/ui'

import MobileDateTimeScreen from './date-time-screen'
import MobileLocationSearch from './location-search'
import MobileOptionsScreen from './options-screen'
import MobilePatternViewer from './pattern-viewer'
import MobileRouteViewer from './route-viewer'
import MobileStopViewer from './stop-viewer'
import MobileTripViewer from './trip-viewer'
import MobileWelcomeScreen from './welcome-screen'
import NearbyView from '../viewers/nearby/nearby-view'

class MobileMain extends Component {
  static propTypes = {
    activeSearch: PropTypes.object,
    currentPosition: PropTypes.object,
    currentQuery: PropTypes.object,
    setMobileScreen: PropTypes.func,
    uiState: PropTypes.object
  }

  static contextType = ComponentContext

  componentDidUpdate(prevProps) {
    const {
      activeSearch,
      currentPosition,
      currentQuery,
      setMobileScreen,
      uiState
    } = this.props

    if (
      !activeSearch &&
      uiState.mobileScreen === MobileScreens.RESULTS_SUMMARY
    ) {
      setMobileScreen(MobileScreens.SEARCH_FORM)
    }

    // Check if we are in the welcome screen and both locations have been set OR
    // auto-detect is denied and one location is set
    if (
      prevProps.uiState.mobileScreen === MobileScreens.WELCOME_SCREEN &&
      ((currentQuery.from && currentQuery.to) ||
        (!currentPosition.coords && (currentQuery.from || currentQuery.to)))
    ) {
      // If so, advance to main search screen
      setMobileScreen(MobileScreens.SEARCH_FORM)
    }

    // Display the results screen if an active search exists
    // (i.e. results are being fetched, or returned, or if there are errors).
    if (!prevProps.activeSearch && activeSearch) {
      setMobileScreen(MobileScreens.RESULTS_SUMMARY)
    }
  }

  // eslint-disable-next-line complexity
  render() {
    const { MobileResultsScreen, MobileSearchScreen } = this.context
    const { uiState } = this.props

    // eslint-disable-next-line default-case
    switch (uiState.mainPanelContent) {
      case MainPanelContent.NEARBY_VIEW:
        return <NearbyView mobile />
      case MainPanelContent.ROUTE_VIEWER:
        return <MobileRouteViewer />
      case MainPanelContent.PATTERN_VIEWER:
        return <MobilePatternViewer />
      case MainPanelContent.TRIP_VIEWER:
        return <MobileTripViewer />
    }

    // check for viewed stop
    if (uiState.viewedStop) return <MobileStopViewer />

    switch (uiState.mobileScreen) {
      case MobileScreens.WELCOME_SCREEN:
        return <MobileWelcomeScreen />

      case MobileScreens.SET_INITIAL_LOCATION:
        return (
          <MobileLocationSearch
            backScreen={MobileScreens.WELCOME_SCREEN}
            locationType="to"
          />
        )

      case MobileScreens.SEARCH_FORM:
        // Render batch search screen if batch routing enabled. Otherwise,
        // default to standard search screen.
        return <MobileSearchScreen newScreen={this.newScreen} />

      case MobileScreens.SET_FROM_LOCATION:
        return (
          <MobileLocationSearch
            backScreen={MobileScreens.SEARCH_FORM}
            locationType="from"
          />
        )

      case MobileScreens.SET_TO_LOCATION:
        return (
          <MobileLocationSearch
            backScreen={MobileScreens.SEARCH_FORM}
            locationType="to"
          />
        )

      case MobileScreens.SET_DATETIME:
        return <MobileDateTimeScreen />

      case MobileScreens.SET_OPTIONS:
        return <MobileOptionsScreen />

      case MobileScreens.RESULTS_SUMMARY:
        return <MobileResultsScreen />
      default:
        return <p>Invalid mobile screen</p>
    }
  }
}

// connect to the redux store

const mapStateToProps = (state) => {
  const { config, currentQuery, location, ui: uiState } = state.otp
  const activeSearch = getActiveSearch(state)
  return {
    activeSearch,
    config,
    currentPosition: location.currentPosition,
    currentQuery,
    uiState
  }
}

const mapDispatchToProps = {
  setMobileScreen: setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileMain)

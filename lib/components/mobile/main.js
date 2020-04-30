import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import MobileDateTimeScreen from './date-time-screen'
import MobileOptionsScreen from './options-screen'
import MobileLocationSearch from './location-search'
import MobileWelcomeScreen from './welcome-screen'
import MobileResultsScreen from './results-screen'
import MobileSearchScreen from './search-screen'
import MobileStopViewer from './stop-viewer'
import MobileTripViewer from './trip-viewer'
import MobileRouteViewer from './route-viewer'

import { MobileScreens, MainPanelContent, setMobileScreen } from '../../actions/ui'
import { getActiveItinerary } from '../../util/state'

class MobileMain extends Component {
  static propTypes = {
    currentQuery: PropTypes.object,
    icons: PropTypes.object,
    itineraryClass: PropTypes.func,
    LegIcon: PropTypes.elementType.isRequired,
    ModeIcon: PropTypes.elementType.isRequired,
    map: PropTypes.element,
    setMobileScreen: PropTypes.func,
    title: PropTypes.element,
    uiState: PropTypes.object
  }

  componentDidUpdate (prevProps) {
    // Check if we are in the welcome screen and both locations have been set OR
    // auto-detect is denied and one location is set
    if (
      prevProps.uiState.mobileScreen === MobileScreens.WELCOME_SCREEN && (
        (this.props.currentQuery.from && this.props.currentQuery.to) ||
        (!this.props.currentPosition.coords && (this.props.currentQuery.from || this.props.currentQuery.to))
      )
    ) {
      // If so, advance to main search screen
      this.props.setMobileScreen(MobileScreens.SEARCH_FORM)
    }

    if (!prevProps.activeItinerary && this.props.activeItinerary) {
      this.props.setMobileScreen(MobileScreens.RESULTS_SUMMARY)
    }
  }

  render () {
    const { icons, itineraryClass, itineraryFooter, LegIcon, map, title, uiState } = this.props

    // check for route viewer
    if (uiState.mainPanelContent === MainPanelContent.ROUTE_VIEWER) {
      return <MobileRouteViewer />
    }

    // check for viewed stop
    if (uiState.viewedStop) return <MobileStopViewer />

    // check for viewed trip
    if (uiState.viewedTrip) return <MobileTripViewer />

    switch (uiState.mobileScreen) {
      case MobileScreens.WELCOME_SCREEN:
        return <MobileWelcomeScreen map={map} title={title} />

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
        return <MobileOptionsScreen ModeIcon={ModeIcon} />

      case MobileScreens.RESULTS_SUMMARY:
        return <MobileResultsScreen map={map} itineraryClass={itineraryClass} itineraryFooter={itineraryFooter} icons={icons} LegIcon={LegIcon} />

      default:
        return <p>Invalid mobile screen</p>
    }
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    uiState: state.otp.ui,
    currentQuery: state.otp.currentQuery,
    currentPosition: state.otp.location.currentPosition,
    activeItinerary: getActiveItinerary(state.otp)
  }
}

const mapDispatchToProps = {
  setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileMain)

import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'

import { ComponentContext } from '../../util/contexts'
import { getActiveSearch } from '../../util/state'
import { MainPanelContent, MobileScreens } from '../../actions/ui-constants'
import { setMobileScreen } from '../../actions/ui'
import NearbyView from '../viewers/nearby/nearby-view'

import MobileDateTimeScreen from './date-time-screen'
import MobileLocationSearch from './location-search'
import MobileOptionsScreen from './options-screen'
import MobilePatternViewer from './pattern-viewer'
import MobileRouteViewer from './route-viewer'
import MobileStopViewer from './stop-viewer'
import MobileTripViewer from './trip-viewer'
import MobileWelcomeScreen from './welcome-screen'

const MobileMain = ({
  activeSearch,
  currentPosition,
  currentQuery,
  setMobileScreen,
  uiState
}) => {
  const { MobileResultsScreen, MobileSearchScreen } =
    React.useContext(ComponentContext)
  const [currentView, setCurrentView] = useState(null)

  // eslint-disable-next-line complexity
  useEffect(() => {
    let newView = null

    if (
      !activeSearch &&
      uiState.mobileScreen === MobileScreens.RESULTS_SUMMARY
    ) {
      setMobileScreen(MobileScreens.SEARCH_FORM)
    }

    if (
      uiState.mobileScreen === MobileScreens.WELCOME_SCREEN &&
      ((currentQuery.from && currentQuery.to) ||
        (!currentPosition.coords && (currentQuery.from || currentQuery.to)))
    ) {
      setMobileScreen(MobileScreens.SEARCH_FORM)
    }

    if (!activeSearch && activeSearch) {
      setMobileScreen(MobileScreens.RESULTS_SUMMARY)
    }

    switch (uiState.mainPanelContent) {
      case MainPanelContent.NEARBY_VIEW:
        newView = <NearbyView mobile />
        break
      case MainPanelContent.ROUTE_VIEWER:
        newView = <MobileRouteViewer />
        break
      case MainPanelContent.PATTERN_VIEWER:
        newView = <MobilePatternViewer />
        break
      case MainPanelContent.TRIP_VIEWER:
        newView = <MobileTripViewer />
        break
      default:
        if (uiState.viewedStop) {
          newView = <MobileStopViewer />
        } else {
          switch (uiState.mobileScreen) {
            case MobileScreens.WELCOME_SCREEN:
              newView = <MobileWelcomeScreen />
              break
            case MobileScreens.SET_INITIAL_LOCATION:
              newView = (
                <MobileLocationSearch
                  backScreen={MobileScreens.WELCOME_SCREEN}
                  locationType="to"
                />
              )
              break
            case MobileScreens.SEARCH_FORM:
              newView = <MobileSearchScreen newScreen={setMobileScreen} />
              break
            case MobileScreens.SET_FROM_LOCATION:
              newView = (
                <MobileLocationSearch
                  backScreen={MobileScreens.SEARCH_FORM}
                  locationType="from"
                />
              )
              break
            case MobileScreens.SET_TO_LOCATION:
              newView = (
                <MobileLocationSearch
                  backScreen={MobileScreens.SEARCH_FORM}
                  locationType="to"
                />
              )
              break
            case MobileScreens.SET_DATETIME:
              newView = <MobileDateTimeScreen />
              break
            case MobileScreens.SET_OPTIONS:
              newView = <MobileOptionsScreen />
              break
            case MobileScreens.RESULTS_SUMMARY:
              newView = <MobileResultsScreen />
              break
            default:
              newView = <p>Invalid mobile screen</p>
          }
        }
    }

    setCurrentView(newView)
  }, [
    activeSearch,
    currentPosition,
    currentQuery,
    setMobileScreen,
    uiState,
    MobileResultsScreen,
    MobileSearchScreen
  ])

  return currentView
}

MobileMain.propTypes = {
  activeSearch: PropTypes.object,
  currentPosition: PropTypes.object,
  currentQuery: PropTypes.object,
  setMobileScreen: PropTypes.func,
  uiState: PropTypes.object
}

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

/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import React from 'react'

import * as apiActions from '../../actions/api'
import * as locationActions from '../../actions/location'
import { getActiveSearch, getShowUserSettings } from '../../util/state'
import { getOtpUiLocations, getPersistenceStrategy } from '../../util/user'
import {
  PERSIST_TO_LOCAL_STORAGE,
  PERSIST_TO_OTP_MIDDLEWARE
} from '../../util/constants'
import Icon from '../util/icon'

/**
 * Custom icon component that renders based on the user location icon prop.
 */
const UserLocationIcon = ({ userLocation }) => {
  const { icon = 'marker' } = userLocation
  // Places from localStorage that are assigned the 'work' icon
  // should be rendered as 'briefcase'.
  const finalIcon = icon === 'work' ? 'briefcase' : icon

  return <Icon name={finalIcon} />
}

/**
 * This higher-order component connects the target (styled) LocationField to the
 * redux store.
 * @param StyledLocationField The input LocationField component to connect.
 * @param options Optional object with the following optional props (see defaults in code):
 *                - actions: a list of actions to include in mapDispatchToProps
 *                - excludeSavedLocations: whether to not render user-saved locations
 *                - includeLocation: whether to derive the location prop from
 *                  the active query
 * @returns The connected component.
 */
export default function connectLocationField(
  StyledLocationField,
  options = {}
) {
  // By default, set actions to empty list and do not include location.
  const {
    actions = {},
    excludeSavedLocations = false,
    includeLocation = false,
    intlActions = {}
  } = options
  const mapStateToProps = (state, ownProps) => {
    const { config, currentQuery, location, transitIndex } = state.otp
    const { currentPosition, nearbyStops, sessionSearches } = location
    const activeSearch = getActiveSearch(state)
    const query = activeSearch ? activeSearch.query : currentQuery

    // Display saved locations and recent places according to the configured persistence strategy,
    // unless displaying user locations is disabled via prop (e.g. in the saved-place editor
    // when the loggedInUser defines their saved locations).
    let userSavedLocations = []
    let recentPlaces = []
    if (!excludeSavedLocations) {
      const { localUser, loggedInUser } = state.user
      const persistenceStrategy = getPersistenceStrategy(config.persistence)
      if (persistenceStrategy === PERSIST_TO_OTP_MIDDLEWARE) {
        userSavedLocations = getOtpUiLocations(loggedInUser)
      } else if (persistenceStrategy === PERSIST_TO_LOCAL_STORAGE) {
        userSavedLocations = localUser.savedLocations
        recentPlaces = localUser.recentPlaces
      }
    }

    const geocoderConfig = config.geocoder
    if (currentPosition?.coords) {
      const { latitude: lat, longitude: lon } = currentPosition.coords
      geocoderConfig.focusPoint = { lat, lon }
    }

    const stateToProps = {
      currentPosition,
      geocoderConfig,
      layerColorMap: config.geocoder?.resultsColors || {},
      nearbyStops,
      sessionSearches,
      showUserSettings: getShowUserSettings(state),
      stopsIndex: transitIndex.stops,
      UserLocationIconComponent: UserLocationIcon,
      userLocationsAndRecentPlaces: [...userSavedLocations, ...recentPlaces]
    }
    // Set the location prop only if includeLocation is specified, else leave unset.
    // Otherwise, the StyledLocationField component will use the fixed undefined/null value as location
    // and will not respond to user input.
    if (includeLocation) {
      stateToProps.location = query[ownProps.locationType]
    }

    return stateToProps
  }

  const mapDispatchToProps = (dispatch, ownProps) => {
    const allBaseActions = {
      addLocationSearch: locationActions.addLocationSearch,
      findNearbyStops: apiActions.findNearbyStops,
      ...actions
    }

    const allIntlActions = {
      getCurrentPosition: locationActions.getCurrentPosition,
      ...intlActions
    }

    const dispatchActions = {}

    Object.entries(allBaseActions).forEach(([key, fn]) => {
      dispatchActions[key] = (...args) => dispatch(fn(...args))
    })
    Object.entries(allIntlActions).forEach(([key, fn]) => {
      dispatchActions[key] = (...args) => dispatch(fn(ownProps.intl, ...args))
    })
    return dispatchActions
  }

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(injectIntl(StyledLocationField))
}

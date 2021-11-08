import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'

import * as apiActions from '../../actions/api'
import * as locationActions from '../../actions/location'
import { getActiveSearch, getShowUserSettings } from '../../util/state'

/**
 * This higher-order component connects the target (styled) LocationField to the
 * redux store.
 * @param StyledLocationField The input LocationField component to connect.
 * @param options Optional object with the following optional props:
 *                - actions: a list of actions to include in mapDispatchToProps
 *                - includeLocation: whether to derive the location prop from
 *                  the active query
 * @returns The connected component.
 */
export default function connectLocationField (StyledLocationField, options = {}) {
  // By default, set actions to empty list and do not include location.
  let {actions = {}, includeLocation = false, intlActions = {}} = options
  const mapStateToProps = (state, ownProps) => {
    const { config, currentQuery, location, transitIndex, user } = state.otp
    const { currentPosition, nearbyStops, sessionSearches } = location
    const activeSearch = getActiveSearch(state)
    const query = activeSearch ? activeSearch.query : currentQuery

    const geocoderConfig = config.geocoder
    if (currentPosition?.coords) {
      const {latitude: lat, longitude: lon} = currentPosition.coords
      geocoderConfig.focusPoint = {lat, lon}
    }

    const stateToProps = {
      currentPosition,
      geocoderConfig,
      layerColorMap: config.geocoder?.resultsColors || {},
      nearbyStops,
      sessionSearches,
      showUserSettings: getShowUserSettings(state),
      stopsIndex: transitIndex.stops,
      userLocationsAndRecentPlaces: [...user.locations, ...user.recentPlaces]
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
    actions = {
      addLocationSearch: locationActions.addLocationSearch,
      findNearbyStops: apiActions.findNearbyStops,
      ...actions
    }

    intlActions = {
      getCurrentPosition: locationActions.getCurrentPosition,
      ...intlActions
    }

    const dispatchActions = {}

    Object.entries(actions).forEach(([key, fn]) => {
      dispatchActions[key] = (...args) => dispatch(fn(...args))
    })
    Object.entries(intlActions).forEach(([key, fn]) => {
      dispatchActions[key] = (...args) => dispatch(fn(ownProps.intl, ...args))
    })
    return dispatchActions
  }

  return injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(StyledLocationField)
  )
}

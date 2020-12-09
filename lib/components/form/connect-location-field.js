import { connect } from 'react-redux'

import * as mapActions from '../../actions/map'
import * as locationActions from '../../actions/location'
import * as apiActions from '../../actions/api'
import { getActiveSearch, getShowUserSettings } from '../../util/state'

/**
 * This higher-order component connects the given (styled) LocationField to the redux store.
 * It encapsulates the props mapping that must be done explicitly otherwise,
 * even when styling a LocationField component that is already connected to the redux store.
 * @param LocationFieldComponent The LocationFieldComponent to connect.
 * @param options Optional object with the following optional boolean props that determine whether the corresponding
 *                redux state/action is passed to the component (all default to true):
 *                - clearLocation
 *                - location
 *                - onLocationSelected
 * @returns The connected component.
 */
export default function connectLocationField (LocationFieldComponent, options = {}) {
  const {
    clearLocation: clearLocationProp = true,
    location: locationProp = true,
    onLocationSelected: onLocationSelectedProp = true
  } = options

  const mapStateToProps = (state, ownProps) => {
    const { config, currentQuery, location, transitIndex, user } = state.otp
    const { currentPosition, nearbyStops, sessionSearches } = location
    const activeSearch = getActiveSearch(state.otp)
    const query = activeSearch ? activeSearch.query : currentQuery

    const stateToProps = {
      currentPosition,
      geocoderConfig: config.geocoder,
      nearbyStops,
      sessionSearches,
      showUserSettings: getShowUserSettings(state.otp),
      stopsIndex: transitIndex.stops,
      userLocationsAndRecentPlaces: [...user.locations, ...user.recentPlaces]
    }
    if (locationProp) {
      stateToProps.location = query[ownProps.locationType]
    }

    return stateToProps
  }

  const mapDispatchToProps = {
    addLocationSearch: locationActions.addLocationSearch,
    findNearbyStops: apiActions.findNearbyStops,
    getCurrentPosition: locationActions.getCurrentPosition
  }
  if (clearLocationProp) {
    mapDispatchToProps.clearLocation = mapActions.clearLocation
  }
  if (onLocationSelectedProp) {
    mapDispatchToProps.onLocationSelected = mapActions.onLocationSelected
  }

  return connect(mapStateToProps, mapDispatchToProps)(LocationFieldComponent)
}

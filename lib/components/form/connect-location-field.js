import { connect } from 'react-redux'

import * as locationActions from '../../actions/location'
import * as apiActions from '../../actions/api'
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
  const {actions = [], includeLocation = false} = options
  const mapStateToProps = (state, ownProps) => {
    const { config, currentQuery, location, transitIndex, user } = state.otp
    const { currentPosition, nearbyStops, sessionSearches } = location
    const activeSearch = getActiveSearch(state.otp)
    const query = activeSearch ? activeSearch.query : currentQuery

    const stateToProps = {
      currentPosition,
      geocoderConfig: config.geocoder,
      location: includeLocation ? query[ownProps.locationType] : undefined,
      nearbyStops,
      sessionSearches,
      showUserSettings: getShowUserSettings(state.otp),
      stopsIndex: transitIndex.stops,
      userLocationsAndRecentPlaces: [...user.locations, ...user.recentPlaces]
    }

    return stateToProps
  }

  const mapDispatchToProps = {
    addLocationSearch: locationActions.addLocationSearch,
    findNearbyStops: apiActions.findNearbyStops,
    getCurrentPosition: locationActions.getCurrentPosition,
    ...actions
  }

  return connect(mapStateToProps, mapDispatchToProps)(StyledLocationField)
}

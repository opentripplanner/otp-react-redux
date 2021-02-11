import { connect } from 'react-redux'

import * as apiActions from '../../actions/api'
import * as locationActions from '../../actions/location'
import Icon from '../narrative/icon'
import { getActiveSearch, getShowUserSettings } from '../../util/state'
import { isBlank } from '../../util/ui'
import { convertToLocationFieldLocation } from '../../util/user'

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
export default function connectLocationField (StyledLocationField, options = {}) {
  // By default, set actions to empty list and do not include location.
  const {
    actions = [],
    excludeSavedLocations = false,
    includeLocation = false
  } = options
  const mapStateToProps = (state, ownProps) => {
    const { config, currentQuery, location, transitIndex, user } = state.otp
    const { loggedInUser } = state.user
    const { currentPosition, nearbyStops, sessionSearches } = location
    const activeSearch = getActiveSearch(state.otp)
    const query = activeSearch ? activeSearch.query : currentQuery

    // Clone loggedInUserLocations with changes to conform to LocationField requirements:
    // - locations with blank addresses are removed.
    // - "Work" location icon name is changed to 'work',
    // - location.name is filled with the location address if available.
    const loggedInUserLocations = loggedInUser
      ? loggedInUser.savedLocations
        .filter(loc => !isBlank(loc.address))
        .map(convertToLocationFieldLocation)
      : []

    // Holds saved locations unless excluded in options.
    // see notes regarding persistence strategy
    // refactor obtaining the locations.
    const userSavedLocations = !excludeSavedLocations ? [...loggedInUserLocations, ...user.locations] : []

    const stateToProps = {
      currentPosition,
      geocoderConfig: config.geocoder,
      nearbyStops,
      sessionSearches,
      showUserSettings: getShowUserSettings(state.otp),
      stopsIndex: transitIndex.stops,
      UserLocationIconComponent: UserLocationIcon,
      userLocationsAndRecentPlaces: [...userSavedLocations, ...user.recentPlaces]
    }
    // Set the location prop only if includeLocation is specified, else leave unset.
    // Otherwise, the StyledLocationField component will use the fixed undefined/null value as location
    // and will not respond to user input.
    if (includeLocation) {
      stateToProps.location = query[ownProps.locationType]
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

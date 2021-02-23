import { connect } from 'react-redux'

import * as apiActions from '../../actions/api'
import * as locationActions from '../../actions/location'
import Icon from '../narrative/icon'
import { PERSIST_TO_LOCAL_STORAGE, PERSIST_TO_OTP_MIDDLEWARE } from '../../util/constants'
import { getActiveSearch, getShowUserSettings } from '../../util/state'
import { isBlank } from '../../util/ui'
import { getPersistenceStrategy, isWork } from '../../util/user'

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
 * Convert an entry from persisted user savedLocations into LocationField locations:
 * - The icon for "Work" places is changed to 'work',
 * - The name attribute is filled with the place address if available.
 */
function convertToLocationFieldLocation (place) {
  return {
    ...place,
    icon: isWork(place) ? 'work' : place.icon,
    name: place.address
  }
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
    const { persistence } = config
    const persistenceStrategy = getPersistenceStrategy(persistence)

    // Display saved locations and recent places according to the configured persistence strategy,
    // unless displaying user locations is disabled via prop.
    let userSavedLocations = []
    let recentPlaces = []
    if (!excludeSavedLocations) {
      if (persistenceStrategy === PERSIST_TO_OTP_MIDDLEWARE) {
        // Remove locations with blank addresses, and
        // modify loggedInUserLocations to conform to LocationField requirements.
        userSavedLocations = loggedInUser
          ? loggedInUser.savedLocations
            .filter(loc => !isBlank(loc.address))
            .map(convertToLocationFieldLocation)
          : []
      } else if (persistenceStrategy === PERSIST_TO_LOCAL_STORAGE) {
        userSavedLocations = user.locations
        recentPlaces = user.recentPlaces
      }
    }

    const stateToProps = {
      currentPosition,
      geocoderConfig: config.geocoder,
      nearbyStops,
      sessionSearches,
      showUserSettings: getShowUserSettings(state.otp),
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

  const mapDispatchToProps = {
    addLocationSearch: locationActions.addLocationSearch,
    findNearbyStops: apiActions.findNearbyStops,
    getCurrentPosition: locationActions.getCurrentPosition,
    ...actions
  }

  return connect(mapStateToProps, mapDispatchToProps)(StyledLocationField)
}

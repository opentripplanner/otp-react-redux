import update from 'immutability-helper'
import coreUtils from '@opentripplanner/core-utils'

const { getItem } = coreUtils.storage

/**
 * Load select user settings stored locally if the persistence strategy is localStorage.
 * Other settings not mentioned below are still loaded through createOtpReducer.
 * The select user settings are:
 * - Home and Work locations,
 * - recent itinerary searches
 * - whether recent searches and places should be tracked
 * - recent places in trip plan searches,
 * - favorite stops
 *
 * Note: If the persistence stragegy is otp_middleware, then user settings
 * are fetched separately as soon as user login info is received
 * (from one of the components that uses withLoggedInUserSupport).
 */
function loadUserFromLocalStoragePerConfig (config) {
  const { persistence = {} } = config
  const persistenceStrategy = persistence.enabled && persistence.strategy
  if (persistenceStrategy === 'localStorage') {
    // User's home and work locations
    const home = getItem('home')
    const work = getItem('work')
    // Whether recent searches and places should be tracked in local storage.
    const trackRecent = getItem('trackRecent', false)
    const expandAdvanced = getItem('expandAdvanced', false)
    // Recent places used in trip plan searches.
    const recentPlaces = getItem('recent', [])
    // List of user's favorite stops.
    const favoriteStops = getItem('favoriteStops', [])
    // Recent trip plan searches (excluding time/date parameters to avoid complexity).
    const recentSearches = getItem('recentSearches', [])
    // Filter valid locations found into locations list.
    const locations = [home, work].filter(p => p)
    // Add configurable locations to home and work locations
    if (config.locations) {
      locations.push(...config.locations.map(l => ({ ...l, type: 'suggested' })))
    }

    return {
      localUser: {
        expandAdvanced, // localUser only
        favoriteStops, // localUser only - attn: legacy location format
        recentPlaces, // localUser only - attn: legacy location format
        savedLocations: locations, // attn: legacy location format
        storeTripHistory: trackRecent
      },
      localUserTripRequests: recentSearches // attn: legacy search format
    }
  }

  return {
    localUser: null,
    localUserTripRequests: null
  }
}

function createUserReducer (config) {
  const localStorageState = loadUserFromLocalStoragePerConfig(config)

  const initialState = {
    accessToken: null,
    itineraryExistence: null,
    lastPhoneSmsRequest: {
      number: null,
      status: null,
      timestamp: new Date(0)
    },
    loggedInUser: null,
    loggedInUserMonitoredTrips: null,
    loggedInUserTripRequests: null,
    pathBeforeSignIn: null,
    ...localStorageState
  }

  return (state = initialState, action) => {
    switch (action.type) {
      case 'SET_ACCESS_TOKEN': {
        return update(state, {
          accessToken: { $set: action.payload }
        })
      }
      case 'SET_CURRENT_USER': {
        return update(state, {
          loggedInUser: { $set: action.payload }
        })
      }

      case 'SET_CURRENT_USER_MONITORED_TRIPS': {
        return update(state, {
          loggedInUserMonitoredTrips: { $set: action.payload }
        })
      }

      case 'SET_CURRENT_USER_TRIP_REQUESTS': {
        return update(state, {
          loggedInUserTripRequests: { $set: action.payload }
        })
      }

      case 'SET_PATH_BEFORE_SIGNIN': {
        return update(state, {
          pathBeforeSignIn: { $set: action.payload }
        })
      }

      case 'SET_LAST_PHONE_SMS_REQUEST': {
        return update(state, {
          lastPhoneSmsRequest: { $set: action.payload }
        })
      }

      case 'SET_ITINERARY_EXISTENCE': {
        return update(state, {
          itineraryExistence: { $set: action.payload }
        })
      }

      case 'CLEAR_ITINERARY_EXISTENCE': {
        return update(state, {
          itineraryExistence: { $set: null }
        })
      }

      default:
        return state
    }
  }
}

export default createUserReducer

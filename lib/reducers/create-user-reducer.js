/* eslint-disable complexity */
import clone from 'clone'
import update from 'immutability-helper'
import coreUtils from '@opentripplanner/core-utils'

const { getItem, removeItem, storeItem } = coreUtils.storage

const MAX_RECENT_STORAGE = 5

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

      case 'DELETE_LOCAL_USER_RECENT_PLACE': {
        if (!confirm('Would you like to remove this place?')) return state

        // This is used to delete a local user's recent location.
        const placeId = action.payload.id
        const recentPlaces = clone(state.localUser.recentPlaces)
        // Remove recent from list of recent places
        const removeIndex = recentPlaces.findIndex(l => l.id === placeId)
        recentPlaces.splice(removeIndex, 1)
        storeItem('recent', recentPlaces)
        return removeIndex !== -1
          ? update(state, { localUser: { recentPlaces: { $splice: [[removeIndex, 1]] } } })
          : state
      }

      case 'DELETE_LOCAL_USER_SAVED_PLACE': {
        if (!confirm('Would you like to remove this place?')) return state

        // This is used to delete the local user's Home and Work (or other built-in) locations.
        const placeId = action.payload.id
        const removeIndex = state.localUser.savedLocations.findIndex(l => l.id === placeId)
        removeItem(placeId)
        return removeIndex !== -1
          ? update(state, { localUser: { savedLocations: { $splice: [[removeIndex, 1]] } } })
          : state
      }

      case 'DELETE_LOCAL_USER_STOP': {
        const stopId = action.payload.id
        const favoriteStops = clone(state.localUser.favoriteStops)
        // Remove stop from favorites
        const removeIndex = favoriteStops.findIndex(l => l.id === stopId)
        favoriteStops.splice(removeIndex, 1)
        storeItem('favoriteStops', favoriteStops)
        return removeIndex !== -1
          ? update(state, { localUser: { favoriteStops: { $splice: [[removeIndex, 1]] } } })
          : state
      }
      case 'REMEMBER_STOP': {
        // Payload is stop data. We want to avoid saving other attributes that
        // might be contained there (like lists of patterns).
        const { id, name, lat, lon } = action.payload
        const stop = {
          icon: 'bus',
          id,
          lat,
          lon,
          name,
          type: 'stop'
        }
        const favoriteStops = clone(state.localUser.favoriteStops)
        if (favoriteStops.length >= MAX_RECENT_STORAGE) {
          window.alert(`Cannot save more than ${MAX_RECENT_STORAGE} stops. Remove one before adding more.`)
          return state
        }
        const index = favoriteStops.findIndex(s => s.id === stop.id)
        // Do nothing if duplicate stop found.
        if (index !== -1) {
          console.warn(`Stop with id ${stop.id} already exists in favorites.`)
          return state
        } else {
          favoriteStops.unshift(stop)
        }
        storeItem('favoriteStops', favoriteStops)
        return update(state, { localUser: { favoriteStops: { $set: favoriteStops } } })
      }

      default:
        return state
    }
  }
}

export default createUserReducer

/* eslint-disable complexity */
import clone from 'clone'
import update from 'immutability-helper'
import coreUtils from '@opentripplanner/core-utils'

const { getItem, removeItem, storeItem } = coreUtils.storage
const { matchLatLon } = coreUtils.map

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
        savedLocations: locations,
        storeTripHistory: trackRecent
      },
      localUserTripRequests: recentSearches
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
        // This is used to delete the local user's recent location that matches the provided id.
        const placeId = action.payload
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
        // This is used to delete the local user's Home and Work (or other built-in)
        // location that matches the provided id.
        const placeId = action.payload
        const removeIndex = state.localUser.savedLocations.findIndex(l => l.id === placeId)
        removeItem(placeId)
        return removeIndex !== -1
          ? update(state, { localUser: { savedLocations: { $splice: [[removeIndex, 1]] } } })
          : state
      }

      case 'DELETE_LOCAL_USER_STOP': {
        // This is used to delete the local user's favorite stop that matches the provided id.
        const stopId = action.payload
        const favoriteStops = clone(state.localUser.favoriteStops)
        // Remove stop from favorites
        const removeIndex = favoriteStops.findIndex(l => l.id === stopId)
        favoriteStops.splice(removeIndex, 1)
        storeItem('favoriteStops', favoriteStops)
        return removeIndex !== -1
          ? update(state, { localUser: { favoriteStops: { $splice: [[removeIndex, 1]] } } })
          : state
      }
      case 'REMEMBER_LOCAL_USER_STOP': {
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

      case 'REMEMBER_LOCAL_USER_PLACE': {
        const { location, type } = action.payload
        switch (type) {
          case 'recent': {
            const recentPlaces = clone(state.localUser.recentPlaces)
            const index = recentPlaces.findIndex(l => matchLatLon(l, location))
            // Replace recent place if duplicate found or add to list.
            if (index !== -1) recentPlaces.splice(index, 1, location)
            else recentPlaces.push(location)
            const sortedPlaces = recentPlaces.sort((a, b) => b.timestamp - a.timestamp)
            // Only keep up to 5 recent locations
            // FIXME: Check for duplicates
            if (recentPlaces.length >= MAX_RECENT_STORAGE) {
              sortedPlaces.splice(MAX_RECENT_STORAGE)
            }
            storeItem('recent', recentPlaces)
            return update(state, { localUser: { recentPlaces: { $set: sortedPlaces } } })
          }
          default: {
            const locations = clone(state.localUser.savedLocations)
            // Determine if location type (e.g., home or work) already exists in list
            const index = locations.findIndex(l => l.type === type)
            if (index !== -1) locations.splice(index, 1, location)
            else locations.push(location)
            storeItem(type, location)
            return update(state, { localUser: { locations: { $set: locations } } })
          }
        }
      }

      case 'TOGGLE_TRACKING': {
        storeItem('trackRecent', action.payload)
        let recentPlaces = clone(state.localUser.recentPlaces)
        let recentSearches = clone(state.localUser.recentSearches)
        if (!action.payload) {
          // If user disables tracking, remove recent searches and locations.
          recentPlaces = []
          recentSearches = []
          removeItem('recent')
          removeItem('recentSearches')
        }
        return update(state, {
          localUser: {
            recentPlaces: { $set: recentPlaces },
            storeTripHistory: { $set: action.payload }
          },
          localUserTripRequests: { $set: recentSearches } })
      }

      default:
        return state
    }
  }
}

export default createUserReducer

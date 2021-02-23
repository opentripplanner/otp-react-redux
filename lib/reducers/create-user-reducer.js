/* eslint-disable complexity */
import clone from 'clone'
import update from 'immutability-helper'
import isEqual from 'lodash.isequal'
import coreUtils from '@opentripplanner/core-utils'

import { PERSIST_TO_LOCAL_STORAGE } from '../util/constants'
import { getPersistenceStrategy } from '../util/user'

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
 * Note: If the persistence strategy is otp_middleware, then user settings
 * are fetched separately as soon as user login info is received
 * (from one of the components that uses withLoggedInUserSupport).
 */
function loadUserFromLocalStorage (config) {
  const { locations: configLocations = null, persistence } = config

  const persistenceStrategy = getPersistenceStrategy(persistence)
  if (persistenceStrategy === PERSIST_TO_LOCAL_STORAGE) {
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
    if (configLocations) {
      locations.push(...configLocations.map(l => ({ ...l, type: 'suggested' })))
    }

    return {
      localUser: {
        expandAdvanced, // localUser only
        favoriteStops, // localUser only
        recentPlaces, // localUser only
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

/**
 * Create the initial user state of otp-react-redux using the provided config, any
 * and the user stored in localStorage.
 */
export function getUserInitialState (config) {
  const localStorageState = loadUserFromLocalStorage(config)

  return {
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
}

function createUserReducer (config) {
  const initialState = getUserInitialState(config)

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

      case 'FORGET_STOP': {
        const stopId = action.payload
        const favoriteStops = clone(state.localUser.favoriteStops)

        // This is used to delete the local user's favorite stop that matches the provided id.
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

      case 'FORGET_SEARCH': {
        const recentSearches = clone(state.localUserTripRequests)
        const index = recentSearches.findIndex(l => l.id === action.payload)
        // Remove item from list of recent searches
        recentSearches.splice(index, 1)
        storeItem('recentSearches', recentSearches)
        return index !== -1
          ? update(state, { localUserTripRequests: { $splice: [[index, 1]] } })
          : state
      }

      case 'REMEMBER_SEARCH': {
        const searches = clone(state.localUserTripRequests)
        const duplicateIndex = searches.findIndex(s => isEqual(s.query, action.payload.query))
        // Overwrite duplicate search (so that new timestamp is stored).
        if (duplicateIndex !== -1) searches[duplicateIndex] = action.payload
        else searches.unshift(action.payload)
        const sortedSearches = searches.sort((a, b) => b.timestamp - a.timestamp)
        // Ensure recent searches do not extend beyond MAX_RECENT_STORAGE
        if (sortedSearches.length >= MAX_RECENT_STORAGE) {
          sortedSearches.splice(MAX_RECENT_STORAGE)
        }
        storeItem('recentSearches', sortedSearches)
        return update(state, { localUserTripRequests: { $set: sortedSearches } })
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
        return update(state, { localUser: {
          recentPlaces: { $set: recentPlaces },
          recentSearches: { $set: recentSearches },
          storeTripHistory: { $set: action.payload }
        } })
      }

      default:
        return state
    }
  }
}

export default createUserReducer

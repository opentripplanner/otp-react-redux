/* eslint-disable complexity */
import clone from 'clone'
import update from 'immutability-helper'
import isEqual from 'lodash.isequal'
import coreUtils from '@opentripplanner/core-utils'

const { matchLatLon } = coreUtils.map
const { getDefaultQuery, getTripOptionsFromQuery } = coreUtils.query
const { getItem, removeItem, storeItem } = coreUtils.storage

const MAX_RECENT_STORAGE = 5

/**
 * Removes a place by id from the specified localUser state and optional persistence setting.
 */
function removeLocalUserPlace (id, state, fieldName, settingName) {
  const originalArray = state.localUser[fieldName]
  const removeIndex = originalArray.findIndex(l => l.id === id)
  // If a persistence setting is provided, create a new array without the specified element.
  if (settingName) {
    const newArray = clone(originalArray)
    newArray.splice(removeIndex, 1)
    storeItem(settingName, newArray)
  }
  return removeIndex !== -1
    ? update(state, { localUser: { [fieldName]: { $splice: [[removeIndex, 1]] } } })
    : state
}

/**
 * Load user settings stored in the browser locally. The local user is always retrieved
 * and plays the role of the "anonymous" or "shared" user if no middleware user is logged in.
 * Note: If the persistence strategy is otp_middleware, then the middleware user settings
 * are fetched separately as soon as user login info is received
 * (from one of the components that uses withLoggedInUserSupport).
 */
function loadUserFromLocalStorage (config) {
  const { locations: configLocations = null } = config

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

  // Whether to auto-refresh stop arrival times in the Stop Viewer.
  const autoRefreshStopTimes = getItem('autoRefreshStopTimes', true)
  // User overrides determine user's default mode/query parameters.
  const userOverrides = getItem('defaultQuery', {})
  // Combine user overrides with default query to get default search settings.
  const defaults = Object.assign(getDefaultQuery(config), userOverrides)

  return {
    localUser: {
      autoRefreshStopTimes,
      // Do not store from/to or date/time in defaults
      defaults: getTripOptionsFromQuery(defaults),
      expandAdvanced,
      favoriteStops,
      recentPlaces,
      savedLocations: locations,
      storeTripHistory: trackRecent
    },
    localUserTripRequests: recentSearches
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

      case 'DELETE_LOCAL_USER_RECENT_PLACE':
        // This is used to delete the local user's recent location that matches the provided id.
        return removeLocalUserPlace(action.payload, state, 'recentPlaces', 'recent')

      case 'DELETE_LOCAL_USER_SAVED_PLACE': {
        // This is used to delete the local user's Home and Work (or other built-in)
        // location that matches the provided id.
        removeItem(action.payload)
        return removeLocalUserPlace(action.payload, state, 'savedLocations')
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
            return update(state, { localUser: { savedLocations: { $set: locations } } })
          }
        }
      }

      case 'FORGET_STOP':
        return removeLocalUserPlace(action.payload, state, 'favoriteStops', 'favoriteStops')

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

      case 'TOGGLE_AUTO_REFRESH':
        storeItem('autoRefreshStopTimes', action.payload)
        return update(state, { localUser: { autoRefreshStopTimes: { $set: action.payload } } })

      case 'CLEAR_DEFAULT_SETTINGS':
        removeItem('defaultQuery')
        return update(state, { localUser: { defaults: { $set: null } } })

      case 'STORE_DEFAULT_SETTINGS':
        storeItem('defaultQuery', action.payload)
        return update(state, { localUser: { defaults: { $set: action.payload } } })

      // FIXME: set up action
      case 'TOGGLE_ADVANCED_OPTIONS':
        storeItem('expandAdvanced', action.payload)
        if (!action.payload) removeItem('expandAdvanced')
        return update(state, { localUser: {
          expandAdvanced: { $set: action.payload }
        } })

      default:
        return state
    }
  }
}

export default createUserReducer

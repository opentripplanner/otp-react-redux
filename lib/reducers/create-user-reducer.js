/* eslint-disable complexity */
import clone from 'clone'
import coreUtils from '@opentripplanner/core-utils'
import isEqual from 'lodash.isequal'
import update from 'immutability-helper'

import { convertToLegacyLocation, convertToPlace } from '../util/user'

const { matchLatLon } = coreUtils.map
const { getDefaultQuery, getTripOptionsFromQuery } = coreUtils.query
const { getItem, removeItem, storeItem } = coreUtils.storage

const MAX_RECENT_STORAGE = 5

/**
 * Adds a place to the specified localUser state and optional persistence setting.
 */
function rememberLocalUserPlace(
  place,
  duplicateFinder,
  beforeSave,
  state,
  fieldName,
  settingName
) {
  let places = clone(state.localUser[fieldName])
  const duplicateIndex = places.findIndex(duplicateFinder)
  // Replace recent place if duplicate found or add to beginning of list.
  if (duplicateIndex !== -1) places.splice(duplicateIndex, 1, place)
  else places.unshift(place)

  if (beforeSave) {
    places = beforeSave(places)
  }
  if (settingName === 'recent') {
    storeItem(settingName, places.map(convertToLegacyLocation))
  } else if (settingName) {
    storeItem(settingName, places)
  }
  return update(state, { localUser: { [fieldName]: { $set: places } } })
}

/**
 * Sorts the given list most recent first,
 * and keeps the first MAX_RECENT_STORAGE most recent items.
 */
function sortAndTrim(list) {
  const sorted = list.sort((a, b) => b.timestamp - a.timestamp)
  // Only keep up to 5 recent locations
  // FIXME: Check for duplicates
  if (list.length >= MAX_RECENT_STORAGE) {
    sorted.splice(MAX_RECENT_STORAGE)
  }
  return sorted
}

/**
 * Removes a place by id from the specified localUser state and optional persistence setting.
 */
function removeLocalUserPlace(place, state, fieldName, settingName) {
  const originalArray = state.localUser[fieldName]
  const removeIndex = originalArray.findIndex((l) => l.id === place.id)
  // If a persistence setting is provided,
  // persist a copy of the passed array without the specified element.
  if (settingName) {
    const newArray = clone(originalArray)
    newArray.splice(removeIndex, 1)
    storeItem(settingName, newArray)
  }
  return removeIndex !== -1
    ? update(state, {
        localUser: { [fieldName]: { $splice: [[removeIndex, 1]] } }
      })
    : state
}

/**
 * Load user settings stored in the browser locally. The local user is always retrieved
 * and plays the role of the "anonymous" or "shared" user if no middleware user is logged in.
 * Note: If the persistence strategy is otp_middleware, then the middleware user settings
 * are fetched separately as soon as user login info is received
 * (from one of the components that uses withLoggedInUserSupport).
 */
function loadUserFromLocalStorage(config) {
  const { locations: configLocations = null } = config

  // User's home and work locations
  const home = getItem('home')
  const work = getItem('work')
  // Whether recent searches and places should be tracked in local storage.
  const trackRecent = getItem('trackRecent', false)
  // Recent places used in trip plan searches.
  const recentPlaces = getItem('recent', []).map(convertToPlace)
  // List of user's favorite stops.
  const favoriteStops = getItem('favoriteStops', []).map(convertToPlace)
  // Recent trip plan searches (excluding time/date parameters to avoid complexity).
  const recentSearches = getItem('recentSearches', [])
  // Filter valid locations found into locations list.
  const locations = [home, work].filter((p) => p).map(convertToPlace)

  // Add configurable locations to home and work locations
  if (configLocations) {
    locations.push(...configLocations.map((l) => ({ ...l, type: 'suggested' })))
  }
  // User overrides determine user's default mode/query parameters.
  const userOverrides = getItem('defaultQuery', {})
  // Combine user overrides with default query to get default search settings.
  const defaults = Object.assign(getDefaultQuery(config), userOverrides)

  return {
    localUser: {
      // Do not store from/to or date/time in defaults
      defaults: getTripOptionsFromQuery(defaults),
      favoriteStops,
      recentPlaces,
      recentSearches,
      savedLocations: locations,
      storeTripHistory: trackRecent
    }
  }
}

/**
 * Create the initial user state of otp-react-redux using the provided config, any
 * and the user stored in localStorage.
 */
export function getUserInitialState(config) {
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

function createUserReducer(config) {
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
        return removeLocalUserPlace(
          action.payload,
          state,
          'recentPlaces',
          'recent'
        )

      case 'DELETE_LOCAL_USER_SAVED_PLACE': {
        // This is used to delete the local user's Home and Work (or other built-in)
        // location that matches the provided id.
        removeItem(action.payload)
        return removeLocalUserPlace(action.payload, state, 'savedLocations')
      }

      case 'REMEMBER_LOCAL_USER_PLACE': {
        const { location, type } = action.payload
        switch (type) {
          case 'recent':
            return rememberLocalUserPlace(
              location,
              (l) => matchLatLon(l, location),
              sortAndTrim,
              state,
              'recentPlaces',
              'recent'
            )
          default:
            storeItem(type, location)
            return rememberLocalUserPlace(
              location,
              (l) => l.type === type,
              null,
              state,
              'savedLocations'
            )
        }
      }

      case 'FORGET_STOP':
        return removeLocalUserPlace(
          action.payload,
          state,
          'favoriteStops',
          'favoriteStops'
        )

      case 'REMEMBER_STOP': {
        // Payload is stop data. We want to avoid saving other attributes that
        // might be contained there (like lists of patterns).
        const { id, lat, lon, name } = action.payload
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
          window.alert(
            `Cannot save more than ${MAX_RECENT_STORAGE} stops. Remove one before adding more.`
          )
          return state
        }
        const index = favoriteStops.findIndex((s) => s.id === stop.id)
        // Do nothing if duplicate stop found.
        if (index !== -1) {
          console.warn(`Stop with id ${stop.id} already exists in favorites.`)
          return state
        } else {
          favoriteStops.unshift(stop)
        }
        storeItem('favoriteStops', favoriteStops)
        return update(state, {
          localUser: { favoriteStops: { $set: favoriteStops } }
        })
      }

      case 'FORGET_SEARCH':
        return removeLocalUserPlace(
          action.payload,
          state,
          'recentSearches',
          'recentSearches'
        )

      case 'REMEMBER_SEARCH':
        return rememberLocalUserPlace(
          action.payload,
          (s) => isEqual(s.query, action.payload.query),
          sortAndTrim,
          state,
          'recentSearches',
          'recentSearches'
        )

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
            recentSearches: { $set: recentSearches },
            storeTripHistory: { $set: action.payload }
          }
        })
      }

      case 'TOGGLE_AUTO_REFRESH':
        storeItem('autoRefreshStopTimes', action.payload)
        return update(state, {
          localUser: { autoRefreshStopTimes: { $set: action.payload } }
        })

      case 'CLEAR_DEFAULT_SETTINGS':
        removeItem('defaultQuery')
        return update(state, { localUser: { defaults: { $set: null } } })

      case 'STORE_DEFAULT_SETTINGS':
        storeItem('defaultQuery', action.payload)
        return update(state, {
          localUser: { defaults: { $set: action.payload } }
        })

      default:
        return state
    }
  }
}

export default createUserReducer

import clone from 'clone'
import update from 'immutability-helper'
import isEqual from 'lodash.isequal'
import objectPath from 'object-path'
import coreUtils from '@opentripplanner/core-utils'

import { MainPanelContent, MobileScreens } from '../actions/ui'
import {FETCH_STATUS} from '../util/constants'
import {getTimestamp} from '../util/state'
import {isBatchRoutingEnabled} from '../util/itinerary'

const { getTransitModes, isTransit } = coreUtils.itinerary
const { matchLatLon } = coreUtils.map
const { filterProfileOptions } = coreUtils.profile
const {
  ensureSingleAccessMode,
  getDefaultQuery,
  getTripOptionsFromQuery
} = coreUtils.query
const { getItem, removeItem, storeItem } = coreUtils.storage
const { getUserTimezone } = coreUtils.time

const MAX_RECENT_STORAGE = 5

// TODO: fire planTrip action if default query is complete/error-free

/**
 * Validates the initial state of the store. This is intended to mainly catch
 * configuration issues since a manually edited config file is loaded into the
 * initial state.
 * TODO: maybe it's a better idea to move all of this to a script that can do
 *  JSON Schema validation and other stuff.
 */
function validateInitialState (initialState) {
  const {config} = initialState

  const errors = []

  // validate that the ArcGIS geocoder isn't used with a persistence strategy of
  // `localStorage`. ArcGIS requires the use of a paid account to store geocode
  // results.
  // See https://developers.arcgis.com/rest/geocode/api-reference/geocoding-free-vs-paid.htm
  if (
    objectPath.get(config, 'persistence.enabled') &&
    objectPath.get(config, 'persistence.strategy') === 'localStorage' &&
    objectPath.get(config, 'geocoder.type') === 'ARCGIS'
  ) {
    errors.push(new Error('Local Storage persistence and ARCGIS geocoder cannot be enabled at the same time!'))
  }

  if (errors.length > 0) {
    throw new Error(
      errors.reduce(
        (message, error) => {
          return `${message}\n- ${error.message}`
        },
        'Encountered the following configuration errors:'
      )
    )
  }
}

/**
 * Create the initial state of otp-react-redux using user-provided config, any
 * items in localStorage and a few defaults.
 */
export function getInitialState (userDefinedConfig) {
  const defaultConfig = {
    autoPlan: {
      default: 'ONE_LOCATION_CHANGED',
      mobile: 'BOTH_LOCATIONS_CHANGED'
    },
    debouncePlanTimeMs: 0,
    language: {},
    onTimeThresholdSeconds: 60,
    realtimeEffectsDisplayThreshold: 120,
    routingTypes: [],
    stopViewer: {
      numberOfDepartures: 3, // per pattern
      // Hide block ids unless explicitly enabled in config.
      showBlockIds: false,
      // This is set to 345600 (four days) so that, for example, if it is Friday and
      // a route does not begin service again until Monday, we are showing its next
      // departure and it is not entirely excluded from display.
      timeRange: 345600 // four days in seconds
    },
    transitOperators: []
  }

  const config = Object.assign(defaultConfig, userDefinedConfig)

  if (!config.homeTimezone) {
    config.homeTimezone = getUserTimezone()
    console.warn(
      `Config value 'homeTimezone' not configured for this webapp!\n
      This value is recommended in order to properly display stop times for
      users that are not in the timezone that the transit system is in. The
      detected user timezone of '${config.homeTimezone}' will be used. Hopefully
      that is the right one...`
    )
  }

  // Phone format options fall back to US region if not provided.
  if (!config.phoneFormatOptions) {
    config.phoneFormatOptions = {}
  }
  if (!config.phoneFormatOptions.countryCode) {
    config.phoneFormatOptions.countryCode = 'US'
  }

  // Load user settings from local storage.
  // TODO: Make this work with settings fetched from alternative storage system
  //  (e.g., OTP backend middleware containing user profile system).
  // User overrides determine user's default mode/query parameters.
  const userOverrides = getItem('defaultQuery', {})
  // Combine user overrides with default query to get default search settings.
  const defaults = Object.assign(getDefaultQuery(config), userOverrides)
  // Whether to auto-refresh stop arrival times in the Stop Viewer.
  const autoRefreshStopTimes = getItem('autoRefreshStopTimes', true)
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
  // TODO: parse and merge URL query params w/ default query

  // populate query by merging any provided query params w/ the default params
  const currentQuery = Object.assign(defaults, userDefinedConfig.initialQuery)
  // Add configurable locations to home and work locations
  if (config.locations) {
    locations.push(...config.locations.map(l => ({ ...l, type: 'suggested' })))
  }
  // Check for alternative routerId in session storage. This is generally used
  // for testing single GTFS feed OTP graphs that are deployed to feed-specific
  // routers (e.g., https://otp.server.com/otp/routers/non_default_router).
  // This routerId session value is initially set by visiting otp-rr
  // with the path /start/:latLonZoomRouter, which dispatches the SET_ROUTER_ID
  // action and stores the value in sessionStorage.
  // Note: this mechanism assumes that the OTP API path is otp/routers/default.
  const routerId = window.sessionStorage.getItem('routerId')
  // If routerId is found, update the config.api.path (keep the original config
  // value at originalPath in case it needs to be reverted.)
  if (routerId) {
    config.api.originalPath = userDefinedConfig.api.path
    config.api.path = `/otp/routers/${routerId}`
  }
  let queryModes = currentQuery.mode.split(',')

  // If 'TRANSIT' is included in the mode list, replace it with individual modes
  if (queryModes.includes('TRANSIT')) {
    // Isolate the non-transit modes in queryModes
    queryModes = queryModes.filter(m => !isTransit(m))
    // Add all possible transit modes
    queryModes = queryModes.concat(getTransitModes(config))
    // Stringify and set as OTP 'mode' query param
    currentQuery.mode = queryModes.join(',')
  }

  // If we are in 'ITINERARY' mode, ensure that one and only one access mode is selected
  if (currentQuery.routingType === 'ITINERARY') {
    queryModes = ensureSingleAccessMode(queryModes)
  }
  if (config.modes && config.modes.combinations) {
    // Inject combinations from config for batch routing.
    currentQuery.combinations = clone(config.modes.combinations)
  }

  return {
    activeSearchId: 0,
    config,
    currentQuery,
    filter: {
      sort: {
        direction: 'ASC',
        // Only apply custom sort if batch routing is enabled.
        type: isBatchRoutingEnabled(config) ? 'BEST' : null
      }
    },
    location: {
      currentPosition: {
        coords: null,
        error: null,
        fetching: false
      },
      nearbyStops: [],
      sessionSearches: []
    },
    overlay: {
      bikeRental: {
        stations: []
      },
      carRental: {
        stations: []
      },
      parkAndRide: {
        // null default value indicates no request for P&R list has been made
        locations: null
      },
      transit: {
        stops: []
      },
      transitive: null,
      vehicleRental: {
        stations: []
      },
      zipcar: {
        locations: []
      }
    },
    searches: {},
    tnc: {
      etaEstimates: {},
      rideEstimates: {}
    },
    transitIndex: {
      stops: {},
      trips: {}
    },
    ui: {
      diagramLeg: null,
      locale: null,
      localizedMessages: {},
      mobileScreen: MobileScreens.WELCOME_SCREEN,
      printView: window.location.href.indexOf('/print/') !== -1
    },
    user: {
      autoRefreshStopTimes,
      // Do not store from/to or date/time in defaults
      defaults: getTripOptionsFromQuery(defaults),
      expandAdvanced,
      favoriteStops,
      locations,
      recentPlaces,
      recentSearches,
      trackRecent
    },
    useRealtime: true
  }
}

function createOtpReducer (config) {
  const initialState = getInitialState(config)
  // validate the initial state
  validateInitialState(initialState)

  /* eslint-disable-next-line complexity */
  return (state = initialState, action) => {
    const searchId = action.payload && action.payload.searchId
    const requestId = action.payload && action.payload.requestId
    const activeSearch = state.searches[searchId]
    switch (action.type) {
      case 'ROUTING_REQUEST':
        const {
          activeItinerary,
          pending,
          updateSearchInReducer
        } = action.payload
        const searchUpdate = updateSearchInReducer
          ? {
            activeItinerary: { $set: activeItinerary },
            activeLeg: { $set: null },
            activeStep: { $set: null },
            pending: { $set: pending },
            // FIXME: get query from action payload?
            query: { $set: clone(state.currentQuery) },
            // omit requests reset to make sure requests can be added to this
            // search
            timestamp: { $set: getTimestamp() }
          }
          : {
            $set: {
              activeItinerary,
              activeLeg: null,
              activeStep: null,
              pending,
              // FIXME: get query from action payload?
              query: clone(state.currentQuery),
              response: [],
              timestamp: getTimestamp()
            }
          }
        return update(state, {
          activeSearchId: { $set: searchId },
          searches: { [searchId]: searchUpdate }
        })
      case 'ROUTING_ERROR':
        return update(state, {
          searches: {
            [searchId]: {
              pending: { $set: activeSearch.pending - 1 },
              response: {
                $push: [{
                  error: action.payload.error,
                  requestId,
                  url: action.payload.url
                }]
              }
            }
          }
        })
      case 'ROUTING_RESPONSE':
        const response = (state.currentQuery.routingType === 'PROFILE')
          ? filterProfileOptions(action.payload.response)
          : action.payload.response
        response.requestId = requestId
        return update(state, {
          searches: {
            [searchId]: {
              pending: { $set: activeSearch.pending - 1 },
              response: { $push: [response] }
            }
          },
          ui: {
            diagramLeg: { $set: null }
          }
        })
      case 'NON_REALTIME_ROUTING_RESPONSE':
        return update(state, {
          searches: {
            [searchId]: {
              nonRealtimeResponse: { $set: action.payload.response }
            }
          }
        })
      case 'SET_PENDING_REQUESTS':
        return update(state, {
          searches: {
            [searchId]: {
              pending: { $set: action.payload.pending }
            }
          }
        })
      case 'SET_ACTIVE_ITINERARIES':
        const responseUpdate = {}
        Object.entries(action.payload.assignedItinerariesByResponse)
          .forEach(([ responseIdx, responsePlanItineraries ]) => {
            responseUpdate[responseIdx] = {
              plan: {
                itineraries: {
                  $set: responsePlanItineraries
                }
              }
            }
          })
        return update(state, {
          searches: {
            [searchId]: {
              response: responseUpdate
            }
          }
        })
      case 'SET_ACTIVE_ITINERARIES_FROM_FIELD_TRIP':
        return update(state, {
          activeSearchId: { $set: searchId },
          searches: {
            [searchId]: {
              $set: {
                activeItinerary: 0,
                activeLeg: null,
                activeStep: null,
                pending: 0,
                // FIXME: get query from action payload?
                query: clone(state.currentQuery),
                response: action.payload.response,
                timestamp: getTimestamp()
              }
            }
          },
          ui: {
            diagramLeg: { $set: null }
          }
        })
      case 'BIKE_RENTAL_REQUEST':
        return update(state, {
          overlay: {
            bikeRental: {
              error: { $set: null },
              pending: { $set: true }
            }
          }
        })
      case 'BIKE_RENTAL_ERROR':
        return update(state, {
          overlay: {
            bikeRental: {
              error: { $set: action.payload },
              pending: { $set: false }
            }
          }
        })
      case 'BIKE_RENTAL_RESPONSE':
        return update(state, {
          overlay: {
            bikeRental: {
              pending: { $set: false },
              stations: { $set: action.payload.stations }
            }
          }
        })
      case 'CAR_RENTAL_ERROR':
        return update(state, {
          overlay: {
            carRental: {
              error: { $set: action.payload },
              pending: { $set: false }
            }
          }
        })
      case 'CAR_RENTAL_RESPONSE':
        return update(state, {
          overlay: {
            carRental: {
              pending: { $set: false },
              stations: { $set: action.payload.stations }
            }
          }
        })
      case 'VEHICLE_RENTAL_ERROR':
        return update(state, {
          overlay: {
            vehicleRental: {
              error: { $set: action.payload },
              pending: { $set: false }
            }
          }
        })
      case 'VEHICLE_RENTAL_RESPONSE':
        return update(state, {
          overlay: {
            vehicleRental: {
              pending: { $set: false },
              stations: { $set: action.payload.stations }
            }
          }
        })
      case 'SET_USE_REALTIME_RESPONSE':
        return update(state, {
          useRealtime: { $set: action.payload.useRealtime }
        })
      case 'SET_ACTIVE_ITINERARY':
        if (state.activeSearchId !== null) {
          return update(state, {
            searches: {
              [state.activeSearchId]: {
                activeItinerary: { $set: action.payload.index },
                activeLeg: { $set: null },
                activeStep: { $set: null }
              }
            }
          })
        }
        return state
      case 'SET_VISIBLE_ITINERARY':
        if (state.activeSearchId !== null) {
          return update(state, {
            searches: {
              [state.activeSearchId]: {
                visibleItinerary: { $set: action.payload.index }
              }
            }
          })
        }
        return state
      case 'SET_ACTIVE_LEG':
        if (state.activeSearchId !== null) {
          return update(state, {
            searches: {
              [state.activeSearchId]: {
                activeLeg: { $set: action.payload.index },
                activeStep: { $set: null }
              }
            }
          })
        }
        return state
      case 'SET_ACTIVE_STEP':
        if (state.activeSearchId !== null) {
          return update(state, {
            searches: {
              [state.activeSearchId]: {
                activeStep: { $set: action.payload.index }
              }
            }
          })
        }
        return state
      case 'SET_LOCATION':
        return update(state, {
          currentQuery: {
            [action.payload.locationType]: { $set: action.payload.location }
          }
        })
      case 'CLEAR_LOCATION':
        return update(state, {
          currentQuery: { [action.payload.locationType]: { $set: null } }
        })

      case 'SET_QUERY_PARAM':
        return update(state, { currentQuery: { $merge: action.payload } })

      case 'CLEAR_ACTIVE_SEARCH':
        return update(state, { activeSearchId: { $set: null } })
      case 'SET_ACTIVE_SEARCH':
        return update(state, { activeSearchId: { $set: action.payload } })
      case 'CLEAR_DEFAULT_SETTINGS':
        removeItem('defaultQuery')
        return update(state, { user: { defaults: { $set: null } } })
      case 'STORE_DEFAULT_SETTINGS':
        storeItem('defaultQuery', action.payload)
        return update(state, { user: { defaults: { $set: action.payload } } })
      case 'FORGET_PLACE': {
        // Payload is the place ID.
        // Recent place IDs contain the string literal 'recent'.
        if (action.payload.indexOf('recent') !== -1) {
          const recentPlaces = clone(state.user.recentPlaces)
          // Remove recent from list of recent places
          const removeIndex = recentPlaces.findIndex(l => l.id === action.payload)
          recentPlaces.splice(removeIndex, 1)
          storeItem('recent', recentPlaces)
          return removeIndex !== -1
            ? update(state, { user: { recentPlaces: { $splice: [[removeIndex, 1]] } } })
            : state
        } else {
          const locations = clone(state.user.locations)
          const removeIndex = locations.findIndex(l => l.id === action.payload)
          removeItem(action.payload)
          return removeIndex !== -1
            ? update(state, { user: { locations: { $splice: [[removeIndex, 1]] } } })
            : state
        }
      }
      case 'REMEMBER_PLACE': {
        const { location, type } = action.payload
        switch (type) {
          case 'recent': {
            const recentPlaces = clone(state.user.recentPlaces)
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
            return update(state, { user: { recentPlaces: { $set: sortedPlaces } } })
          }
          default: {
            const locations = clone(state.user.locations)
            // Determine if location type (e.g., home or work) already exists in list
            const index = locations.findIndex(l => l.type === type)
            if (index !== -1) locations.splice(index, 1, location)
            else locations.push(location)
            storeItem(type, location)
            return update(state, { user: { locations: { $set: locations } } })
          }
        }
      }
      case 'FORGET_STOP': {
        // Payload is the stop ID.
        const favoriteStops = clone(state.user.favoriteStops)
        // Remove stop from favorites
        const removeIndex = favoriteStops.findIndex(l => l.id === action.payload)
        favoriteStops.splice(removeIndex, 1)
        storeItem('favoriteStops', favoriteStops)
        return removeIndex !== -1
          ? update(state, { user: { favoriteStops: { $splice: [[removeIndex, 1]] } } })
          : state
      }
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
        const favoriteStops = clone(state.user.favoriteStops)
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
        return update(state, { user: { favoriteStops: { $set: favoriteStops } } })
      }
      // FIXME: set up action
      case 'TOGGLE_ADVANCED_OPTIONS':
        storeItem('expandAdvanced', action.payload)
        if (!action.payload) removeItem('expandAdvanced')
        return update(state, { user: {
          expandAdvanced: { $set: action.payload }
        } })
      case 'TOGGLE_TRACKING': {
        storeItem('trackRecent', action.payload)
        let recentPlaces = clone(state.user.recentPlaces)
        let recentSearches = clone(state.user.recentSearches)
        if (!action.payload) {
          // If user disables tracking, remove recent searches and locations.
          recentPlaces = []
          recentSearches = []
          removeItem('recent')
          removeItem('recentSearches')
        }
        return update(state, { user: {
          recentPlaces: { $set: recentPlaces },
          recentSearches: { $set: recentSearches },
          trackRecent: { $set: action.payload }
        } })
      }
      case 'REMEMBER_SEARCH':
        const searches = clone(state.user.recentSearches)
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
        return update(state, { user: { searches: { $set: sortedSearches } } })
      case 'FORGET_SEARCH': {
        const recentSearches = clone(state.user.recentSearches)
        const index = recentSearches.findIndex(l => l.id === action.payload)
        // Remove item from list of recent searches
        recentSearches.splice(index, 1)
        storeItem('recentSearches', recentSearches)
        return index !== -1
          ? update(state, { user: { recentSearches: { $splice: [[index, 1]] } } })
          : state
      }
      case 'SET_AUTOPLAN':
        return update(state, {
          config: { autoPlan: { $set: action.payload.autoPlan } }
        })
      case 'SET_MAP_CENTER':
        return update(state, {
          config: {
            map: {
              initLat: { $set: action.payload.lat },
              initLon: { $set: action.payload.lon }
            }
          }
        })
      case 'SET_MAP_ZOOM':
        return update(state, {
          config: {
            map: {
              initZoom: { $set: action.payload.zoom }
            }
          }
        })
      case 'SET_ROUTER_ID':
        const routerId = action.payload
        // Store original path value in originalPath variable.
        const originalPath = config.api.originalPath || config.api.path || '/otp/routers/default'
        const path = routerId
          ? `/otp/routers/${routerId}`
          // If routerId is null, revert to the original config's API path (or
          // the standard path if that is not found).
          : originalPath
        // Store routerId in session storage (persists through page reloads but
        // not when a new tab/window is opened).
        if (routerId) window.sessionStorage.setItem('routerId', routerId)
        else window.sessionStorage.removeItem('routerId')
        return update(state, {
          config: {
            api: {
              originalPath: { $set: originalPath },
              path: { $set: path }
            }
          }
        })
      case 'SET_LEG_DIAGRAM':
        return update(state, {
          ui: {
            diagramLeg: { $set: action.payload }
          }
        })
      case 'SET_ELEVATION_POINT':
        return update(state, {
          ui: {
            elevationPoint: { $set: action.payload }
          }
        })
      case 'SET_MAP_POPUP_LOCATION':
        return update(state, {
          ui: {
            mapPopupLocation: { $set: action.payload.location }
          }
        })
      case 'POSITION_FETCHING':
        return update(state, {
          location: {
            currentPosition: { $merge: { fetching: action.payload.type } }
          }
        })
      case 'POSITION_ERROR':
        return update(state, {
          location: { currentPosition: { $set: action.payload } }
        })
      case 'POSITION_RESPONSE':
        return update(state, {
          location: { currentPosition: { $set: action.payload.position } }
        })
      case 'ADD_LOCATION_SEARCH':
        return update(state, {
          location: { sessionSearches: { $unshift: [action.payload.location] } }
        })

      case 'NEARBY_STOPS_RESPONSE':
        const stopLookup = {}
        action.payload.stops.forEach(s => {
          stopLookup[s.id] = s
        })
        return update(state, {
          location: {
            nearbyStops: { $set: action.payload.stops.map(s => s.id) }
          },
          transitIndex: { stops: { $merge: stopLookup } }
        })
      case 'STOPS_WITHIN_BBOX_RESPONSE':
        return update(state, {
          overlay: {
            transit: {
              pending: { $set: false },
              stops: { $set: action.payload.stops }
            }
          }
        })
      case 'REALTIME_VEHICLE_POSITIONS_RESPONSE':
        return update(state, {
          transitIndex: {
            routes: {
              [action.payload.routeId]: {
                vehicles: { $set: action.payload.vehicles }
              }
            }
          }
        })
      case 'CLEAR_STOPS_OVERLAY':
        return update(state, {
          overlay: {
            transit: {
              pending: { $set: false },
              stops: { $set: [] }
            }
          }
        })
      case 'ROUTES_AT_STOP_RESPONSE':
        return update(state, {
          transitIndex: {
            stops: {
              [action.payload.stopId]: {
                routes: { $set: action.payload.routes }
              }
            }
          }
        })
      case 'SET_MOBILE_SCREEN':
        return update(state, { ui: { mobileScreen: { $set: action.payload } } })
      case 'SET_MAIN_PANEL_CONTENT':
        return update(state, {
          ui: {
            mainPanelContent: { $set: action.payload }
          }
        })
      case 'SET_VIEWED_STOP':
        if (action.payload) {
          // If setting to a stop (not null), also set main panel.
          return update(state, { ui: {
            mainPanelContent: { $set: MainPanelContent.STOP_VIEWER },
            viewedStop: { $set: action.payload }
          } })
        } else {
          // Otherwise, just replace viewed stop with null
          return update(state, { ui: { viewedStop: { $set: action.payload } } })
        }
      case 'CLEAR_VIEWED_STOP':
        return update(state, { ui: { viewedStop: { $set: null } } })

      case 'SET_VIEWED_TRIP':
        return update(state, { ui: { viewedTrip: { $set: action.payload } } })
      case 'CLEAR_VIEWED_TRIP':
        return update(state, { ui: { viewedTrip: { $set: null } } })

      case 'SET_VIEWED_ROUTE':
        if (action.payload) {
          // If setting to a route (not null), also set main panel.
          return update(state, { ui: {
            mainPanelContent: { $set: MainPanelContent.ROUTE_VIEWER },
            viewedRoute: { $set: action.payload }
          } })
        } else {
          // Otherwise, just replace viewed route with null
          return update(state, { ui: { viewedRoute: { $set: action.payload } } })
        }
      case 'FIND_STOP_RESPONSE':
        return update(state, {
          transitIndex: {
            stops: { [action.payload.id]: { $set: action.payload } }
          }
        })
      case 'FIND_TRIP_RESPONSE':
        return update(state, {
          transitIndex: {
            trips: { [action.payload.id]: { $set: action.payload } }
          }
        })
      case 'FIND_STOPS_FOR_TRIP_RESPONSE':
        return update(state, {
          transitIndex: {
            trips: {
              [action.payload.tripId]: { stops: { $set: action.payload.stops } }
            }
          }
        })
      case 'FIND_STOPS_FOR_PATTERN_RESPONSE':
        return update(state, {
          transitIndex: {
            routes: {
              [action.payload.routeId]: {
                patterns: {
                  [action.payload.patternId]: {
                    stops: { $set: action.payload.stops }
                  }
                }
              }
            }
          }
        })
      case 'FIND_STOP_TIMES_FOR_TRIP_RESPONSE':
        return update(state, {
          transitIndex: {
            trips: {
              [action.payload.tripId]: {
                stopTimes: { $set: action.payload.stopTimes }
              }
            }
          }
        })
      case 'FIND_GEOMETRY_FOR_TRIP_RESPONSE':
        return update(state, {
          transitIndex: {
            trips: {
              [action.payload.tripId]: {
                geometry: { $set: action.payload.geometry }
              }
            }
          }
        })
      case 'FETCHING_STOP_TIMES_FOR_STOP':
        return update(state, {
          transitIndex: {
            stops: {
              [action.payload.stopId]: {
                fetchStatus: { $set: FETCH_STATUS.FETCHING }
              }
            }
          }
        })
      case 'FIND_STOP_TIMES_FOR_STOP_RESPONSE':
        return update(state, {
          transitIndex: {
            stops: {
              [action.payload.stopId]: {
                fetchStatus: { $set: FETCH_STATUS.FETCHED },
                stopTimes: { $set: action.payload.stopTimes },
                stopTimesLastUpdated: { $set: new Date().getTime() }
              }
            }
          }
        })
      case 'TOGGLE_AUTO_REFRESH':
        storeItem('autoRefreshStopTimes', action.payload)
        return update(state, { user: { autoRefreshStopTimes: { $set: action.payload } } })

      case 'FIND_ROUTES_RESPONSE':
        // If routes is undefined, initialize it w/ the full payload
        if (!state.transitIndex.routes) {
          return update(state, {
            transitIndex: { routes: { $set: action.payload } }
          })
        }
        // Otherwise, merge in only the routes not already defined
        const currentRouteIds = Object.keys(state.transitIndex.routes)
        const newRoutes = Object.keys(action.payload)
          .filter(key => !currentRouteIds.includes(key))
          .reduce((res, key) => Object.assign(res, { [key]: action.payload[key] }), {})
        return update(state, {
          transitIndex: { routes: { $merge: newRoutes } }
        })
      case 'FIND_ROUTE_RESPONSE':
        // If routes is undefined, initialize it w/ this route only
        if (!state.transitIndex.routes) {
          return update(state, {
            transitIndex: { routes: { $set: { [action.payload.id]: action.payload } } }
          })
        }
        // Otherwise, overwrite only this route
        return update(state, {
          transitIndex: {
            routes: { [action.payload.id]: { $merge: action.payload } }
          }
        })
      case 'FIND_PATTERNS_FOR_ROUTE_RESPONSE':
        const { patterns, routeId } = action.payload
        // If routes is undefined, initialize it w/ this route only
        if (!state.transitIndex.routes) {
          return update(state, {
            transitIndex: { routes: { $set: { [routeId]: { patterns } } } }
          })
        }
        // Otherwise, overwrite only this route
        return update(state, {
          transitIndex: {
            routes: { [routeId]: { patterns: { $set: patterns } } }
          }
        })
      case 'FIND_GEOMETRY_FOR_PATTERN_RESPONSE':
        return update(state, {
          transitIndex: {
            routes: {
              [action.payload.routeId]: {
                patterns: {
                  [action.payload.patternId]: {
                    geometry: { $set: action.payload.geometry }
                  }
                }
              }
            }
          }
        })
      case 'TNC_ETA_RESPONSE':
        return update(state, {
          tnc: {
            etaEstimates: {
              [action.payload.from]: fromData => {
                fromData = Object.assign({}, fromData)
                const estimates = action.payload.estimates || []
                estimates.forEach(estimate => {
                  if (!fromData[estimate.company]) {
                    fromData[estimate.company] = {}
                  }
                  fromData[estimate.company][estimate.productId] = Object.assign(
                    {
                      estimateTimestamp: new Date()
                    },
                    estimate
                  )
                })
                return fromData
              }
            }
          }
        })
      case 'TNC_RIDE_RESPONSE':
        return update(state, {
          tnc: {
            rideEstimates: {
              [action.payload.from]: fromData => {
                fromData = Object.assign({}, fromData)
                const { company, rideEstimate, to } = action.payload
                if (!rideEstimate) {
                  return fromData
                }
                if (!fromData[to]) {
                  fromData[to] = {}
                }
                if (!fromData[to][company]) {
                  fromData[to][company] = {}
                }
                fromData[to][company][rideEstimate.rideType] = Object.assign(
                  {
                    estimateTimestamp: new Date()
                  },
                  rideEstimate
                )
                return fromData
              }
            }
          }
        })

      case 'PARK_AND_RIDE_RESPONSE':
        return update(state, {
          overlay: {
            parkAndRide: {
              locations: { $set: action.payload },
              pending: { $set: false }
            }
          }
        })

      // TODO: can this be broken out into a separate module?
      case 'ZIPCAR_LOCATIONS_RESPONSE':
        return update(state, {
          overlay: {
            zipcar: {
              locations: { $set: action.payload.locations },
              pending: { $set: false }
            }
          }
        })
      case 'UPDATE_OVERLAY_VISIBILITY':
        const mapOverlays = clone(state.config.map.overlays)
        for (const key in action.payload) {
          const overlay = mapOverlays.find(o => o.name === key)
          overlay.visible = action.payload[key]
        }
        return update(state,
          { config: { map: { overlays: { $set: mapOverlays } } } }
        )
      case 'UPDATE_ITINERARY_FILTER':
        return update(state,
          { filter: { $set: action.payload } }
        )
      case 'SET_PREVIOUS_ITINERARY_VIEW':
        return update(state, { ui: { previousItineraryView: { $set: action.payload } } })
      case 'UPDATE_LOCALE':
        return update(state, { ui: {
          locale: { $set: action.payload.locale },
          localizedMessages: { $set: action.payload.messages }
        }})
      default:
        return state
    }
  }
}

export default createOtpReducer

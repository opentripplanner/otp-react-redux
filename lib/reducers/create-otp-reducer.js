/* eslint-disable no-case-declarations */
import clone from 'clone'
import coreUtils from '@opentripplanner/core-utils'
import objectPath from 'object-path'
import update from 'immutability-helper'

import { combinationFilter } from '../util/combination-filter'
import {
  FETCH_STATUS,
  PERSIST_TO_LOCAL_STORAGE,
  TIMEOUT_IGNORED_ACTIONS
} from '../util/constants'
import { getDefaultModes, isBatchRoutingEnabled } from '../util/itinerary'
import { getISOLikeTimestamp } from '../util/state'
import { MainPanelContent, MobileScreens } from '../actions/ui'

const { getTransitModes, isTransit } = coreUtils.itinerary
const { filterProfileOptions } = coreUtils.profile
const { ensureSingleAccessMode, getDefaultQuery } = coreUtils.query
const { getItem } = coreUtils.storage
const { getUserTimezone } = coreUtils.time

// TODO: fire planTrip action if default query is complete/error-free

/**
 * Validates the initial state of the store. This is intended to mainly catch
 * configuration issues since a manually edited config file is loaded into the
 * initial state.
 * TODO: maybe it's a better idea to move all of this to a script that can do
 *  JSON Schema validation and other stuff.
 */
function validateInitialState(initialState) {
  const { config } = initialState

  const errors = []

  // validate that the ArcGIS geocoder isn't used with a persistence strategy of
  // `localStorage`. ArcGIS requires the use of a paid account to store geocode
  // results.
  // See https://developers.arcgis.com/rest/geocode/api-reference/geocoding-free-vs-paid.htm
  if (
    objectPath.get(config, 'persistence.enabled') &&
    objectPath.get(config, 'persistence.strategy') ===
      PERSIST_TO_LOCAL_STORAGE &&
    objectPath.get(config, 'geocoder.type') === 'ARCGIS'
  ) {
    errors.push(
      new Error(
        'Local Storage persistence and ARCGIS geocoder cannot be enabled at the same time!'
      )
    )
  }

  if (errors.length > 0) {
    throw new Error(
      errors.reduce((message, error) => {
        return `${message}\n- ${error.message}`
      }, 'Encountered the following configuration errors:')
    )
  }
}

/**
 * Create the initial state of otp-react-redux using user-provided config, any
 * items in localStorage and a few defaults.
 */
export function getInitialState(userDefinedConfig) {
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
      nearbyRadius: 250,
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

  // Load query-related user settings from local storage.
  // User overrides determine user's default mode/query parameters.
  const userOverrides = getItem('defaultQuery', {})
  // Combine user overrides with default query to get default search settings.
  const defaults = Object.assign(getDefaultQuery(config), userOverrides)
  // TODO: parse and merge URL query params w/ default query
  // populate query by merging any provided query params w/ the default params
  const currentQuery = Object.assign(defaults, userDefinedConfig.initialQuery)
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
    queryModes = queryModes.filter((m) => !isTransit(m))
    // Add all possible transit modes
    queryModes = queryModes.concat(getTransitModes(config))
    // Stringify and set as OTP 'mode' query param
    currentQuery.mode = queryModes.join(',')
  }

  // If we are in 'ITINERARY' mode, ensure that one and only one access mode is selected
  if (currentQuery.routingType === 'ITINERARY') {
    queryModes = ensureSingleAccessMode(queryModes)
  }

  const configModes = config?.modes?.combinations
  if (configModes) {
    // Inject combinations from config for batch routing.
    // Filter options based on defaults if modeOptions is specified in config
    const enabledCombinations = config.modes.modeOptions
      ? configModes.filter(
          combinationFilter(getDefaultModes(config.modes.modeOptions))
        )
      : configModes

    currentQuery.combinations = clone(enabledCombinations)
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
    initialUrl: window.location.href,
    lastActionMillis: 0,
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
      routes: {},
      stops: {},
      trips: {}
    },
    ui: {
      diagramLeg: null,
      locale: null,
      localizedMessages: null,
      mainPanelContent: null,
      mobileScreen: MobileScreens.WELCOME_SCREEN,
      popup: { id: null },
      printView: window.location.href.indexOf('/print/') !== -1,
      routeViewer: {
        filter: {
          agency: null,
          mode: null,
          search: ''
        }
      }
    }
  }
}

function createOtpReducer(config) {
  const initialState = getInitialState(config)
  // validate the initial state
  validateInitialState(initialState)

  /* eslint-disable-next-line complexity */
  return (prevState = initialState, action) => {
    // Update last action timestamp for eligible actions.
    const state = TIMEOUT_IGNORED_ACTIONS.includes(action.type)
      ? prevState
      : update(prevState, {
          lastActionMillis: { $set: new Date().valueOf() }
        })
    const searchId = action.payload && action.payload.searchId
    const requestId = action.payload && action.payload.requestId
    const activeSearch = state.searches[searchId]
    const timestamp = getISOLikeTimestamp(config.homeTimezone)
    switch (action.type) {
      case 'ROUTING_REQUEST':
        const { activeItinerary, pending, updateSearchInReducer } =
          action.payload
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
              timestamp: { $set: timestamp }
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
                timestamp
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
                $push: [
                  {
                    error: action.payload.error,
                    requestId,
                    url: action.payload.url
                  }
                ]
              }
            }
          }
        })
      case 'ROUTING_RESPONSE':
        const response =
          state.currentQuery.routingType === 'PROFILE'
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
      /*
        This is not actively used, but may be again in the future to 
        facilitate trip monitoring, which requires a non-realtime
        trip 
      */
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
        Object.entries(action.payload.assignedItinerariesByResponse).forEach(
          ([responseIdx, responsePlanItineraries]) => {
            responseUpdate[responseIdx] = {
              plan: {
                itineraries: {
                  $set: responsePlanItineraries
                }
              }
            }
          }
        )
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
                timestamp
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
      case 'SET_ACTIVE_ITINERARY_TIME':
        return update(state, {
          searches: {
            [state.activeSearchId]: {
              activeItineraryTimeIndex: { $set: action.payload }
            }
          }
        })
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
      case 'SET_AUTOPLAN':
        return update(state, {
          config: { autoPlan: { $set: action.payload.autoPlan } }
        })
      case 'SET_MAP_CENTER':
        if (isNaN(action.payload.lat) || isNaN(action.payload.lon)) return state

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
        const originalPath =
          config.api.originalPath || config.api.path || '/otp/routers/default'
        const path = routerId
          ? `/otp/routers/${routerId}`
          : // If routerId is null, revert to the original config's API path (or
            // the standard path if that is not found).
            originalPath
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
            diagramLeg: { $set: action.payload },
            mapillaryId: { $set: false }
          }
        })
      case 'SET_MAPILLARY_ID':
        return update(state, {
          ui: {
            diagramLeg: { $set: false },
            mapillaryId: { $set: action.payload }
          }
        })
      case 'SET_ELEVATION_POINT':
        return update(state, {
          ui: {
            elevationPoint: { $set: action.payload }
          }
        })
      case 'SET_MAP_POPUP_LOCATION':
        // If we are trying to add the name to a location, and the
        // popup is closed or has been moved somewhere else,
        // don't update!
        if (
          action?.payload?.location?.name &&
          (state.ui?.mapPopupLocation === null ||
            !coreUtils.map.matchLatLon(
              state.ui.mapPopupLocation,
              action.payload.location
            ))
        ) {
          return state
        }

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
        const { focusStopId, stops } = action.payload
        const stopLookup = {}
        stops.forEach((s) => {
          stopLookup[s.id] = s
        })

        const stopIds = stops
          .map((stop) => stop.id)
          .filter((id) => focusStopId !== id)

        if (!focusStopId) {
          return update(state, {
            location: {
              nearbyStops: { $set: stopIds }
            },
            transitIndex: { stops: { $merge: stopLookup } }
          })
        } else {
          // We need to remove the parent stop from the stop lookup to avoid overwriting it and
          // losing the child stops field we're adding here.
          delete stopLookup[focusStopId]
          return update(state, {
            transitIndex: {
              stops: {
                // We'll keep all of the main child stop objects in the stops lookup (to match how the state currently looks)
                $merge: stopLookup, // going to include the parentStop
                // For the parent stop, we want to add the nearby stops as a new child stops field
                [focusStopId]: { $merge: { nearbyStops: stopIds } }
              }
            }
          })
        }
      case 'FIND_NEARBY_AMENITIES_RESPONSE':
        const { stopId, ...amenities } = action.payload
        if (!stopId || !amenities) return state

        return update(state, {
          transitIndex: {
            stops: {
              [stopId]: { $merge: amenities }
            }
          }
        })
      case 'STOPS_WITHIN_BBOX_RESPONSE':
        return update(state, {
          overlay: {
            transit: {
              pending: { $set: false },
              stops: { $set: action?.payload?.stops }
            }
          }
        })
      case 'REALTIME_VEHICLE_POSITIONS_RESPONSE':
        if (!action.payload?.vehicles) return state

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
        if (action?.payload !== null) {
          // If setting to a stop (not null), also set main panel.
          return update(state, {
            ui: {
              mainPanelContent: { $set: MainPanelContent.STOP_VIEWER },
              viewedStop: { $set: action.payload }
            }
          })
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

      case 'SET_HOVERED_STOP':
        return update(state, {
          ui: { highlightedStop: { $set: action.payload } }
        })

      case 'SET_VIEWED_ROUTE':
        if (action.payload) {
          // If setting to a route (not null), also set main panel.
          return update(state, {
            ui: {
              mainPanelContent: { $set: MainPanelContent.ROUTE_VIEWER },
              viewedRoute: { $set: action.payload }
            }
          })
        } else {
          // Otherwise, just replace viewed route with null
          return update(state, {
            ui: { viewedRoute: { $set: action.payload } }
          })
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
              [action.payload.tripId]: {
                stops: { $set: action.payload?.stops }
              }
            }
          }
        })
      case 'FIND_STOPS_FOR_PATTERN_RESPONSE':
        const patternStops = action?.payload?.stops || []

        return update(state, {
          transitIndex: {
            routes: {
              [action?.payload?.routeId || 'null']: {
                patterns: {
                  [action.payload.patternId]: {
                    stops: { $set: patternStops }
                  }
                }
              }
            }
          }
        })
      case 'FIND_STOP_TIMES_FOR_TRIP_RESPONSE':
        if (!action.payload?.tripId) return state
        if (!action.payload?.stopTimes) return state

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

      case 'FIND_ROUTES_RESPONSE':
        // If routes is undefined, initialize it w/ the full payload
        if (!state.transitIndex.routes) {
          return update(state, {
            transitIndex: { routes: { $set: action.payload } }
          })
        }
        // otherwise, merge new data into what's already defined
        return update(state, {
          transitIndex: { routes: { $merge: action.payload } }
        })
      case 'FIND_ROUTE_RESPONSE':
        // If routes is undefined, initialize it w/ this route only
        if (!state.transitIndex.routes) {
          return update(state, {
            transitIndex: {
              routes: { $set: { [action.payload.id]: action.payload } }
            }
          })
        }
        // Otherwise, overwrite only this route
        if (!state.transitIndex.routes[action.payload.id]) {
          return update(state, {
            transitIndex: {
              // If it is a new route, set rather than merge with an empty object
              routes: { [action.payload.id]: { $set: action.payload } }
            }
          })
        }
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
        // If patterns for route is undefined set it
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
              [action.payload.from]: (fromData) => {
                fromData = Object.assign({}, fromData)
                const estimates = action.payload.estimates || []
                estimates.forEach((estimate) => {
                  if (!fromData[estimate.company]) {
                    fromData[estimate.company] = {}
                  }
                  fromData[estimate.company][estimate.productId] =
                    Object.assign(
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
              [action.payload.from]: (fromData) => {
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
        for (const overlayInfo of action.payload) {
          const { overlay: targetOverlay, visible } = overlayInfo
          const targetCompanies = targetOverlay.companies?.join(',')
          const targetModes = targetOverlay.modes?.join(',')
          // Find overlay to change not by name (name is no longer required in config and changes with i18n),
          // but by type/companies/modes instead.
          const overlay = mapOverlays.find(
            (o) =>
              o.type === overlayInfo.overlay.type &&
              o.companies?.join(',') === targetCompanies &&
              o.modes?.join(',') === targetModes
          )
          overlay.visible = visible
        }
        return update(state, {
          config: { map: { overlays: { $set: mapOverlays } } }
        })
      case 'UPDATE_ITINERARY_FILTER':
        return update(state, { filter: { $set: action.payload } })
      case 'SET_PREVIOUS_ITINERARY_VIEW':
        return update(state, {
          ui: { previousItineraryView: { $set: action.payload } }
        })
      case 'UPDATE_LOCALE':
        return update(state, {
          ui: {
            locale: { $set: action.payload.locale },
            localizedMessages: { $set: action.payload.messages }
          }
        })

      case 'UPDATE_ROUTE_VIEWER_FILTER':
        return update(state, {
          ui: {
            routeViewer: {
              filter: { $merge: action.payload }
            }
          }
        })
      case 'SET_POPUP_CONTENT':
        const target = state.config.popups?.targets?.[action.payload]
        return update(state, {
          ui: {
            popup: {
              appendLocale: { $set: target?.appendLocale },
              id: { $set: action.payload },
              // Explicit check done so that `true` is default
              modal: { $set: target?.modal !== false },
              url: {
                $set: target?.url
              }
            }
          }
        })
      default:
        return state
    }
  }
}

export default createOtpReducer

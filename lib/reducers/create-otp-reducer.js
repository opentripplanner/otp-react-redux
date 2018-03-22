import clone from 'clone'
import update from 'immutability-helper'

import queryParams from '../util/query-params'
import { ensureSingleAccessMode } from '../util/query'
import { isTransit, transitModes } from '../util/itinerary'
import { MobileScreens } from '../actions/ui'

const defaultConfig = {
  autoPlan: true,
  debouncePlanTimeMs: 0,
  realtimeEffectsDisplayThreshold: 120
}

// construct the initial/default query
const defaultQuery = { routingType: 'ITINERARY' }
queryParams.filter(qp => 'default' in qp).forEach(qp => {
  defaultQuery[qp.name] = qp.default
})

// TODO: parse and merge URL query params w/ default query

// TODO: fire planTrip action if default query is complete/error-free

function createOtpReducer (config, initialQuery) {
  // populate query by merging any provided query params w/ the default params
  const currentQuery = Object.assign(defaultQuery, initialQuery)

  let queryModes = currentQuery.mode.split(',')

  // If 'TRANSIT' is included in the mode list, replace it with individual modes
  if (queryModes.includes('TRANSIT')) {
    queryModes = queryModes.filter(m => !isTransit(m))
    config.modeGroups.forEach(group => {
      group.modes.forEach(m => {
        const modeStr = m.mode || m
        if (transitModes.includes(modeStr)) queryModes.push(modeStr)
      })
    })
    currentQuery.mode = queryModes.join(',')
  }

  // If we are in 'ITINERARY' mode, ensure that one and only one access mode is selected
  if (currentQuery.routingType === 'ITINERARY') {
    queryModes = ensureSingleAccessMode(queryModes)
  }

  const initialState = {
    config: Object.assign(defaultConfig, config),
    currentQuery,
    location: {
      currentPosition: {
        error: null,
        coords: null,
        fetching: false
      },
      sessionSearches: [],
      nearbyStops: []
    },
    searches: {},
    transitIndex: {
      stops: {},
      trips: {}
    },
    useRealtime: true,
    activeSearchId: 0,
    overlay: {
      bikeRental: {
        stations: []
      },
      transit: {
        stops: []
      }
    },
    tnc: {
      etaEstimates: {},
      rideEstimates: {}
    },
    ui: {
      mobileScreen: MobileScreens.WELCOME_SCREEN,
      diagramLeg: null
    }
  }

  return (state = initialState, action) => {
    const searchId = action.payload && action.payload.searchId
    switch (action.type) {
      case 'ROUTING_REQUEST':
        return update(state, {
          searches: {
            [searchId]: {
              $set: {
                activeItinerary: state.currentQuery.routingType === 'ITINERARY' ? 0 : null,
                activeLeg: null,
                activeStep: null,
                pending: true,
                query: clone(state.currentQuery),
                response: null
              }
            }
          },
          activeSearchId: { $set: searchId }
        })
      case 'ROUTING_ERROR':
        return update(state, {
          searches: {
            [searchId]: {
              response: {
                $set: {
                  error: action.payload.error
                }
              },
              pending: { $set: false }
            }
          }
        })
      case 'ROUTING_RESPONSE':
        return update(state, {
          searches: {
            [searchId]: {
              response: { $set: action.payload.response },
              pending: { $set: false }
            }
          },
          ui: {
            diagramLeg: { $set: false }
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
      case 'BIKE_RENTAL_REQUEST':
        return update(state, {
          overlay: {
            bikeRental: {
              pending: { $set: true },
              error: { $set: null }
            }
          }
        })
      case 'BIKE_RENTAL_ERROR':
        return update(state, {
          overlay: {
            bikeRental: {
              pending: { $set: false },
              error: { $set: action.payload }
            }
          }
        })
      case 'BIKE_RENTAL_RESPONSE':
        return update(state, {
          overlay: {
            bikeRental: {
              stations: { $set: action.payload.stations },
              pending: { $set: false }
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
            [action.payload.type]: { $set: action.payload.location }
          }
        })
      case 'CLEAR_LOCATION':
        return update(state, {
          currentQuery: { [action.payload.type]: { $set: null } }
        })

      case 'SET_QUERY_PARAM':
        console.log('merging QPs', action.payload)
        return update(state, { currentQuery: { $merge: action.payload } })
      case 'FORM_CHANGED':
        return update(state, { activeSearchId: { $set: null } })

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
      case 'SHOW_LEG_DIAGRAM':
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
              stops: { $set: action.payload.stops },
              pending: { $set: false }
            }
          }
        })
      case 'CLEAR_STOPS_OVERLAY':
        return update(state, {
          overlay: {
            transit: {
              stops: { $set: [] },
              pending: { $set: false }
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
          ui: { mainPanelContent: { $set: action.payload } }
        })
      case 'SET_VIEWED_STOP':
        return update(state, { ui: { viewedStop: { $set: action.payload } } })
      case 'CLEAR_VIEWED_STOP':
        return update(state, { ui: { viewedStop: { $set: null } } })

      case 'SET_VIEWED_TRIP':
        return update(state, { ui: { viewedTrip: { $set: action.payload } } })
      case 'CLEAR_VIEWED_TRIP':
        return update(state, { ui: { viewedTrip: { $set: null } } })

      case 'SET_VIEWED_ROUTE':
        return update(state, { ui: { viewedRoute: { $set: action.payload } } })

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
      case 'FIND_STOP_TIMES_FOR_STOP_RESPONSE':
        return update(state, {
          transitIndex: {
            stops: {
              [action.payload.stopId]: {
                stopTimes: { $set: action.payload.stopTimes }
              }
            }
          }
        })
      case 'FIND_ROUTES_RESPONSE':
        return update(state, {
          transitIndex: { routes: { $set: action.payload } }
        })
      case 'FIND_ROUTE_RESPONSE':
        return update(state, {
          transitIndex: {
            routes: { [action.payload.id]: { $set: action.payload } }
          }
        })
      case 'FIND_PATTERNS_FOR_ROUTE_RESPONSE':
        return update(state, {
          transitIndex: {
            routes: {
              [action.payload.routeId]: {
                patterns: { $set: action.payload.patterns }
              }
            }
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
                const {company, rideEstimate, to} = action.payload
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

      default:
        return state
    }
  }
}

export default createOtpReducer

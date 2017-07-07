import clone from 'clone'
import update from 'immutability-helper'

import queryParams from '../common/query-params'

const defaultConfig = {
  autoPlan: true,
  debouncePlanTimeMs: 0
}

// construct the initial/default query
const defaultQuery = { type: 'ITINERARY' }
queryParams.filter(qp => 'default' in qp).forEach(qp => {
  defaultQuery[qp.name] = qp.default
})

// TODO: parse and merge URL query params w/ default query

// TODO: fire planTrip action if default query is complete/error-free

function createOtpReducer (config, initialQuery) {
  defaultQuery.mode = defaultQuery.mode || config.modes[0] || 'TRANSIT,WALK'
  // populate query by merging any provided query params w/ the default params
  const currentQuery = Object.assign(defaultQuery, initialQuery)
  const initialState = {
    config: Object.assign(defaultConfig, config),
    currentQuery,
    location: {
      currentPosition: null,
      sessionSearches: [],
      nearbyStops: []
    },
    searches: [],
    transitIndex: {
      stops: {}
    },
    activeSearch: 0,
    overlay: {
      bikeRental: {
        stations: []
      },
      transit: {
        stops: []
      }
    }
  }

  return (state = initialState, action) => {
    const latestSearchIndex = state.searches.length - 1
    switch (action.type) {
      case 'PLAN_REQUEST':
        return update(state, {
          searches: { $push: [{
            query: clone(state.currentQuery),
            pending: true,
            planResponse: null,
            type: 'ITINERARY',
            activeItinerary: 0,
            activeLeg: null,
            activeStep: null
          }]}
        })
      case 'PROFILE_REQUEST':
        return update(state, {
          searches: { $push: [{
            query: clone(state.currentQuery),
            pending: true,
            profileResponse: null,
            type: 'PROFILE'
          }]}
        })
      case 'PLAN_ERROR':
        return update(state, {
          searches: {[latestSearchIndex]: {
            planResponse: {
              $set: {
                error: action.payload
              }
            },
            pending: {$set: false}
          }},
          activeSearch: { $set: latestSearchIndex }
        })
      case 'PLAN_RESPONSE':
        return update(state, {
          searches: {[latestSearchIndex]: {
            planResponse: {$set: action.payload},
            pending: {$set: false}
          }},
          activeSearch: { $set: latestSearchIndex }
        })
      case 'PROFILE_RESPONSE':
        return update(state, {
          searches: {[latestSearchIndex]: {
            profileResponse: {$set: action.payload},
            pending: {$set: false}
          }},
          activeSearch: { $set: latestSearchIndex }
        })
      case 'BIKE_RENTAL_REQUEST':
        return update(state, {
          overlay: {
            bikeRental: {
              pending: {$set: true},
              error: {$set: null}
            }
          }
        })
      case 'BIKE_RENTAL_ERROR':
        return update(state, {
          overlay: {
            bikeRental: {
              pending: {$set: false},
              error: {$set: action.payload}
            }
          }
        })
      case 'BIKE_RENTAL_RESPONSE':
        return update(state, {
          overlay: {
            bikeRental: {
              stations: {$set: action.payload.stations},
              pending: {$set: false}
            }
          }
        })
      case 'SET_ACTIVE_ITINERARY':
        if (state.activeSearch !== null) {
          return update(state, { searches: { [state.activeSearch]: {
            activeItinerary: { $set: action.payload.index },
            activeLeg: { $set: null },
            activeStep: { $set: null }
          } } })
        }
        return state
      case 'SET_ACTIVE_LEG':
        if (state.activeSearch !== null) {
          return update(state, { searches: { [state.activeSearch]: {
            activeLeg: { $set: action.payload.index },
            activeStep: { $set: null }
          } } })
        }
        return state
      case 'SET_ACTIVE_STEP':
        if (state.activeSearch !== null) {
          return update(state, { searches: { [state.activeSearch]: { activeStep: { $set: action.payload.index } } } })
        }
        return state
      case 'SET_LOCATION':
        return update(state, { currentQuery: { [action.payload.type]: { $set: action.payload.location } } })
      case 'CLEAR_LOCATION':
        return update(state, { currentQuery: { [action.payload.type]: { $set: null } } })

      case 'SET_QUERY_PARAM':
        console.log('merging QPs', action.payload)
        return update(state, { currentQuery: { $merge: action.payload } })
      case 'FORM_CHANGED':
        return update(state, { activeSearch: { $set: null } })

      case 'SET_AUTOPLAN':
        return update(state, { config: { autoPlan: { $set: action.payload.autoPlan } } })
      case 'SET_MAP_CENTER':
        return update(state, { config: { map: {
          initLat: { $set: action.payload.lat },
          initLon: { $set: action.payload.lon }
        } } })

      case 'POSITION_RESPONSE':
        return update(state, { location: { currentPosition: { $set: action.payload.position } } })
      case 'ADD_LOCATION_SEARCH':
        return update(state, { location: { sessionSearches: { $unshift: [action.payload.location] } } })

      case 'NEARBY_STOPS_RESPONSE':
        const stopLookup = {}
        action.payload.stops.forEach(s => { stopLookup[s.id] = s })
        return update(state, {
          location: { nearbyStops: { $set: action.payload.stops.map(s => s.id) } },
          transitIndex: { stops: { $merge: stopLookup } }
        })
      case 'STOPS_WITHIN_BBOX_RESPONSE':
        return update(state, {
          overlay: {
            transit: {
              stops: {$set: action.payload.stops},
              pending: {$set: false}
            }
          }
        })
      case 'CLEAR_STOPS_OVERLAY':
        return update(state, {
          overlay: {
            transit: {
              stops: {$set: []},
              pending: {$set: false}
            }
          }
        })
      case 'ROUTES_AT_STOP_RESPONSE':
        return update(state, { transitIndex: { stops: { [action.payload.stopId]: { routes: { $set: action.payload.routes } } } } })

      default:
        return state
    }
  }
}

export default createOtpReducer

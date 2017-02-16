import clone from 'clone'
import update from 'immutability-helper'

import { planParamsToQuery } from '../util/state'
import { getCurrentDate, getCurrentTime } from '../util/time'

// TODO: parse query params
const defaultQuery = {
  // when: {
  //   date: getCurrentDate(),
  //   departArrive: 'NOW',
  //   time: getCurrentTime(),
  //   type: 'ITINERARY'
  // },
  // where: {
  //   from: null,
  //   to: null
  // },

  // TODO: replace with above?
  date: getCurrentDate(),
  departArrive: 'NOW',
  time: getCurrentTime(),
  type: 'ITINERARY',
  from: null,
  to: null,
  mode: null,

  // fromPlace: null,
  // toPlace: null,
  intermediatePlaces: null,
  intermediatePlacesOrdered: null,
  // date: null,
  // time: null,
  routerId: null,
  arriveBy: null,
  wheelchair: null,
  maxWalkDistance: 8046,
  walkSpeed: null,
  bikeSpeed: null,
  triangleSafetyFactor: null,
  triangleSlopeFactor: null,
  triangleTimeFactor: null,
  optimize: null,
  // mode: 'TRANSIT,WALK',
  minTransferTime: null,
  preferredRoutes: null,
  preferredAgencies: null,
  unpreferredRoutes: null,
  unpreferredAgencies: null,
  showIntermediateStops: null,
  bannedRoutes: null,
  bannedAgencies: null,
  bannedTrips: null,
  transferPenalty: null,
  maxTransfers: null,
  numItineraries: 3,
  wheelchairAccessible: false
}
// getDefaultQuery()

function createOtpReducer (config, initialQuery) {
  defaultQuery.mode = defaultQuery.mode || config.modes[0] || 'TRANSIT,WALK'
  if (config.routerDefaults) {
    for (var key in config.routerDefaults) {
      defaultQuery[key] = config.routerDefaults[key]
    }
  }
  // populate query by merging any provided query params w/ the default params
  const currentQuery = Object.assign(defaultQuery, initialQuery)
  const initialState = {
    config,
    currentQuery,
    searches: [],
    mapState: {
      lat: config.map.initLat,
      lon: config.map.initLon,
      zoom: config.map.initZoom || 13
    },
    activeSearch: 0
  }

  return (state = initialState, action) => {
    switch (action.type) {
      case 'PLAN_REQUEST':
        return update(state, {
          searches: { $push: [{
            query: clone(state.currentQuery),
            pending: true,
            planResponse: null,
            activeItinerary: 0,
            activeLeg: null,
            activeStep: null
          }]}
        })
      case 'PLAN_RESPONSE':
        const latestIndex = state.searches.length - 1
        return update(state, {
          searches: {[latestIndex]: {
            planResponse: {$set: action.payload},
            pending: {$set: false}
          }},
          activeSearch: { $set: state.searches.length - 1 }
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
      case 'SET_MODE':
        return update(state, { currentQuery: { mode: { $set: action.payload.mode } } })
      case 'SET_DEPART':
        return update(state, { currentQuery: { departArrive: { $set: action.payload.departArrive } } })
      case 'SET_DATE':
        return update(state, { currentQuery: { date: { $set: action.payload.date } } })
      case 'SET_TIME':
        return update(state, { currentQuery: { time: { $set: action.payload.time } } })
      case 'FORM_CHANGED':
        return update(state, { activeSearch: { $set: null } })
      case 'UPDATE_MAP_STATE':
        return update(state, { mapState: { $merge: action.payload } })
      case '@@router/LOCATION_CHANGE':
        // parse plan params to query
        if (action.payload.pathname.indexOf('/plan') !== -1) {
          return update(state, { currentQuery: { $merge: planParamsToQuery(action.payload.query) } })
        } else if (action.payload.pathname.indexOf('/@') !== -1) {
          // TODO: handle updating location in mapState
          return state
          // update(state, { otp: { config: { map: {
          //   $set: (action.payload) // TODO: fix parsing of path
          // } } } })
        }
        return state
      default:
        return state
    }
  }
}

export default createOtpReducer

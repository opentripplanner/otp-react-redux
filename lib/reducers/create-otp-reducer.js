import clone from 'clone'
import update from 'immutability-helper'

// import { getDefaultQuery } from '../util/state'
import { getCurrentDate, getCurrentTime } from '../util/time'

// TODO: parse query params
const defaultQuery = {
  type: 'ITINERARY',
  from: null,
  to: null,
  departArrive: 'NOW',
  date: getCurrentDate(),
  time: getCurrentTime(),
  mode: 'TRANSIT,WALK'
}
// getDefaultQuery()

// TODO: fire planTrip action if default query is complete/error-free

function createOtpReducer (config, initialQuery) {
  defaultQuery.mode = defaultQuery.mode || config.modes[0] || 'TRANSIT,WALK'
  // populate query by merging any provided query params w/ the default params
  const currentQuery = Object.assign(defaultQuery, initialQuery)
  const initialState = {
    config,
    currentQuery,
    searches: [],
    activeSearch: 0,
    ui: {
      autoPlan: true,
      debouncePlanTimeMs: 0
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
            activeItinerary: 0,
            activeLeg: null,
            activeStep: null
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

      case 'SET_AUTOPLAN':
        return update(state, { ui: { autoPlan: { $set: action.payload.autoPlan } } })

      default:
        return state
    }
  }
}

export default createOtpReducer

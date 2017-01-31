import update from 'immutability-helper'

const defaultQuery = {
  type: 'ITINERARY',
  from: {},
  to: {},
  departArrive: 'DEPART'
}

function createOtpReducer (config, initialQuery) {
  // populate query by merging any provided query params w/ the default params
  const currentQuery = Object.assign(defaultQuery, initialQuery)

  const initialState = {
    config,
    currentQuery,
    searches: [],
    activeSearch: 0
  }

  return (state = initialState, action) => {
    switch (action.type) {
      case 'PLAN_RESPONSE':
        return update(state, {
          searches: { $push: [{
            planResponse: action.payload,
            activeItinerary: 0
          }]},
          activeSearch: { $set: state.searches.length }
        })
      case 'SET_LOCATION':
        if (action.payload.type === 'from') {
          return update(state, { currentQuery: { from: { $set: action.payload.location } } })
        } else if (action.payload.type === 'to') {
          return update(state, { currentQuery: { to: { $set: action.payload.location } } })
        }
        return state
      default:
        return state
    }
  }
}

export default createOtpReducer

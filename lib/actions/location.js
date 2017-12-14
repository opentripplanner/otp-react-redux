import { createAction } from 'redux-actions'

import { setLocationToCurrent } from './map'

export const receivedPositionError = createAction('POSITION_ERROR')
export const fetchingPosition = createAction('POSITION_FETCHING')
export const receivedPositionResponse = createAction('POSITION_RESPONSE')

export function getCurrentPosition (setAsType = null) {
  return async function (dispatch, getState) {
    if (navigator.geolocation) {
      dispatch(fetchingPosition({type: setAsType}))
      navigator.geolocation.getCurrentPosition(
        // On success
        position => {
          if (position) {
            console.log('current loc', position, setAsType)
            dispatch(receivedPositionResponse({ position }))
            if (setAsType) {
              console.log('setting location to current position')
              dispatch(setLocationToCurrent({type: setAsType}))
            }
          } else {
            dispatch(receivedPositionError({error: {message: 'Unknown error getting position'}}))
          }
        },
        // On error
        error => {
          console.log('error getting current position', error)
          dispatch(receivedPositionError({error}))
        })
    } else {
      console.log('current position not supported')
      dispatch(receivedPositionError({error: {message: 'Geolocation not supported by your browser'}}))
    }
  }
}

export const addLocationSearch = createAction('ADD_LOCATION_SEARCH')

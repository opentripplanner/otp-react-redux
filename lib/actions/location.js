import { createAction } from 'redux-actions'

export const receivedPositionError = createAction('POSITION_ERROR')
export const receivedPositionResponse = createAction('POSITION_RESPONSE')

export function getCurrentPosition () {
  return async function (dispatch, getState) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        if (position) {
          console.log('current loc', position)
          dispatch(receivedPositionResponse({ position }))
        } else {
          dispatch(receivedPositionError())
        }
      })
    } else {
      console.log('current position not supported')
      dispatch(receivedPositionError())
    }
  }
}

export const addLocationSearch = createAction('ADD_LOCATION_SEARCH')

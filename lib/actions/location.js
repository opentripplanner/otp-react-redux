import { createAction } from 'redux-actions'

import { setLocationToCurrent } from './map'

export const addLocationSearch = createAction('ADD_LOCATION_SEARCH')
export const receivedPositionError = createAction('POSITION_ERROR')
export const fetchingPosition = createAction('POSITION_FETCHING')
export const receivedPositionResponse = createAction('POSITION_RESPONSE')

export function getCurrentPosition(intl, setAsType = null, onSuccess) {
  return async function (dispatch, getState) {
    if (navigator.geolocation) {
      dispatch(fetchingPosition({ type: setAsType }))
      navigator.geolocation.getCurrentPosition(
        // On success
        (position) => {
          if (position) {
            console.log('current loc', position, setAsType)
            dispatch(receivedPositionResponse({ position }))
            if (setAsType) {
              console.log('setting location to current position')
              dispatch(setLocationToCurrent({ locationType: setAsType }, intl))
            }
            onSuccess && onSuccess(position)
          } else {
            dispatch(
              receivedPositionError({
                error: {
                  message: intl.formatMessage({
                    id: 'actions.location.unknownPositionError'
                  })
                }
              })
            )
          }
        },
        // On error
        (error) => {
          console.log('error getting current position', error)
          // FIXME, analyze error code to produce better error message.
          // See https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError
          dispatch(receivedPositionError({ error }))
        },
        // Options
        { enableHighAccuracy: true }
      )
    } else {
      console.log('current position not supported')
      dispatch(
        receivedPositionError({
          error: {
            message: intl.formatMessage({
              id: 'actions.location.geolocationNotSupportedError'
            })
          }
        })
      )
    }
  }
}

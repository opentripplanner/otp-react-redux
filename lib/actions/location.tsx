// @ts-expect-error TODO: add @types/redux-actions (will break other other stuff).
import { createAction } from 'redux-actions'
import { Dispatch } from 'redux'
import { IntlShape } from 'react-intl'
import { isMobile } from '@opentripplanner/core-utils/lib/ui'

import { setLocationToCurrent } from './map'

export const addLocationSearch = createAction('ADD_LOCATION_SEARCH')
export const receivedPositionError = createAction('POSITION_ERROR')
export const fetchingPosition = createAction('POSITION_FETCHING')
export const receivedPositionResponse = createAction('POSITION_RESPONSE')

export const PLACE_EDITOR_LOCATION = 'placeeditor'

export function getCurrentPosition(
  intl: IntlShape,
  setAsType?: string | null,
  onSuccess?: (position: GeolocationPosition) => void
) {
  return function (dispatch: Dispatch): void {
    if (navigator.geolocation) {
      dispatch(fetchingPosition({ type: setAsType }))
      navigator.geolocation.getCurrentPosition(
        // On success
        (position) => {
          if (position) {
            console.log('current loc', position, setAsType)
            dispatch(receivedPositionResponse({ position }))
            if (setAsType && setAsType !== PLACE_EDITOR_LOCATION) {
              console.log('setting location to current position')
              // @ts-expect-error Action below is not typed yet.
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
          // On desktop, after user clicks "Use location" from the location fields,
          // show an alert and explain if location is blocked.
          // TODO: Consider moving the handling of unavailable location to the location-field component.
          if (!isMobile() && error.code === 1) {
            window.alert(
              intl.formatMessage({
                id: 'actions.location.deniedAccessAlert'
              })
            )
          }
          const newError = { ...error }
          if (error.code === 1) {
            // i18n for user-denied location message (error.code = 1 on secure origins).
            if (
              window.location.protocol === 'https:' ||
              window.location.host.startsWith('localhost:')
            ) {
              newError.message = intl.formatMessage({
                id: 'actions.location.userDeniedPermission'
              })
            }
          }
          dispatch(receivedPositionError({ error: newError }))
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

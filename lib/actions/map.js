import { createAction } from 'redux-actions'
import coreUtils from '@opentripplanner/core-utils'
import getGeocoder from '@opentripplanner/geocoder'

import { clearActiveSearch } from './form'
import { deleteUserPlace } from './user'
import { routingQuery } from './api'

/* SET_LOCATION action creator. Updates a from or to location in the store
 *
 * payload format: {
 *   type: 'from' or 'to'
 *   location: {
 *     name: (string),
 *     lat: (number)
 *     lat: (number)
 *   }
 */

// Private actions
const clearingLocation = createAction('CLEAR_LOCATION')
const settingLocation = createAction('SET_LOCATION')
const deleteRecentPlace = createAction('DELETE_LOCAL_USER_RECENT_PLACE')

/**
 * Dispatches the action to delete a saved or recent place from localStorage.
 */
export function forgetPlace(placeId, intl) {
  return function (dispatch, getState) {
    // localStorage only: Recent place IDs contain the string literal 'recent'.
    if (placeId.indexOf('recent') !== -1) {
      dispatch(deleteRecentPlace(placeId))
    } else {
      dispatch(deleteUserPlace(placeId, intl))
    }
  }
}

export function clearLocation(payload) {
  return function (dispatch, getState) {
    // Dispatch the clear location action and then clear the active search (so
    // that the map and narrative are not showing a search when one or both
    // locations are not defined).
    dispatch(clearingLocation(payload))
    dispatch(clearActiveSearch())
  }
}

/**
 * Centers the given map to the coordinates of the specified place.
 */
export function setMapCenter(map /* MapRef */, location, zoom) {
  return function () {
    const { lat, lon } = location
    if (map && !isNaN(lat) && !isNaN(lon)) {
      const center = [lon, lat]
      // Note: passing an undefined zoom to map.jumpTo will trigger a "can't invert matrix" error.
      const jumpParams = zoom !== undefined ? { center, zoom } : { center }
      map.jumpTo(jumpParams)
    }
  }
}

/**
 * Animates the map to the specified place and the specified zoom level.
 */
export function zoomToPlace(map /* MapRef */, place, zoom) {
  return function () {
    if (place && map) {
      map.flyTo({ center: [place.lon, place.lat], zoom: zoom || 17 })
    }
  }
}

export function setLocation(payload) {
  return function (dispatch, getState) {
    const state = getState()

    // reverse geocode point location if requested
    if (payload.reverseGeocode) {
      getGeocoder(state.otp.config.geocoder)
        .reverse({ point: payload.location })
        .then((location) => {
          dispatch(
            settingLocation({
              location,
              locationType: payload.locationType
            })
          )
        })
        .catch((err) => {
          dispatch(
            settingLocation({
              location: payload.location,
              locationType: payload.locationType
            })
          )
          console.warn(err)
        })
    } else {
      // update the location in the store
      dispatch(settingLocation(payload))
    }
  }
}

/* payload is simply { type: 'from'|'to' }; location filled in automatically */

export function setLocationToCurrent(payload, intl) {
  return function (dispatch, getState) {
    const currentPosition = getState().otp.location.currentPosition
    if (currentPosition.error || !currentPosition.coords) return
    payload.location = {
      category: 'CURRENT_LOCATION',
      lat: currentPosition.coords.latitude,
      lon: currentPosition.coords.longitude,
      name: intl.formatMessage({ id: 'actions.map.currentLocation' })
    }
    dispatch(settingLocation(payload))
  }
}

/**
 * Handler for @opentripplanner/location-field onLocationSelected
 */
export function onLocationSelected(
  intl,
  { location, locationType, resultType }
) {
  return function (dispatch, getState) {
    if (resultType === 'CURRENT_LOCATION') {
      dispatch(setLocationToCurrent({ locationType }, intl))
    } else {
      dispatch(setLocation({ location, locationType }))
    }
  }
}

export function switchLocations() {
  return async function (dispatch, getState) {
    const { from, to } = getState().otp.currentQuery
    // First, reverse the locations.
    await dispatch(
      settingLocation({
        location: to,
        locationType: 'from'
      })
    )
    await dispatch(
      settingLocation({
        location: from,
        locationType: 'to'
      })
    )
    // Then kick off a routing query (if the query is invalid, search will abort).
    return dispatch(routingQuery())
  }
}

export const setLegDiagram = createAction('SET_LEG_DIAGRAM')
export const setMapillaryId = createAction('SET_MAPILLARY_ID')

export const setElevationPoint = createAction('SET_ELEVATION_POINT')

export const setMapPopupLocation = createAction('SET_MAP_POPUP_LOCATION')

export function setMapPopupLocationAndGeocode(mapEvent) {
  const location = coreUtils.map.constructLocation(mapEvent.lngLat)
  return function (dispatch, getState) {
    dispatch(setMapPopupLocation({ location }))
    getGeocoder(getState().otp.config.geocoder)
      .reverse({ point: location })
      .then((location) => {
        dispatch(setMapPopupLocation({ location }))
      })
      .catch((err) => {
        console.warn(err)
      })
  }
}

/**
 * Closes the map popup by setting the mapPopupLocation redux state to null.
 */
export function clearMapPopupLocation() {
  return function (dispatch) {
    dispatch(setMapPopupLocation({ location: null }))
  }
}

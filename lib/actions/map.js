import { createAction } from 'redux-actions'
import coreUtils from '@opentripplanner/core-utils'
import getGeocoder from '@opentripplanner/geocoder'

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
export const settingLocation = createAction('SET_LOCATION')

/**
 * Centers the given map to the coordinates of the specified place.
 */
export function setMapCenter(map /* MapRef */, location) {
  return function () {
    const { lat, lon } = location
    if (map && !isNaN(lat) && !isNaN(lon)) {
      const center = [lon, lat]
      map.panTo(center)
    }
  }
}

/**
 * Animates the map to the specified place and the specified zoom level.
 */
export function zoomToPlace(map /* MapRef */, place, zoom) {
  return function () {
    if (place && place.lat !== undefined && place.lon !== undefined && map) {
      map.flyTo({ center: [place.lon, place.lat], zoom: zoom || 17 })
    }
  }
}

export function setLocation(payload) {
  return function (dispatch, getState) {
    const state = getState()

    // reverse geocode point location if requested
    if (payload?.reverseGeocode) {
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

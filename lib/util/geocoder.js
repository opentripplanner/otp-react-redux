import * as arcgis from '@conveyal/geocoder-arcgis-geojson'
import * as pelias from 'isomorphic-mapzen-search'
import memoize from 'lodash.memoize'

/**
 * Helper for creating a setting up a custom response rewrite function for a
 * certain api response.
 */
function makeResponseRewriter (rewriters, key) {
  return response => {
    if (rewriters && typeof rewriters[key] === 'function') {
      return rewriters[key](response)
    }
    return response
  }
}

/**
 * Create customized geocoder funcitons given a certain geocoding API, the
 * config for the geocoder and response rewrite functions specific to this
 * application. Any geocoder api that is added is expected to have an API that
 * behaves very closely to https://github.com/conveyal/isomorphic-mapzen-search
 */
function makeGeocoder (geocoderApi, geocoderConfig, responseRewriters) {
  const {apiKey, baseUrl, boundary, focusPoint} = geocoderConfig
  return {
    autocomplete: (query) => {
      return geocoderApi.autocomplete({
        apiKey,
        boundary,
        focusPoint,
        url: baseUrl ? `${baseUrl}/autocomplete` : undefined,
        ...query
      }).then(makeResponseRewriter(responseRewriters, 'autocomplete'))
    },
    reverse: (query) => {
      return geocoderApi.reverse({
        apiKey,
        format: true,
        url: baseUrl ? `${baseUrl}/reverse` : undefined,
        ...query
      }).then(makeResponseRewriter(responseRewriters, 'reverse'))
    },
    search: (query) => {
      return geocoderApi.search({
        apiKey,
        boundary,
        focusPoint,
        sources: null,
        url: baseUrl ? `${baseUrl}/search` : undefined,
        format: false, // keep as returned GeoJSON,
        ...query
      }).then(makeResponseRewriter(responseRewriters, 'search'))
    }
  }
}

const peliasResponseRewriters = {
  reverse: response => {
    const { 'point.lat': lat, 'point.lon': lon } = response.isomorphicMapzenSearchQuery
    return {
      lat,
      lon,
      name: response[0].address
    }
  }
}

export default memoize(geocoderConfig => {
  const {type} = geocoderConfig
  switch (type) {
    case 'ARCGIS':
      return makeGeocoder(arcgis, geocoderConfig)
    case 'PELIAS':
      return makeGeocoder(pelias, geocoderConfig, peliasResponseRewriters)
    default:
      throw new Error(`Invalid geocoder type: ${type}`)
  }
})

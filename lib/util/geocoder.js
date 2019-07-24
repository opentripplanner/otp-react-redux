import * as arcgis from '@conveyal/geocoder-arcgis-geojson'
import * as pelias from 'isomorphic-mapzen-search'
import memoize from 'lodash.memoize'

/**
 * Helper for creating a setting up a custom response rewrite function for a
 * certain api response.
 */
function makeResponseRewrite (rewrites, key) {
  return response => {
    if (rewrites && typeof rewrites[key] === 'function') {
      return rewrites[key](response)
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
function makeGeocoder (geocoderApi, geocoderConfig, responseRewrites) {
  const {apiKey, baseUrl, boundary, focusPoint} = geocoderConfig
  return {
    autocomplete: (query) => {
      return geocoderApi.autocomplete({
        apiKey,
        boundary,
        focusPoint,
        url: baseUrl ? `${baseUrl}/autocomplete` : undefined,
        ...query
      }).then(makeResponseRewrite(responseRewrites, 'autocomplete'))
    },
    reverse: (query) => {
      return geocoderApi.reverse({
        apiKey,
        format: true,
        url: baseUrl ? `${baseUrl}/reverse` : undefined,
        ...query
      }).then(makeResponseRewrite(responseRewrites, 'reverse'))
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
      }).then(makeResponseRewrite(responseRewrites, 'search'))
    }
  }
}

export default memoize(geocoderConfig => {
  const {type} = geocoderConfig
  switch (type) {
    case 'PELIAS':
      return makeGeocoder(pelias, geocoderConfig)
    case 'ARCGIS':
      return makeGeocoder(arcgis, geocoderConfig)
    default:
      throw new Error(`Invalid geocoder type: ${type}`)
  }
})

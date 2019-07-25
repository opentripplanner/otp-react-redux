import * as arcgis from '@conveyal/geocoder-arcgis-geojson'
import lonlat from '@conveyal/lonlat'
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
    autocomplete: query => {
      return geocoderApi.autocomplete({
        apiKey,
        boundary,
        focusPoint,
        url: baseUrl ? `${baseUrl}/autocomplete` : undefined,
        ...query
      }).then(makeResponseRewriter(responseRewriters, 'autocomplete'))
    },
    getLocationFromGeocodedFeature: feature => {
      if (responseRewriters.getLocationFromGeocodedFeature) {
        return responseRewriters.getLocationFromGeocodedFeature(feature)
      }
      return Promise.resolve(feature)
    },
    reverse: query => {
      return geocoderApi.reverse({
        apiKey,
        format: true,
        url: baseUrl ? `${baseUrl}/reverse` : undefined,
        ...query
      }).then(makeResponseRewriter(responseRewriters, 'reverse'))
    },
    search: query => {
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

const arcgisResponseRewriters = {
  autocomplete: response => {
    return {
      // remove any autocomplete results that are collections
      // (eg multiple Starbucks)
      features: response.features.filter(feature => !feature.isCollection)
        // add label property so location-field can handle things ok
        .map(feature => ({
          ...feature,
          properties: {
            label: feature.text
          }
        }))
    }
  },
  getLocationFromGeocodedFeature: feature => {
    return arcgis.search({ magicKey: feature.magicKey, text: feature.text })
      .then(response => {
        const feature = response.features[0]
        const location = lonlat.fromCoordinates(feature.geometry.coordinates)
        location.name = feature.properties.label
        return location
      })
  },
  reverse: response => {
    const { features, query } = response
    const { lat, lon } = query
    return {
      lat,
      lon,
      name: features[0].properties.label
    }
  }
}

const peliasResponseRewriters = {
  getLocationFromGeocodedFeature: feature => {
    const location = lonlat.fromCoordinates(feature.geometry.coordinates)
    location.name = feature.properties.label
    return Promise.resolve(location)
  },
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
      return makeGeocoder(arcgis, geocoderConfig, arcgisResponseRewriters)
    case 'PELIAS':
      return makeGeocoder(pelias, geocoderConfig, peliasResponseRewriters)
    default:
      throw new Error(`Invalid geocoder type: ${type}`)
  }
})

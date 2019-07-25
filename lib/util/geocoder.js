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
 * Create customized geocoder functions given a certain geocoding API, the
 * config for the geocoder and response rewrite functions specific to this
 * application. Any geocoder api that is added is expected to have an API that
 * behaves very closely to https://github.com/conveyal/isomorphic-mapzen-search
 */
function makeGeocoder (geocoderApi, geocoderConfig, responseRewriters) {
  const {apiKey, baseUrl, boundary, focusPoint} = geocoderConfig
  return {
    /**
     * Perform an autocomplete query. Eg, using partial text of a possible
     * address or POI, attempt to find possible matches.
     */
    autocomplete: query => {
      return geocoderApi.autocomplete({
        apiKey,
        boundary,
        focusPoint,
        url: baseUrl ? `${baseUrl}/autocomplete` : undefined,
        ...query
      }).then(makeResponseRewriter(responseRewriters, 'autocomplete'))
    },
    /**
     * Get an application-specific data structure from a given feature. The
     * feature is either the result of an autocomplete or a search query. This
     * function returns a Promise because sometimes an asynchronous action
     * needs to be taken to translate a feature into a location. For example,
     * the ArcGIS autocomplete service returns results that lack full address
     * data and GPS and it is expected that an extra call to the `search` API is
     * done to obtain that detailed data.
     */
    getLocationFromGeocodedFeature: feature => {
      if (responseRewriters.getLocationFromGeocodedFeature) {
        return responseRewriters.getLocationFromGeocodedFeature(feature)
      }
      return Promise.resolve(feature)
    },
    /**
     * Do a reverse-geocode. ie get address information and attributes given a
     * GPS coordiante.
     */
    reverse: query => {
      return geocoderApi.reverse({
        apiKey,
        format: true,
        url: baseUrl ? `${baseUrl}/reverse` : undefined,
        ...query
      }).then(makeResponseRewriter(responseRewriters, 'reverse'))
    },
    /**
     * Perform a search query. This query assumes that the text being searched
     * is more-or-less an exact address or POI.
     */
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

//ArcGIS-specific response rewriters
const arcgisResponseRewriters = {
  /**
   * Rewrite an autocomplete response into an application specific data format.
   * Also, filter out any results that are collections.
   */
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
  /**
   * Using the given magicKey and text, perform a search query to get detailed
   * address and GPS data.
   */
  getLocationFromGeocodedFeature: feature => {
    return arcgis.search({ magicKey: feature.magicKey, text: feature.text })
      .then(response => {
        const feature = response.features[0]
        const location = lonlat.fromCoordinates(feature.geometry.coordinates)
        location.name = feature.properties.label
        return location
      })
  },
  /**
   * Rewrite the response into an application-specific data format using the
   * first feature returned from the geocoder.
   */
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
  /**
   * Translate the given feature into an application-specific data format.
   */
  getLocationFromGeocodedFeature: feature => {
    const location = lonlat.fromCoordinates(feature.geometry.coordinates)
    location.name = feature.properties.label
    return Promise.resolve(location)
  },
  /**
   * Rewrite the response into an application-specific data format using the
   * first feature returned from the geocoder.
   */
  reverse: response => {
    const { 'point.lat': lat, 'point.lon': lon } = response.isomorphicMapzenSearchQuery
    return {
      lat,
      lon,
      name: response[0].address
    }
  }
}

/**
 * Create a memoized getter to avoid recreating new geocoders each time.
 */
const getGeocoder = memoize(geocoderConfig => {
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

export default getGeocoder

import * as arcgis from '@conveyal/geocoder-arcgis-geojson'
import lonlat from '@conveyal/lonlat'
import * as pelias from 'isomorphic-mapzen-search'
import memoize from 'lodash.memoize'

/**
 * Create customized geocoder functions given a certain geocoding API, the
 * config for the geocoder and response rewrite functions specific to this
 * application. Any geocoder api that is added is expected to have an API that
 * behaves very closely to https://github.com/conveyal/isomorphic-mapzen-search
 */
class Geocoder {
  constructor (geocoderApi, geocoderConfig) {
    this.api = geocoderApi
    this.geocoderConfig = geocoderConfig
  }

  /**
   * Perform an autocomplete query. Eg, using partial text of a possible
   * address or POI, attempt to find possible matches.
   */
  autocomplete (query) {
    return this.api.autocomplete(this.getAutocompleteQuery(query))
      .then(this.rewriteAutocompleteResponse)
  }

  /**
   * Get an application-specific data structure from a given feature. The
   * feature is either the result of an autocomplete or a search query. This
   * function returns a Promise because sometimes an asynchronous action
   * needs to be taken to translate a feature into a location. For example,
   * the ArcGIS autocomplete service returns results that lack full address
   * data and GPS and it is expected that an extra call to the `search` API is
   * done to obtain that detailed data.
   */
  getLocationFromGeocodedFeature (feature) {
    const location = lonlat.fromCoordinates(feature.geometry.coordinates)
    location.name = feature.properties.label
    return Promise.resolve(location)
  }

  /**
   * Do a reverse-geocode. ie get address information and attributes given a
   * GPS coordiante.
   */
  reverse (query) {
    return this.api.reverse(this.getReverseQuery(query))
      .then(this.rewriteReverseResponse)
  }

  /**
   * Perform a search query. A search query is different from autocomplete in
   * that it is assumed that the text provided is more or less a complete
   * well-fromatted address.
   */
  search (query) {
    return this.api.search(this.getSearchQuery(query))
      .then(this.rewriteSearchResponse)
  }

  /**
   * Default autocomplete query generator
   */
  getAutocompleteQuery (query) {
    const {apiKey, baseUrl, boundary, options, focusPoint} = this.geocoderConfig
    return {
      apiKey,
      boundary,
      focusPoint,
      options,
      url: baseUrl ? `${baseUrl}/autocomplete` : undefined,
      ...query
    }
  }

  /**
   * Default reverse query generator
   */
  getReverseQuery (query) {
    const {apiKey, baseUrl, options} = this.geocoderConfig
    return {
      apiKey,
      format: true,
      options,
      url: baseUrl ? `${baseUrl}/reverse` : undefined,
      ...query
    }
  }

  /**
   * Default search query generator.
   */
  getSearchQuery (query) {
    const {apiKey, baseUrl, boundary, focusPoint, options} = this.geocoderConfig
    return {
      apiKey,
      boundary,
      focusPoint,
      options,
      url: baseUrl ? `${baseUrl}/search` : undefined,
      format: false, // keep as returned GeoJSON,
      ...query
    }
  }

  /**
   * Default rewriter for autocomplete responses
   */
  rewriteAutocompleteResponse (response) { return response }

  /**
   * Default rewriter for reverse responses
   */
  rewriteReverseResponse (response) { return response }

  /**
   * Default rewriter for search responses
   */
  rewriteSearchResponse (response) { return response }
}

/**
 * Geocoder implementation for the ArcGIS geocoder.
 * See https://developers.arcgis.com/rest/geocode/api-reference/overview-world-geocoding-service.htm
 *
 * @extends Geocoder
 */
class ArcGISGeocoder extends Geocoder {
  /**
   * Using the given magicKey and text, perform a search query to get detailed
   * address and GPS data. Return data in an application-specific location
   * format.
   */
  getLocationFromGeocodedFeature (feature) {
    return this.api.search({ magicKey: feature.magicKey, text: feature.text })
      .then(response => {
        const feature = response.features[0]
        const location = lonlat.fromCoordinates(feature.geometry.coordinates)
        location.name = feature.properties.label
        return location
      })
  }

  /**
   * Rewrite an autocomplete response into an application specific data format.
   * Also, filter out any results that are collections.
   */
  rewriteAutocompleteResponse (response) {
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
  }

  /**
   * Rewrite the response into an application-specific data format using the
   * first feature returned from the geocoder.
   */
  rewriteReverseResponse (response) {
    const { features, query } = response
    const { lat, lon } = query
    return {
      lat,
      lon,
      name: features[0].properties.label
    }
  }
}

/**
 * An implementation that doesn't use an API for geocoding. Merely allows
 * clicking on the map and finding GPS coordinates by typing them in.
 *
 * @extends Geocoder
 */
class NoApiGeocoder extends Geocoder {
  /**
   * Use coordinate string parser.
   */
  autocomplete (query) {
    return this.parseCoordinateString(query.text)
  }

  /**
   * Always return the lat/lon.
   */
  reverse (query) {
    let { lat, lon } = query.point
    lat = this.roundGPSDecimal(lat)
    lon = this.roundGPSDecimal(lon)
    return Promise.resolve({ lat, lon, name: `${lat}, ${lon}` })
  }

  /**
   * Use coordinate string parser.
   */
  search (query) {
    return this.parseCoordinateString(query.text)
  }

  /**
   * Attempt to parse the input as a GPS coordinate. If parseable, return a
   * feature.
   */
  parseCoordinateString (string) {
    let feature
    try {
      feature = {
        geometry: {
          coordinates: lonlat.toCoordinates(lonlat.fromLatFirstString(string)),
          type: 'Point'
        },
        properties: {
          label: string
        }
      }
    } catch (e) {
      return Promise.resolve({ features: [] })
    }
    return Promise.resolve({ features: [feature] })
  }

  roundGPSDecimal (number) {
    const roundFactor = 100000
    return Math.round(number * roundFactor) / roundFactor
  }
}

/**
 * Geocoder implementation for the Pelias geocoder.
 * See https://pelias.io
 *
 * This is exported for testing purposes only.
 *
 * @extends Geocoder
 */
export class PeliasGeocoder extends Geocoder {
  /**
   * Generate an autocomplete query specifically for the Pelias API. The
   * `sources` parameter is a Pelias-specific option.
   */
  getAutocompleteQuery (query) {
    const {apiKey, baseUrl, boundary, focusPoint, options, sources} = this.geocoderConfig
    return {
      apiKey,
      boundary,
      focusPoint,
      options,
      // explicitly send over null for sources if provided sources is not truthy
      // in order to avoid default isomorphic-mapzen-search sources form being
      // applied
      sources: sources || null,
      url: baseUrl ? `${baseUrl}/autocomplete` : undefined,
      ...query
    }
  }

  /**
   * Generate a search query specifically for the Pelias API. The
   * `sources` parameter is a Pelias-specific option.
   */
  getSearchQuery (query) {
    const {apiKey, baseUrl, boundary, focusPoint, options, sources} = this.geocoderConfig
    return {
      apiKey,
      boundary,
      focusPoint,
      // explicitly send over null for sources if provided sources is not truthy
      // in order to avoid default isomorphic-mapzen-search sources form being
      // applied
      options,
      sources: sources || null,
      url: baseUrl ? `${baseUrl}/search` : undefined,
      format: false, // keep as returned GeoJSON,
      ...query
    }
  }

  /**
   * Rewrite the response into an application-specific data format using the
   * first feature returned from the geocoder.
   */
  rewriteReverseResponse (response) {
    const { 'point.lat': lat, 'point.lon': lon } = response.isomorphicMapzenSearchQuery
    return {
      lat,
      lon,
      name: response[0].address
    }
  }
}

// Create a memoized getter to avoid recreating new geocoders each time.
const getGeocoder = memoize(geocoderConfig => {
  if (!geocoderConfig || !geocoderConfig.type) {
    return new NoApiGeocoder()
  }
  const {type} = geocoderConfig
  switch (type) {
    case 'ARCGIS':
      return new ArcGISGeocoder(arcgis, geocoderConfig)
    case 'PELIAS':
      return new PeliasGeocoder(pelias, geocoderConfig)
    default:
      console.error(`Unkown geocoder type: "${type}". Using NoApiGeocoder.`)
      return new NoApiGeocoder()
  }
})

export default getGeocoder

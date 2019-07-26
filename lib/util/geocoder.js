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
    const {apiKey, baseUrl, boundary, focusPoint} = this.geocoderConfig
    return this.api.autocomplete({
      apiKey,
      boundary,
      focusPoint,
      url: baseUrl ? `${baseUrl}/autocomplete` : undefined,
      ...query
    }).then(this._rewriteAutocompleteResponse)
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
    const {apiKey, baseUrl} = this.geocoderConfig
    return this.api.reverse({
      apiKey,
      format: true,
      url: baseUrl ? `${baseUrl}/reverse` : undefined,
      ...query
    }).then(this._rewriteReverseResponse)
  }

  /**
   * Perform a search query. This query assumes that the text being searched
   * is more-or-less an exact address or POI.
   */
  search (query) {
    const {apiKey, baseUrl, boundary, focusPoint} = this.geocoderConfig
    return this.api.search({
      apiKey,
      boundary,
      focusPoint,
      sources: null,
      url: baseUrl ? `${baseUrl}/search` : undefined,
      format: false, // keep as returned GeoJSON,
      ...query
    }).then(this._rewriteSearchResponse)
  }

  /**
   * Default rewriter for autocomplete responses
   */
  _rewriteAutocompleteResponse (response) { return response }

  /**
   * Default rewriter for reverse responses
   */
  _rewriteReverseResponse (response) { return response }

  /**
   * Default rewriter for search responses
   */
  _rewriteSearchResponse (response) { return response }
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
  _rewriteAutocompleteResponse (response) {
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
  _rewriteReverseResponse (response) {
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
    return this._parseCoordinateString(query.text)
  }

  /**
   * Always return the lat/lon.
   */
  reverse (query) {
    let { lat, lon } = query.point
    lat = this._roundGPSDecimal(lat)
    lon = this._roundGPSDecimal(lon)
    return Promise.resolve({ lat, lon, name: `${lat}, ${lon}` })
  }

  /**
   * Use coordinate string parser.
   */
  search (query) {
    return this._parseCoordinateString(query.text)
  }

  /**
   * Attempt to parse the input as a GPS coordinate. If parseable, return a
   * feature.
   */
  _parseCoordinateString (string) {
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

  _roundGPSDecimal (number) {
    const roundFactor = 100000
    return Math.round(number * roundFactor) / roundFactor
  }
}

/**
 * Geocoder implementation for the Pelias geocoder.
 * See https://pelias.io
 *
 * @extends Geocoder
 */
class PeliasGeocoder extends Geocoder {
  /**
   * Rewrite the response into an application-specific data format using the
   * first feature returned from the geocoder.
   */
  _rewriteReverseResponse (response) {
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

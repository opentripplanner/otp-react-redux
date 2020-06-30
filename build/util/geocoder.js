"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PeliasGeocoder = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.regexp.search");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.function.name");

var arcgis = _interopRequireWildcard(require("@conveyal/geocoder-arcgis-geojson"));

var _lonlat = _interopRequireDefault(require("@conveyal/lonlat"));

var pelias = _interopRequireWildcard(require("isomorphic-mapzen-search"));

var _lodash = _interopRequireDefault(require("lodash.memoize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Create customized geocoder functions given a certain geocoding API, the
 * config for the geocoder and response rewrite functions specific to this
 * application. Any geocoder api that is added is expected to have an API that
 * behaves very closely to https://github.com/conveyal/isomorphic-mapzen-search
 */
var Geocoder =
/*#__PURE__*/
function () {
  function Geocoder(geocoderApi, geocoderConfig) {
    _classCallCheck(this, Geocoder);

    this.api = geocoderApi;
    this.geocoderConfig = geocoderConfig;
  }
  /**
   * Perform an autocomplete query. Eg, using partial text of a possible
   * address or POI, attempt to find possible matches.
   */


  _createClass(Geocoder, [{
    key: "autocomplete",
    value: function autocomplete(query) {
      return this.api.autocomplete(this.getAutocompleteQuery(query)).then(this.rewriteAutocompleteResponse);
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

  }, {
    key: "getLocationFromGeocodedFeature",
    value: function getLocationFromGeocodedFeature(feature) {
      var location = _lonlat.default.fromCoordinates(feature.geometry.coordinates);

      location.name = feature.properties.label;
      return Promise.resolve(location);
    }
    /**
     * Do a reverse-geocode. ie get address information and attributes given a
     * GPS coordiante.
     */

  }, {
    key: "reverse",
    value: function reverse(query) {
      return this.api.reverse(this.getReverseQuery(query)).then(this.rewriteReverseResponse);
    }
    /**
     * Perform a search query. A search query is different from autocomplete in
     * that it is assumed that the text provided is more or less a complete
     * well-fromatted address.
     */

  }, {
    key: "search",
    value: function search(query) {
      return this.api.search(this.getSearchQuery(query)).then(this.rewriteSearchResponse);
    }
    /**
     * Default autocomplete query generator
     */

  }, {
    key: "getAutocompleteQuery",
    value: function getAutocompleteQuery(query) {
      var _this$geocoderConfig = this.geocoderConfig,
          apiKey = _this$geocoderConfig.apiKey,
          baseUrl = _this$geocoderConfig.baseUrl,
          boundary = _this$geocoderConfig.boundary,
          options = _this$geocoderConfig.options,
          focusPoint = _this$geocoderConfig.focusPoint;
      return _objectSpread({
        apiKey: apiKey,
        boundary: boundary,
        focusPoint: focusPoint,
        options: options,
        url: baseUrl ? "".concat(baseUrl, "/autocomplete") : undefined
      }, query);
    }
    /**
     * Default reverse query generator
     */

  }, {
    key: "getReverseQuery",
    value: function getReverseQuery(query) {
      var _this$geocoderConfig2 = this.geocoderConfig,
          apiKey = _this$geocoderConfig2.apiKey,
          baseUrl = _this$geocoderConfig2.baseUrl,
          options = _this$geocoderConfig2.options;
      return _objectSpread({
        apiKey: apiKey,
        format: true,
        options: options,
        url: baseUrl ? "".concat(baseUrl, "/reverse") : undefined
      }, query);
    }
    /**
     * Default search query generator.
     */

  }, {
    key: "getSearchQuery",
    value: function getSearchQuery(query) {
      var _this$geocoderConfig3 = this.geocoderConfig,
          apiKey = _this$geocoderConfig3.apiKey,
          baseUrl = _this$geocoderConfig3.baseUrl,
          boundary = _this$geocoderConfig3.boundary,
          focusPoint = _this$geocoderConfig3.focusPoint,
          options = _this$geocoderConfig3.options;
      return _objectSpread({
        apiKey: apiKey,
        boundary: boundary,
        focusPoint: focusPoint,
        options: options,
        url: baseUrl ? "".concat(baseUrl, "/search") : undefined,
        format: false
      }, query);
    }
    /**
     * Default rewriter for autocomplete responses
     */

  }, {
    key: "rewriteAutocompleteResponse",
    value: function rewriteAutocompleteResponse(response) {
      return response;
    }
    /**
     * Default rewriter for reverse responses
     */

  }, {
    key: "rewriteReverseResponse",
    value: function rewriteReverseResponse(response) {
      return response;
    }
    /**
     * Default rewriter for search responses
     */

  }, {
    key: "rewriteSearchResponse",
    value: function rewriteSearchResponse(response) {
      return response;
    }
  }]);

  return Geocoder;
}();
/**
 * Geocoder implementation for the ArcGIS geocoder.
 * See https://developers.arcgis.com/rest/geocode/api-reference/overview-world-geocoding-service.htm
 *
 * @extends Geocoder
 */


var ArcGISGeocoder =
/*#__PURE__*/
function (_Geocoder) {
  _inherits(ArcGISGeocoder, _Geocoder);

  function ArcGISGeocoder() {
    _classCallCheck(this, ArcGISGeocoder);

    return _possibleConstructorReturn(this, _getPrototypeOf(ArcGISGeocoder).apply(this, arguments));
  }

  _createClass(ArcGISGeocoder, [{
    key: "getLocationFromGeocodedFeature",

    /**
     * Using the given magicKey and text, perform a search query to get detailed
     * address and GPS data. Return data in an application-specific location
     * format.
     */
    value: function getLocationFromGeocodedFeature(feature) {
      return this.api.search({
        magicKey: feature.magicKey,
        text: feature.text
      }).then(function (response) {
        var feature = response.features[0];

        var location = _lonlat.default.fromCoordinates(feature.geometry.coordinates);

        location.name = feature.properties.label;
        return location;
      });
    }
    /**
     * Rewrite an autocomplete response into an application specific data format.
     * Also, filter out any results that are collections.
     */

  }, {
    key: "rewriteAutocompleteResponse",
    value: function rewriteAutocompleteResponse(response) {
      return {
        // remove any autocomplete results that are collections
        // (eg multiple Starbucks)
        features: response.features.filter(function (feature) {
          return !feature.isCollection;
        }) // add label property so location-field can handle things ok
        .map(function (feature) {
          return _objectSpread({}, feature, {
            properties: {
              label: feature.text
            }
          });
        })
      };
    }
    /**
     * Rewrite the response into an application-specific data format using the
     * first feature returned from the geocoder.
     */

  }, {
    key: "rewriteReverseResponse",
    value: function rewriteReverseResponse(response) {
      var features = response.features,
          query = response.query;
      var lat = query.lat,
          lon = query.lon;
      return {
        lat: lat,
        lon: lon,
        name: features[0].properties.label
      };
    }
  }]);

  return ArcGISGeocoder;
}(Geocoder);
/**
 * An implementation that doesn't use an API for geocoding. Merely allows
 * clicking on the map and finding GPS coordinates by typing them in.
 *
 * @extends Geocoder
 */


var NoApiGeocoder =
/*#__PURE__*/
function (_Geocoder2) {
  _inherits(NoApiGeocoder, _Geocoder2);

  function NoApiGeocoder() {
    _classCallCheck(this, NoApiGeocoder);

    return _possibleConstructorReturn(this, _getPrototypeOf(NoApiGeocoder).apply(this, arguments));
  }

  _createClass(NoApiGeocoder, [{
    key: "autocomplete",

    /**
     * Use coordinate string parser.
     */
    value: function autocomplete(query) {
      return this.parseCoordinateString(query.text);
    }
    /**
     * Always return the lat/lon.
     */

  }, {
    key: "reverse",
    value: function reverse(query) {
      var _query$point = query.point,
          lat = _query$point.lat,
          lon = _query$point.lon;
      lat = this.roundGPSDecimal(lat);
      lon = this.roundGPSDecimal(lon);
      return Promise.resolve({
        lat: lat,
        lon: lon,
        name: "".concat(lat, ", ").concat(lon)
      });
    }
    /**
     * Use coordinate string parser.
     */

  }, {
    key: "search",
    value: function search(query) {
      return this.parseCoordinateString(query.text);
    }
    /**
     * Attempt to parse the input as a GPS coordinate. If parseable, return a
     * feature.
     */

  }, {
    key: "parseCoordinateString",
    value: function parseCoordinateString(string) {
      var feature;

      try {
        feature = {
          geometry: {
            coordinates: _lonlat.default.toCoordinates(_lonlat.default.fromLatFirstString(string)),
            type: 'Point'
          },
          properties: {
            label: string
          }
        };
      } catch (e) {
        return Promise.resolve({
          features: []
        });
      }

      return Promise.resolve({
        features: [feature]
      });
    }
  }, {
    key: "roundGPSDecimal",
    value: function roundGPSDecimal(number) {
      var roundFactor = 100000;
      return Math.round(number * roundFactor) / roundFactor;
    }
  }]);

  return NoApiGeocoder;
}(Geocoder);
/**
 * Geocoder implementation for the Pelias geocoder.
 * See https://pelias.io
 *
 * This is exported for testing purposes only.
 *
 * @extends Geocoder
 */


var PeliasGeocoder =
/*#__PURE__*/
function (_Geocoder3) {
  _inherits(PeliasGeocoder, _Geocoder3);

  function PeliasGeocoder() {
    _classCallCheck(this, PeliasGeocoder);

    return _possibleConstructorReturn(this, _getPrototypeOf(PeliasGeocoder).apply(this, arguments));
  }

  _createClass(PeliasGeocoder, [{
    key: "getAutocompleteQuery",

    /**
     * Generate an autocomplete query specifically for the Pelias API. The
     * `sources` parameter is a Pelias-specific option.
     */
    value: function getAutocompleteQuery(query) {
      var _this$geocoderConfig4 = this.geocoderConfig,
          apiKey = _this$geocoderConfig4.apiKey,
          baseUrl = _this$geocoderConfig4.baseUrl,
          boundary = _this$geocoderConfig4.boundary,
          focusPoint = _this$geocoderConfig4.focusPoint,
          options = _this$geocoderConfig4.options,
          sources = _this$geocoderConfig4.sources;
      return _objectSpread({
        apiKey: apiKey,
        boundary: boundary,
        focusPoint: focusPoint,
        options: options,
        // explicitly send over null for sources if provided sources is not truthy
        // in order to avoid default isomorphic-mapzen-search sources form being
        // applied
        sources: sources || null,
        url: baseUrl ? "".concat(baseUrl, "/autocomplete") : undefined
      }, query);
    }
    /**
     * Generate a search query specifically for the Pelias API. The
     * `sources` parameter is a Pelias-specific option.
     */

  }, {
    key: "getSearchQuery",
    value: function getSearchQuery(query) {
      var _this$geocoderConfig5 = this.geocoderConfig,
          apiKey = _this$geocoderConfig5.apiKey,
          baseUrl = _this$geocoderConfig5.baseUrl,
          boundary = _this$geocoderConfig5.boundary,
          focusPoint = _this$geocoderConfig5.focusPoint,
          options = _this$geocoderConfig5.options,
          sources = _this$geocoderConfig5.sources;
      return _objectSpread({
        apiKey: apiKey,
        boundary: boundary,
        focusPoint: focusPoint,
        // explicitly send over null for sources if provided sources is not truthy
        // in order to avoid default isomorphic-mapzen-search sources form being
        // applied
        options: options,
        sources: sources || null,
        url: baseUrl ? "".concat(baseUrl, "/search") : undefined,
        format: false
      }, query);
    }
    /**
     * Rewrite the response into an application-specific data format using the
     * first feature returned from the geocoder.
     */

  }, {
    key: "rewriteReverseResponse",
    value: function rewriteReverseResponse(response) {
      var _response$isomorphicM = response.isomorphicMapzenSearchQuery,
          lat = _response$isomorphicM['point.lat'],
          lon = _response$isomorphicM['point.lon'];
      return {
        lat: lat,
        lon: lon,
        name: response[0].address
      };
    }
  }]);

  return PeliasGeocoder;
}(Geocoder); // Create a memoized getter to avoid recreating new geocoders each time.


exports.PeliasGeocoder = PeliasGeocoder;
var getGeocoder = (0, _lodash.default)(function (geocoderConfig) {
  if (!geocoderConfig || !geocoderConfig.type) {
    return new NoApiGeocoder();
  }

  var type = geocoderConfig.type;

  switch (type) {
    case 'ARCGIS':
      return new ArcGISGeocoder(arcgis, geocoderConfig);

    case 'PELIAS':
      return new PeliasGeocoder(pelias, geocoderConfig);

    default:
      console.error("Unkown geocoder type: \"".concat(type, "\". Using NoApiGeocoder."));
      return new NoApiGeocoder();
  }
});
var _default = getGeocoder;
exports.default = _default;

//# sourceMappingURL=geocoder.js
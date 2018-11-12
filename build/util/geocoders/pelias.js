'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.reverse = reverse;

var _isomorphicMapzenSearch = require('isomorphic-mapzen-search');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function reverse(point, gcConfig) {
  var MAPZEN_KEY = gcConfig.MAPZEN_KEY,
      baseUrl = gcConfig.baseUrl;


  return new _promise2.default(function (resolve, reject) {
    (0, _isomorphicMapzenSearch.reverse)({
      apiKey: MAPZEN_KEY,
      point: point,
      format: true,
      url: baseUrl ? baseUrl + '/reverse' : null
    }).then(function (json) {
      resolve({
        lat: point.lat,
        lon: point.lon,
        name: json[0].address
      });
    }).catch(function (err) {
      reject(err);
    });
  });
}

//# sourceMappingURL=pelias.js
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reverse = reverse;

var _pelias = require('./geocoders/pelias');

var pelias = _interopRequireWildcard(_pelias);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function getGeocoder(gcConfig) {
  return pelias;
}

function reverse(point, gcConfig) {
  console.log('>>> in util/geocode reverse');
  return getGeocoder(gcConfig).reverse(point, gcConfig);
}

//# sourceMappingURL=geocode.js
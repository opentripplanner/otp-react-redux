'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = reverse;

var _pelias = require('./pelias');

var pelias = _interopRequireWildcard(_pelias);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function getGeocoder(gcConfig) {
  return pelias;
}

function reverse(point, gcConfig) {
  getGeocoder(gcConfig).reverse(point, gcConfig);
}
module.exports = exports['default'];

//# sourceMappingURL=index.js
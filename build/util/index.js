'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _distance = require('./distance');

var distance = _interopRequireWildcard(_distance);

var _geocode = require('./geocode');

var geocode = _interopRequireWildcard(_geocode);

var _itinerary = require('./itinerary');

var itinerary = _interopRequireWildcard(_itinerary);

var _map = require('./map');

var map = _interopRequireWildcard(_map);

var _profile = require('./profile');

var profile = _interopRequireWildcard(_profile);

var _query = require('./query');

var query = _interopRequireWildcard(_query);

var _reverse = require('./reverse');

var reverse = _interopRequireWildcard(_reverse);

var _state = require('./state');

var state = _interopRequireWildcard(_state);

var _time = require('./time');

var time = _interopRequireWildcard(_time);

var _ui = require('./ui');

var ui = _interopRequireWildcard(_ui);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var OtpUtils = {
  distance: distance,
  geocode: geocode,
  itinerary: itinerary,
  map: map,
  profile: profile,
  query: query,
  reverse: reverse,
  state: state,
  time: time,
  ui: ui
};

exports.default = OtpUtils;
module.exports = exports['default'];

//# sourceMappingURL=index.js
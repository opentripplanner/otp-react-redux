'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _bikeIcon = require('./bike-icon');

var _bikeIcon2 = _interopRequireDefault(_bikeIcon);

var _biketownIcon = require('./biketown-icon');

var _biketownIcon2 = _interopRequireDefault(_biketownIcon);

var _busIcon = require('./bus-icon');

var _busIcon2 = _interopRequireDefault(_busIcon);

var _car2goIcon = require('./car2go-icon');

var _car2goIcon2 = _interopRequireDefault(_car2goIcon);

var _reachnowIcon = require('./reachnow-icon');

var _reachnowIcon2 = _interopRequireDefault(_reachnowIcon);

var _gondolaIcon = require('./gondola-icon');

var _gondolaIcon2 = _interopRequireDefault(_gondolaIcon);

var _lyftIcon = require('./lyft-icon');

var _lyftIcon2 = _interopRequireDefault(_lyftIcon);

var _railIcon = require('./rail-icon');

var _railIcon2 = _interopRequireDefault(_railIcon);

var _streetcarIcon = require('./streetcar-icon');

var _streetcarIcon2 = _interopRequireDefault(_streetcarIcon);

var _tramIcon = require('./tram-icon');

var _tramIcon2 = _interopRequireDefault(_tramIcon);

var _transitIcon = require('./transit-icon');

var _transitIcon2 = _interopRequireDefault(_transitIcon);

var _uberIcon = require('./uber-icon');

var _uberIcon2 = _interopRequireDefault(_uberIcon);

var _walkIcon = require('./walk-icon');

var _walkIcon2 = _interopRequireDefault(_walkIcon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// define Portland-specific mode icons
exports.default = {
  BICYCLE: _react2.default.createElement(_bikeIcon2.default, null),
  BICYCLE_RENT: _react2.default.createElement(_biketownIcon2.default, null),
  BUS: _react2.default.createElement(_busIcon2.default, null),
  CAR_HAIL_LYFT: _react2.default.createElement(_lyftIcon2.default, null),
  CAR_HAIL_UBER: _react2.default.createElement(_uberIcon2.default, null),
  CAR_RENT_CAR2GO: _react2.default.createElement(_car2goIcon2.default, null),
  CAR_RENT_REACHNOW: _react2.default.createElement(_reachnowIcon2.default, null),
  GONDOLA: _react2.default.createElement(_gondolaIcon2.default, null),
  RAIL: _react2.default.createElement(_railIcon2.default, null),
  STREETCAR: _react2.default.createElement(_streetcarIcon2.default, null),
  TRAM: _react2.default.createElement(_tramIcon2.default, null),
  TRANSIT: _react2.default.createElement(_transitIcon2.default, null),
  WALK: _react2.default.createElement(_walkIcon2.default, null),
  customModeForLeg: function customModeForLeg(leg) {
    if (leg.routeLongName && leg.routeLongName.startsWith('Portland Streetcar')) return 'STREETCAR';
    return null;
  }
};
module.exports = exports['default'];

//# sourceMappingURL=index.js
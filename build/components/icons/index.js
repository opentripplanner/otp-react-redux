"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.string.starts-with");

var _react = _interopRequireDefault(require("react"));

var _bikeIcon = _interopRequireDefault(require("./bike-icon"));

var _biketownIcon = _interopRequireDefault(require("./biketown-icon"));

var _busIcon = _interopRequireDefault(require("./bus-icon"));

var _car2goIcon = _interopRequireDefault(require("./car2go-icon"));

var _reachnowIcon = _interopRequireDefault(require("./reachnow-icon"));

var _gondolaIcon = _interopRequireDefault(require("./gondola-icon"));

var _lyftIcon = _interopRequireDefault(require("./lyft-icon"));

var _railIcon = _interopRequireDefault(require("./rail-icon"));

var _streetcarIcon = _interopRequireDefault(require("./streetcar-icon"));

var _tramIcon = _interopRequireDefault(require("./tram-icon"));

var _transitIcon = _interopRequireDefault(require("./transit-icon"));

var _uberIcon = _interopRequireDefault(require("./uber-icon"));

var _walkIcon = _interopRequireDefault(require("./walk-icon"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// define Portland-specific mode icons
var _default = {
  BICYCLE: _react.default.createElement(_bikeIcon.default, null),
  BICYCLE_RENT: _react.default.createElement(_biketownIcon.default, null),
  BUS: _react.default.createElement(_busIcon.default, null),
  CAR_HAIL_LYFT: _react.default.createElement(_lyftIcon.default, null),
  CAR_HAIL_UBER: _react.default.createElement(_uberIcon.default, null),
  CAR_RENT_CAR2GO: _react.default.createElement(_car2goIcon.default, null),
  CAR_RENT_REACHNOW: _react.default.createElement(_reachnowIcon.default, null),
  GONDOLA: _react.default.createElement(_gondolaIcon.default, null),
  RAIL: _react.default.createElement(_railIcon.default, null),
  STREETCAR: _react.default.createElement(_streetcarIcon.default, null),
  TRAM: _react.default.createElement(_tramIcon.default, null),
  TRANSIT: _react.default.createElement(_transitIcon.default, null),
  WALK: _react.default.createElement(_walkIcon.default, null),
  customModeForLeg: function customModeForLeg(leg) {
    if (leg.routeLongName && leg.routeLongName.startsWith('Portland Streetcar')) return 'STREETCAR';
    return null;
  }
};
exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=index.js
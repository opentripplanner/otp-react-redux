"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.object.freeze");

var _coreUtils = _interopRequireDefault(require("@opentripplanner/core-utils"));

var _tripDetails = _interopRequireDefault(require("@opentripplanner/trip-details"));

var _reactRedux = require("react-redux");

var _styledComponents = _interopRequireDefault(require("styled-components"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  b {\n    font-weight: 600;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var TripDetails = (0, _styledComponents.default)(_tripDetails.default)(_templateObject()); // Connect imported TripDetails class to redux store.

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    routingType: state.otp.currentQuery.routingType,
    tnc: state.otp.tnc,
    timeFormat: _coreUtils.default.time.getTimeFormat(state.otp.config),
    longDateFormat: _coreUtils.default.time.getLongDateFormat(state.otp.config)
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps)(TripDetails);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=connected-trip-details.js
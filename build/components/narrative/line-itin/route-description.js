"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = RouteDescription;

require("core-js/modules/es6.object.freeze");

var _react = _interopRequireDefault(require("react"));

var _trimetLegIcon = _interopRequireDefault(require("@opentripplanner/icons/lib/trimet-leg-icon"));

var ItineraryBodyClasses = _interopRequireWildcard(require("@opentripplanner/itinerary-body/lib/styled"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  float: left;\n  height: 24px;\n  margin-right: 6px;\n  width: 24px;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var TriMetLegIconContainer = _styledComponents.default.div(_templateObject());

function RouteDescription(_ref) {
  var leg = _ref.leg;
  var headsign = leg.headsign,
      routeLongName = leg.routeLongName,
      routeShortName = leg.routeShortName;
  return _react.default.createElement(ItineraryBodyClasses.LegDescriptionForTransit, null, _react.default.createElement(TriMetLegIconContainer, null, _react.default.createElement(_trimetLegIcon.default, {
    leg: leg
  })), routeShortName && _react.default.createElement("div", null, _react.default.createElement(ItineraryBodyClasses.LegDescriptionRouteShortName, null, routeShortName)), _react.default.createElement(ItineraryBodyClasses.LegDescriptionRouteLongName, null, routeLongName, headsign && _react.default.createElement("span", null, ' ', _react.default.createElement(ItineraryBodyClasses.LegDescriptionHeadsignPrefix, null, "to"), ' ', headsign)));
}

module.exports = exports.default;

//# sourceMappingURL=route-description.js
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MapPopup;

require("core-js/modules/es6.object.freeze");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.regexp.split");

var _react = _interopRequireDefault(require("react"));

var _fromToLocationPicker = _interopRequireDefault(require("@opentripplanner/from-to-location-picker"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _templateObject2() {
  var data = _taggedTemplateLiteral(["\n  font-size: 14px;\n  margin-bottom: 6px;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  width: 240px;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var PopupContainer = _styledComponents.default.div(_templateObject());

var PopupTitle = _styledComponents.default.div(_templateObject2());

function MapPopup(_ref) {
  var mapPopupLocation = _ref.mapPopupLocation,
      onSetLocationFromPopup = _ref.onSetLocationFromPopup;
  return _react.default.createElement(PopupContainer, null, _react.default.createElement(PopupTitle, null, mapPopupLocation.name.split(',').length > 3 ? mapPopupLocation.name.split(',').splice(0, 3).join(',') : mapPopupLocation.name), _react.default.createElement("div", null, "Plan a trip:", _react.default.createElement(_fromToLocationPicker.default, {
    location: mapPopupLocation,
    setLocation: onSetLocationFromPopup
  })));
}

module.exports = exports.default;

//# sourceMappingURL=point-popup.js
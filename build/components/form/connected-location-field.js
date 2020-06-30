"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.freeze");

var _locationField = _interopRequireDefault(require("@opentripplanner/location-field"));

var _styled = require("@opentripplanner/location-field/lib/styled");

var _reactRedux = require("react-redux");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _map = require("../../actions/map");

var _location = require("../../actions/location");

var _api = require("../../actions/api");

var _state = require("../../util/state");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  width: 100%;\n\n  ", " {\n    display: table-cell;\n    vertical-align: middle;\n    width: 1%;\n  }\n\n  ", " {\n    display: table;\n    padding: 6px 12px;\n    width: 100%;\n  }\n\n  ", " {\n    display: table-cell;\n    padding: 6px 12px;\n    width: 100%;\n  }\n\n  ", " {\n    width: 100%;\n  }\n\n  ", " {\n    display: table-cell;\n    vertical-align: middle;\n    width: 1%;\n  }\n\n  ", " {\n    text-decoration: none;\n  }\n\n  ", ":hover {\n    color: #333;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var StyledLocationField = (0, _styledComponents.default)(_locationField.default)(_templateObject(), _styled.DropdownContainer, _styled.FormGroup, _styled.Input, _styled.InputGroup, _styled.InputGroupAddon, _styled.MenuItemA, _styled.MenuItemA); // connect to redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var _state$otp = state.otp,
      config = _state$otp.config,
      currentQuery = _state$otp.currentQuery,
      location = _state$otp.location,
      transitIndex = _state$otp.transitIndex,
      user = _state$otp.user;
  var currentPosition = location.currentPosition,
      nearbyStops = location.nearbyStops,
      sessionSearches = location.sessionSearches;
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  var query = activeSearch ? activeSearch.query : currentQuery;
  return {
    currentPosition: currentPosition,
    geocoderConfig: config.geocoder,
    location: query[ownProps.locationType],
    nearbyStops: nearbyStops,
    sessionSearches: sessionSearches,
    showUserSettings: (0, _state.getShowUserSettings)(state.otp),
    stopsIndex: transitIndex.stops,
    userLocationsAndRecentPlaces: [].concat(_toConsumableArray(user.locations), _toConsumableArray(user.recentPlaces))
  };
};

var mapDispatchToProps = {
  addLocationSearch: _location.addLocationSearch,
  findNearbyStops: _api.findNearbyStops,
  getCurrentPosition: _location.getCurrentPosition,
  onLocationSelected: _map.onLocationSelected,
  clearLocation: _map.clearLocation
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(StyledLocationField);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=connected-location-field.js
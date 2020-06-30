"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _endpointsOverlay = _interopRequireDefault(require("@opentripplanner/endpoints-overlay"));

var _reactRedux = require("react-redux");

var _map = require("../../actions/map");

var _state = require("../../util/state");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// connect to the redux store
var mapStateToProps = function mapStateToProps(state, ownProps) {
  // Use query from active search (if a search has been made) or default to
  // current query is no search is available.
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  var query = activeSearch ? activeSearch.query : state.otp.currentQuery;
  var showUserSettings = (0, _state.getShowUserSettings)(state.otp);
  var from = query.from,
      to = query.to;
  return {
    fromLocation: from,
    locations: state.otp.user.locations,
    showUserSettings: showUserSettings,
    toLocation: to,
    visible: true
  };
};

var mapDispatchToProps = {
  forgetPlace: _map.forgetPlace,
  rememberPlace: _map.rememberPlace,
  setLocation: _map.setLocation,
  clearLocation: _map.clearLocation
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(_endpointsOverlay.default);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=connected-endpoints-overlay.js
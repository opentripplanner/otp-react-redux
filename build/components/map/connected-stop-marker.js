"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _stopMarker = _interopRequireDefault(require("@opentripplanner/stops-overlay/lib/stop-marker"));

var _reactRedux = require("react-redux");

var _map = require("../../actions/map");

var _ui = require("../../actions/ui");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// connect to the redux store
var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    languageConfig: state.otp.config.language
  };
};

var mapDispatchToProps = {
  setLocation: _map.setLocation,
  setViewedStop: _ui.setViewedStop
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(_stopMarker.default);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=connected-stop-marker.js
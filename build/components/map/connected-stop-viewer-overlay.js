"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _stopViewerOverlay = _interopRequireDefault(require("@opentripplanner/stop-viewer-overlay"));

var _defaultStopMarker = _interopRequireDefault(require("@opentripplanner/stop-viewer-overlay/lib/default-stop-marker"));

var _reactRedux = require("react-redux");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// connect to the redux store
var mapStateToProps = function mapStateToProps(state, ownProps) {
  var viewedStop = state.otp.ui.viewedStop;
  return {
    stop: viewedStop ? state.otp.transitIndex.stops[viewedStop.stopId] : null,
    StopMarker: _defaultStopMarker.default
  };
};

var mapDispatchToProps = {};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(_stopViewerOverlay.default);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=connected-stop-viewer-overlay.js
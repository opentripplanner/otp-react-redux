"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _routeViewerOverlay = _interopRequireDefault(require("@opentripplanner/route-viewer-overlay"));

var _reactRedux = require("react-redux");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// connect to the redux store
var mapStateToProps = function mapStateToProps(state, ownProps) {
  var viewedRoute = state.otp.ui.viewedRoute;
  return {
    routeData: viewedRoute && state.otp.transitIndex.routes ? state.otp.transitIndex.routes[viewedRoute.routeId] : null
  };
};

var mapDispatchToProps = {};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(_routeViewerOverlay.default);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=connected-route-viewer-overlay.js
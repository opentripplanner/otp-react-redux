"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _tripViewerOverlay = _interopRequireDefault(require("@opentripplanner/trip-viewer-overlay"));

var _reactRedux = require("react-redux");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// connect to the redux store
var mapStateToProps = function mapStateToProps(state, ownProps) {
  var viewedTrip = state.otp.ui.viewedTrip;
  return {
    tripData: viewedTrip ? state.otp.transitIndex.trips[viewedTrip.tripId] : null
  };
};

var mapDispatchToProps = {};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(_tripViewerOverlay.default);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=connected-trip-viewer-overlay.js
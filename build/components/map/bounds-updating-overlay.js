"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _lodash = _interopRequireDefault(require("lodash.isequal"));

var _coreUtils = _interopRequireDefault(require("@opentripplanner/core-utils"));

var _reactLeaflet = require("react-leaflet");

var _reactRedux = require("react-redux");

var _itinerary = require("../../util/itinerary");

var _state = require("../../util/state");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * This MapLayer component will automatically update the leaflet bounds
 * depending on what data is in the redux store. This component does not
 * "render" anything on the map.
 */
var BoundsUpdatingOverlay =
/*#__PURE__*/
function (_MapLayer) {
  _inherits(BoundsUpdatingOverlay, _MapLayer);

  function BoundsUpdatingOverlay() {
    _classCallCheck(this, BoundsUpdatingOverlay);

    return _possibleConstructorReturn(this, _getPrototypeOf(BoundsUpdatingOverlay).apply(this, arguments));
  }

  _createClass(BoundsUpdatingOverlay, [{
    key: "createLeafletElement",
    value: function createLeafletElement() {}
  }, {
    key: "updateLeafletElement",
    value: function updateLeafletElement() {}
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.updateBounds(null, this.props);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      this.updateBounds(prevProps, this.props);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {}
    /* eslint-disable-next-line complexity */

  }, {
    key: "updateBounds",
    value: function updateBounds(oldProps, newProps) {
      // TODO: maybe setting bounds ought to be handled in map props...
      oldProps = oldProps || {};
      newProps = newProps || {}; // Don't auto-fit if popup us active

      if (oldProps.popupLocation || newProps.popupLocation) return;
      var map = newProps.leaflet.map;
      if (!map) return;
      var padding = [30, 30]; // Fit map to to entire itinerary if active itinerary bounds changed

      var newFrom = newProps.query && newProps.query.from;
      var newItinBounds = newProps.itinerary && (0, _itinerary.getLeafletItineraryBounds)(newProps.itinerary);
      var newTo = newProps.query && newProps.query.to;
      var oldFrom = oldProps.query && oldProps.query.from;
      var oldItinBounds = oldProps.itinerary && (0, _itinerary.getLeafletItineraryBounds)(oldProps.itinerary);
      var oldTo = oldProps.query && oldProps.query.to;
      var fromChanged = !(0, _lodash.default)(oldFrom, newFrom);
      var toChanged = !(0, _lodash.default)(oldTo, newTo);

      if (!oldItinBounds && newItinBounds || oldItinBounds && newItinBounds && !oldItinBounds.equals(newItinBounds)) {
        map.fitBounds(newItinBounds, {
          padding: padding
        }); // Pan to to itinerary leg if made active (clicked); newly active leg must be non-null
      } else if (newProps.itinerary && newProps.activeLeg !== oldProps.activeLeg && newProps.activeLeg !== null) {
        map.fitBounds((0, _itinerary.getLeafletLegBounds)(newProps.itinerary.legs[newProps.activeLeg]), {
          padding: padding
        }); // If no itinerary update but from/to locations are present, fit to those
      } else if (newFrom && newTo && (fromChanged || toChanged)) {
        // On certain mobile devices (e.g., Android + Chrome), setting from and to
        // locations via the location search component causes issues for this
        // fitBounds invocation. The map does not appear to be visible when these
        // prop changes are detected, so for now we should perhaps just skip this
        // fitBounds on mobile.
        // See https://github.com/opentripplanner/otp-react-redux/issues/133 for
        // more info.
        // TODO: Fix this so mobile devices will also update the bounds to the
        // from/to locations.
        if (!_coreUtils.default.ui.isMobile()) {
          map.fitBounds([[newFrom.lat, newFrom.lon], [newTo.lat, newTo.lon]], {
            padding: padding
          });
        } // If only from or to is set, pan to that

      } else if (newFrom && fromChanged) {
        map.panTo([newFrom.lat, newFrom.lon]);
      } else if (newTo && toChanged) {
        map.panTo([newTo.lat, newTo.lon]); // Pan to to itinerary step if made active (clicked)
      } else if (newProps.itinerary && newProps.activeLeg !== null && newProps.activeStep !== null && newProps.activeStep !== oldProps.activeStep) {
        var leg = newProps.itinerary.legs[newProps.activeLeg];
        var step = leg.steps[newProps.activeStep];
        map.panTo([step.lat, step.lon]);
      }
    }
  }]);

  return BoundsUpdatingOverlay;
}(_reactLeaflet.MapLayer); // connect to the redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  return {
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    itinerary: (0, _state.getActiveItinerary)(state.otp),
    popupLocation: state.otp.ui.mapPopupLocation,
    query: state.otp.currentQuery
  };
};

var mapDispatchToProps = {};

var _default = (0, _reactLeaflet.withLeaflet)((0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(BoundsUpdatingOverlay));

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=bounds-updating-overlay.js
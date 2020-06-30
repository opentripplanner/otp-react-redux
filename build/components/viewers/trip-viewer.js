"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.function.name");

var _coreUtils = _interopRequireDefault(require("@opentripplanner/core-utils"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _reactBootstrap = require("react-bootstrap");

var _reactRedux = require("react-redux");

var _icon = _interopRequireDefault(require("../narrative/icon"));

var _viewStopButton = _interopRequireDefault(require("./view-stop-button"));

var _ui = require("../../actions/ui");

var _api = require("../../actions/api");

var _map = require("../../actions/map");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TripViewer =
/*#__PURE__*/
function (_Component) {
  _inherits(TripViewer, _Component);

  function TripViewer() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, TripViewer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(TripViewer)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "_backClicked", function () {
      _this.props.setViewedTrip(null);
    });

    return _this;
  }

  _createClass(TripViewer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props = this.props,
          findTrip = _this$props.findTrip,
          viewedTrip = _this$props.viewedTrip;
      var tripId = viewedTrip.tripId;
      findTrip({
        tripId: tripId
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          hideBackButton = _this$props2.hideBackButton,
          languageConfig = _this$props2.languageConfig,
          timeFormat = _this$props2.timeFormat,
          tripData = _this$props2.tripData,
          viewedTrip = _this$props2.viewedTrip;
      return _react.default.createElement("div", {
        className: "trip-viewer"
      }, _react.default.createElement("div", {
        className: "trip-viewer-header"
      }, !hideBackButton && _react.default.createElement("div", {
        className: "back-button-container"
      }, _react.default.createElement(_reactBootstrap.Button, {
        bsSize: "small",
        onClick: this._backClicked
      }, _react.default.createElement(_icon.default, {
        type: "arrow-left"
      }), "Back")), _react.default.createElement("div", {
        className: "header-text"
      }, languageConfig.tripViewer || 'Trip Viewer'), _react.default.createElement("div", {
        style: {
          clear: 'both'
        }
      })), _react.default.createElement("div", {
        className: "trip-viewer-body"
      }, tripData && _react.default.createElement("div", null, _react.default.createElement("div", null, "Route: ", _react.default.createElement("b", null, tripData.route.shortName), " ", tripData.route.longName), _react.default.createElement("h4", null, tripData.wheelchairAccessible === 1 && _react.default.createElement(_reactBootstrap.Label, {
        bsStyle: "primary"
      }, _react.default.createElement(_icon.default, {
        type: "wheelchair-alt"
      }), " Accessible"), ' ', tripData.bikesAllowed === 1 && _react.default.createElement(_reactBootstrap.Label, {
        bsStyle: "success"
      }, _react.default.createElement(_icon.default, {
        type: "bicycle"
      }), " Allowed"))), tripData && tripData.stops && tripData.stopTimes && tripData.stops.map(function (stop, i) {
        // determine whether to use special styling for first/last stop
        var stripMapLineClass = 'strip-map-line';
        if (i === 0) stripMapLineClass = 'strip-map-line-first';else if (i === tripData.stops.length - 1) stripMapLineClass = 'strip-map-line-last'; // determine whether to show highlight in strip map

        var highlightClass;
        if (i === viewedTrip.fromIndex) highlightClass = 'strip-map-highlight-first';else if (i > viewedTrip.fromIndex && i < viewedTrip.toIndex) highlightClass = 'strip-map-highlight';else if (i === viewedTrip.toIndex) highlightClass = 'strip-map-highlight-last';
        return _react.default.createElement("div", {
          key: i
        }, _react.default.createElement("div", {
          className: "stop-time"
        }, _coreUtils.default.time.formatSecondsAfterMidnight(tripData.stopTimes[i].scheduledDeparture, timeFormat)), _react.default.createElement("div", {
          className: "strip-map-container"
        }, highlightClass && _react.default.createElement("div", {
          className: highlightClass
        }), _react.default.createElement("div", {
          className: stripMapLineClass
        }), _react.default.createElement("div", {
          className: "strip-map-icon"
        }, _react.default.createElement(_icon.default, {
          type: "circle"
        }))), _react.default.createElement("div", {
          className: "stop-button-container"
        }, _react.default.createElement(_viewStopButton.default, {
          stopId: stop.id,
          text: "View"
        })), _react.default.createElement("div", {
          className: "stop-name"
        }, stop.name), _react.default.createElement("div", {
          style: {
            clear: 'both'
          }
        }));
      })));
    }
  }]);

  return TripViewer;
}(_react.Component);

_defineProperty(TripViewer, "propTypes", {
  hideBackButton: _propTypes.default.bool,
  tripData: _propTypes.default.object,
  viewedTrip: _propTypes.default.object
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var viewedTrip = state.otp.ui.viewedTrip;
  return {
    languageConfig: state.otp.config.language,
    timeFormat: _coreUtils.default.time.getTimeFormat(state.otp.config),
    tripData: state.otp.transitIndex.trips[viewedTrip.tripId],
    viewedTrip: viewedTrip
  };
};

var mapDispatchToProps = {
  setViewedTrip: _ui.setViewedTrip,
  findTrip: _api.findTrip,
  setLocation: _map.setLocation
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TripViewer);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=trip-viewer.js
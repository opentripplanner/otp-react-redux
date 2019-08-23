"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _reactBootstrap = require("react-bootstrap");

var _narrative = require("../../actions/narrative");

var _defaultItinerary = _interopRequireDefault(require("./default/default-itinerary"));

var _state = require("../../util/state");

var _itinerary = require("../../util/itinerary");

var _time = require("../../util/time");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TabbedItineraries =
/*#__PURE__*/
function (_Component) {
  _inherits(TabbedItineraries, _Component);

  function TabbedItineraries() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, TabbedItineraries);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(TabbedItineraries)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "_toggleRealtimeItineraryClick", function (e) {
      var _this$props = _this.props,
          setUseRealtimeResponse = _this$props.setUseRealtimeResponse,
          useRealtime = _this$props.useRealtime;
      setUseRealtimeResponse({
        useRealtime: !useRealtime
      });
    });

    return _this;
  }

  _createClass(TabbedItineraries, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props2 = this.props,
          activeItinerary = _this$props2.activeItinerary,
          itineraries = _this$props2.itineraries,
          itineraryClass = _this$props2.itineraryClass,
          realtimeEffects = _this$props2.realtimeEffects,
          useRealtime = _this$props2.useRealtime,
          timeFormat = _this$props2.timeFormat;
      if (!itineraries) return null;
      /* TODO: should this be moved? */

      var showRealtimeAnnotation = realtimeEffects.isAffectedByRealtimeData && (realtimeEffects.exceedsThreshold || realtimeEffects.routesDiffer || !useRealtime);
      return _react.default.createElement("div", {
        className: "options itinerary tabbed-itineraries"
      }, _react.default.createElement("div", {
        className: "tab-row"
      }, itineraries.map(function (itinerary, index) {
        var timeOptions = {
          format: timeFormat,
          offset: (0, _itinerary.getTimeZoneOffset)(itinerary)
        };
        var classNames = ['tab-button', 'clear-button-formatting'];

        var _calculatePhysicalAct = (0, _itinerary.calculatePhysicalActivity)(itinerary),
            caloriesBurned = _calculatePhysicalAct.caloriesBurned;

        var _calculateFares = (0, _itinerary.calculateFares)(itinerary),
            centsToString = _calculateFares.centsToString,
            maxTNCFare = _calculateFares.maxTNCFare,
            minTNCFare = _calculateFares.minTNCFare,
            transitFare = _calculateFares.transitFare; // TODO: support non-USD


        var minTotalFare = minTNCFare * 100 + transitFare;
        var plus = maxTNCFare && maxTNCFare > minTNCFare ? '+' : '';
        if (index === activeItinerary) classNames.push('selected');
        return _react.default.createElement(_reactBootstrap.Button, {
          key: "tab-button-".concat(index),
          className: classNames.join(' '),
          onClick: function onClick() {
            _this2.props.setActiveItinerary(index);
          }
        }, _react.default.createElement("div", {
          className: "title"
        }, _react.default.createElement("span", null, "Option ", index + 1)), _react.default.createElement("div", {
          className: "details"
        }, (0, _time.formatDuration)(itinerary.duration), _react.default.createElement("span", null, _react.default.createElement("br", null), (0, _time.formatTime)(itinerary.startTime, timeOptions), " - ", (0, _time.formatTime)(itinerary.endTime, timeOptions)), _react.default.createElement("span", null, _react.default.createElement("br", null), minTotalFare ? _react.default.createElement("span", null, "".concat(centsToString(minTotalFare)).concat(plus), " \u2022 ") : '', Math.round(caloriesBurned), " Cal"), itinerary.transfers > 0 && _react.default.createElement("span", null, _react.default.createElement("br", null), itinerary.transfers, " transfer", itinerary.transfers > 1 ? 's' : '')));
      })), activeItinerary !== null && _react.default.createElement(itineraryClass, _objectSpread({
        itinerary: itineraries[activeItinerary],
        index: activeItinerary,
        key: activeItinerary,
        active: true,
        routingType: 'ITINERARY',
        showRealtimeAnnotation: showRealtimeAnnotation
      }, this.props)));
    }
  }]);

  return TabbedItineraries;
}(_react.Component); // connect to the redux store


_defineProperty(TabbedItineraries, "propTypes", {
  itineraries: _propTypes.default.array,
  itineraryClass: _propTypes.default.func,
  pending: _propTypes.default.bool,
  activeItinerary: _propTypes.default.number,
  setActiveItinerary: _propTypes.default.func,
  setActiveLeg: _propTypes.default.func,
  setActiveStep: _propTypes.default.func,
  setUseRealtimeResponse: _propTypes.default.func,
  useRealtime: _propTypes.default.bool
});

_defineProperty(TabbedItineraries, "defaultProps", {
  itineraryClass: _defaultItinerary.default
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp); // const { activeItinerary, activeLeg, activeStep } = activeSearch ? activeSearch.activeItinerary : {}

  var pending = activeSearch ? activeSearch.pending : false;
  var realtimeEffects = (0, _state.getRealtimeEffects)(state.otp);
  var useRealtime = state.otp.useRealtime;
  return {
    // swap out realtime itineraries with non-realtime depending on boolean
    pending: pending,
    realtimeEffects: realtimeEffects,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    useRealtime: useRealtime,
    companies: state.otp.currentQuery.companies,
    tnc: state.otp.tnc,
    timeFormat: (0, _time.getTimeFormat)(state.otp.config)
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
  return {
    setActiveItinerary: function setActiveItinerary(index) {
      dispatch((0, _narrative.setActiveItinerary)({
        index: index
      }));
    },
    setActiveLeg: function setActiveLeg(index, leg) {
      dispatch((0, _narrative.setActiveLeg)({
        index: index,
        leg: leg
      }));
    },
    setActiveStep: function setActiveStep(index, step) {
      dispatch((0, _narrative.setActiveStep)({
        index: index,
        step: step
      }));
    },
    setUseRealtimeResponse: function setUseRealtimeResponse(_ref) {
      var useRealtime = _ref.useRealtime;
      dispatch((0, _narrative.setUseRealtimeResponse)({
        useRealtime: useRealtime
      }));
    }
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TabbedItineraries);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=tabbed-itineraries.js
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _narrative = require("../../actions/narrative");

var _state = require("../../util/state");

var _itinerarySteps = _interopRequireDefault(require("./itinerary-steps"));

var _itineraryStops = _interopRequireDefault(require("./itinerary-stops"));

var _itineraryLegs = _interopRequireDefault(require("./itinerary-legs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ItineraryOverlay =
/*#__PURE__*/
function (_Component) {
  _inherits(ItineraryOverlay, _Component);

  function ItineraryOverlay() {
    _classCallCheck(this, ItineraryOverlay);

    return _possibleConstructorReturn(this, _getPrototypeOf(ItineraryOverlay).apply(this, arguments));
  }

  _createClass(ItineraryOverlay, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          activeLeg = _this$props.activeLeg,
          activeStep = _this$props.activeStep,
          itinerary = _this$props.itinerary;
      if (!itinerary) return null;
      return _react.default.createElement("div", null, _react.default.createElement(_itineraryLegs.default, {
        itinerary: itinerary,
        activeLeg: activeLeg,
        setActiveLeg: this.props.setActiveLeg
      }), _react.default.createElement(_itineraryStops.default, {
        itinerary: itinerary,
        activeLeg: activeLeg,
        setActiveLeg: this.props.setActiveLeg
      }), _react.default.createElement(_itinerarySteps.default, {
        itinerary: itinerary,
        activeLeg: activeLeg,
        activeStep: activeStep
      }));
    }
  }]);

  return ItineraryOverlay;
}(_react.Component); // connect to the redux store


_defineProperty(ItineraryOverlay, "propTypes", {
  activeLeg: _propTypes.default.number,
  activeStep: _propTypes.default.number,
  itinerary: _propTypes.default.object
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  return {
    itinerary: (0, _state.getActiveItinerary)(state.otp),
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
  return {
    setActiveLeg: function setActiveLeg(index, leg) {
      dispatch((0, _narrative.setActiveLeg)({
        index: index,
        leg: leg
      }));
    }
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ItineraryOverlay);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=itinerary-overlay.js
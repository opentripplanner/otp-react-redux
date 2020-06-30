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

var _narrative = require("../../actions/narrative");

var _defaultItinerary = _interopRequireDefault(require("./default/default-itinerary"));

var _narrativeProfileSummary = _interopRequireDefault(require("./narrative-profile-summary"));

var _loading = _interopRequireDefault(require("./loading"));

var _state = require("../../util/state");

var _profile = require("../../util/profile");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var NarrativeProfileOptions =
/*#__PURE__*/
function (_Component) {
  _inherits(NarrativeProfileOptions, _Component);

  function NarrativeProfileOptions() {
    _classCallCheck(this, NarrativeProfileOptions);

    return _possibleConstructorReturn(this, _getPrototypeOf(NarrativeProfileOptions).apply(this, arguments));
  }

  _createClass(NarrativeProfileOptions, [{
    key: "render",
    value: function render() {
      var _this = this;

      var _this$props = this.props,
          pending = _this$props.pending,
          itineraryClass = _this$props.itineraryClass,
          query = _this$props.query,
          activeItinerary = _this$props.activeItinerary;
      if (pending) return _react.default.createElement(_loading.default, null);
      var options = this.props.options;
      if (!options) return null;
      var itineraries = (0, _profile.profileOptionsToItineraries)(options, query);
      return _react.default.createElement("div", {
        className: "options profile"
      }, _react.default.createElement("div", {
        className: "header"
      }, "Your best options:"), _react.default.createElement(_narrativeProfileSummary.default, {
        options: options,
        customIcons: this.props.customIcons
      }), _react.default.createElement("div", {
        className: "header"
      }, "We found ", _react.default.createElement("strong", null, options.length), " total options:"), itineraries.map(function (itinerary, index) {
        return _react.default.createElement(itineraryClass, _objectSpread({
          itinerary: itinerary,
          index: index,
          key: index,
          active: index === activeItinerary,
          routingType: 'PROFILE'
        }, _this.props));
      }));
    }
  }]);

  return NarrativeProfileOptions;
}(_react.Component); // connect to the redux store


_defineProperty(NarrativeProfileOptions, "propTypes", {
  options: _propTypes.default.array,
  query: _propTypes.default.object,
  itineraryClass: _propTypes.default.func,
  pending: _propTypes.default.bool,
  activeOption: _propTypes.default.number,
  setActiveItinerary: _propTypes.default.func,
  setActiveLeg: _propTypes.default.func,
  setActiveStep: _propTypes.default.func,
  customIcons: _propTypes.default.object
});

_defineProperty(NarrativeProfileOptions, "defaultProps", {
  itineraryClass: _defaultItinerary.default
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp); // const { activeItinerary, activeLeg, activeStep } = activeSearch ? activeSearch.activeItinerary : {}

  var pending = activeSearch && activeSearch.pending;
  return {
    options: activeSearch && activeSearch.response && activeSearch.response.otp ? activeSearch.response.otp.profile : null,
    pending: pending,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    query: activeSearch && activeSearch.query
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
    }
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(NarrativeProfileOptions);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=narrative-profile-options.js
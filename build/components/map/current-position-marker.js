"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _reactLeaflet = require("react-leaflet");

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* A small circular marker showing the user's current position. Intended
 * primarily for use in mobile mode.
 */
var CurrentPositionMarker =
/*#__PURE__*/
function (_MapLayer) {
  _inherits(CurrentPositionMarker, _MapLayer);

  function CurrentPositionMarker() {
    _classCallCheck(this, CurrentPositionMarker);

    return _possibleConstructorReturn(this, _getPrototypeOf(CurrentPositionMarker).apply(this, arguments));
  }

  _createClass(CurrentPositionMarker, [{
    key: "componentWillUnmount",
    value: function componentWillUnmount() {}
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {}
  }, {
    key: "createLeafletElement",
    value: function createLeafletElement() {}
  }, {
    key: "updateLeafletElement",
    value: function updateLeafletElement() {}
  }, {
    key: "render",
    value: function render() {
      var currentPosition = this.props.currentPosition;
      if (!currentPosition || !currentPosition.coords) return _react.default.createElement(_reactLeaflet.FeatureGroup, null);
      return _react.default.createElement(_reactLeaflet.FeatureGroup, null, _react.default.createElement(_reactLeaflet.CircleMarker, {
        center: [currentPosition.coords.latitude, currentPosition.coords.longitude],
        radius: 3,
        fillOpacity: 0.5,
        fillColor: "#f44",
        color: "#f00",
        weight: 1
      }));
    }
  }]);

  return CurrentPositionMarker;
}(_reactLeaflet.MapLayer); // connect to the redux store


_defineProperty(CurrentPositionMarker, "propTypes", {
  currentPosition: _propTypes.default.object // TODO: determine why the default MapLayer componentWillUnmount() method throws an error

});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    currentPosition: state.otp.location.currentPosition
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps)(CurrentPositionMarker);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=current-position-marker.js
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _parkAndRideOverlay = _interopRequireDefault(require("@opentripplanner/park-and-ride-overlay"));

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _map = require("../../actions/map");

var _api = require("../../actions/api");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

var ConnectedParkAndRideOverlay =
/*#__PURE__*/
function (_Component) {
  _inherits(ConnectedParkAndRideOverlay, _Component);

  function ConnectedParkAndRideOverlay() {
    _classCallCheck(this, ConnectedParkAndRideOverlay);

    return _possibleConstructorReturn(this, _getPrototypeOf(ConnectedParkAndRideOverlay).apply(this, arguments));
  }

  _createClass(ConnectedParkAndRideOverlay, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var params = {};

      if (this.props.maxTransitDistance) {
        params.maxTransitDistance = this.props.maxTransitDistance;
      } // TODO: support config-defined bounding envelope


      this.props.parkAndRideQuery(params);
    }
  }, {
    key: "render",
    value: function render() {
      return _react.default.createElement(_parkAndRideOverlay.default, this.props);
    }
  }]);

  return ConnectedParkAndRideOverlay;
}(_react.Component); // connect to the redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    parkAndRideLocations: state.otp.overlay.parkAndRide && state.otp.overlay.parkAndRide.locations
  };
};

var mapDispatchToProps = {
  setLocation: _map.setLocation,
  parkAndRideQuery: _api.parkAndRideQuery
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ConnectedParkAndRideOverlay);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=connected-park-and-ride-overlay.js
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.object.assign");

var _vehicleRentalOverlay = _interopRequireDefault(require("@opentripplanner/vehicle-rental-overlay"));

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _map = require("../../actions/map");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ConnectedVehicleRentalOverlay =
/*#__PURE__*/
function (_Component) {
  _inherits(ConnectedVehicleRentalOverlay, _Component);

  function ConnectedVehicleRentalOverlay(props) {
    var _this;

    _classCallCheck(this, ConnectedVehicleRentalOverlay);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ConnectedVehicleRentalOverlay).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "onOverlayAdded", function () {
      _this.setState({
        visible: true
      });
    });

    _defineProperty(_assertThisInitialized(_this), "onOverlayRemoved", function () {
      _this.setState({
        visible: false
      });
    });

    _this.state = {
      visible: props.visible
    };
    return _this;
  }

  _createClass(ConnectedVehicleRentalOverlay, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.props.registerOverlay(this);
    }
  }, {
    key: "render",
    value: function render() {
      return _react.default.createElement(_vehicleRentalOverlay.default, _extends({}, this.props, {
        visible: this.state.visible
      }));
    }
  }]);

  return ConnectedVehicleRentalOverlay;
}(_react.Component); // connect to the redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    configCompanies: state.otp.config.companies,
    zoom: state.otp.config.map.initZoom
  };
};

var mapDispatchToProps = {
  setLocation: _map.setLocation
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ConnectedVehicleRentalOverlay);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=connected-vehicle-rental-overlay.js
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.function.name");

var _react = _interopRequireWildcard(require("react"));

var _reactLeaflet = require("react-leaflet");

var _reactRedux = require("react-redux");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var BaseLayers =
/*#__PURE__*/
function (_Component) {
  _inherits(BaseLayers, _Component);

  function BaseLayers() {
    _classCallCheck(this, BaseLayers);

    return _possibleConstructorReturn(this, _getPrototypeOf(BaseLayers).apply(this, arguments));
  }

  _createClass(BaseLayers, [{
    key: "render",
    value: function render() {
      var _this$props$config$ma = this.props.config.map,
          baseLayers = _this$props$config$ma.baseLayers,
          overlays = _this$props$config$ma.overlays;
      var BaseLayer = _reactLeaflet.LayersControl.BaseLayer,
          Overlay = _reactLeaflet.LayersControl.Overlay;
      return _react.default.createElement(_reactLeaflet.LayersControl, null, baseLayers && baseLayers.map(function (l, i) {
        return _react.default.createElement(BaseLayer, {
          name: l.name,
          checked: i === 0,
          key: i
        }, _react.default.createElement(_reactLeaflet.TileLayer, _extends({}, l, {
          detectRetina: true
        })));
      }), overlays && overlays.map(function (l, i) {
        return _react.default.createElement(Overlay, {
          name: l.name,
          key: i
        }, _react.default.createElement(_reactLeaflet.TileLayer, _extends({}, l, {
          detectRetina: true
        })));
      }));
    }
  }]);

  return BaseLayers;
}(_react.Component); // connect to the redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    config: state.otp.config
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps)(BaseLayers);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=base-layers.js
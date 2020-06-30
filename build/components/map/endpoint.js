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

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.array.find");

require("core-js/modules/es6.object.assign");

var _react = _interopRequireWildcard(require("react"));

var _server = _interopRequireDefault(require("react-dom/server"));

var _reactBootstrap = require("react-bootstrap");

var _reactLeaflet = require("react-leaflet");

var _leaflet = require("leaflet");

var _icon = _interopRequireDefault(require("../narrative/icon"));

var _map = require("../../util/map");

var _locationIcon = _interopRequireDefault(require("../icons/location-icon"));

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

var Endpoint =
/*#__PURE__*/
function (_Component) {
  _inherits(Endpoint, _Component);

  function Endpoint() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, Endpoint);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(Endpoint)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "_rememberAsHome", function () {
      var rememberPlace = _this.props.rememberPlace;
      var location = Object.assign({}, _this.props.location);
      location.id = 'home';
      location.icon = 'home';
      location.type = 'home';
      rememberPlace({
        type: 'home',
        location: location
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_rememberAsWork", function () {
      var rememberPlace = _this.props.rememberPlace;
      var location = Object.assign({}, _this.props.location);
      location.id = 'work';
      location.icon = 'briefcase';
      location.type = 'work';
      rememberPlace({
        type: 'work',
        location: location
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_forgetHome", function () {
      return _this.props.forgetPlace('home');
    });

    _defineProperty(_assertThisInitialized(_this), "_forgetWork", function () {
      return _this.props.forgetPlace('work');
    });

    _defineProperty(_assertThisInitialized(_this), "_clearLocation", function () {
      var _this$props = _this.props,
          clearLocation = _this$props.clearLocation,
          type = _this$props.type;
      clearLocation({
        type: type
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_swapLocation", function () {
      var _this$props2 = _this.props,
          location = _this$props2.location,
          setLocation = _this$props2.setLocation,
          type = _this$props2.type;

      _this._clearLocation();

      var otherType = type === 'from' ? 'to' : 'from';
      setLocation({
        type: otherType,
        location: location
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_onDragEnd", function (e) {
      var _this$props3 = _this.props,
          setLocation = _this$props3.setLocation,
          type = _this$props3.type;
      var location = (0, _map.constructLocation)(e.target.getLatLng());
      setLocation({
        type: type,
        location: location,
        reverseGeocode: true
      });
    });

    return _this;
  }

  _createClass(Endpoint, [{
    key: "render",
    value: function render() {
      var _this$props4 = this.props,
          type = _this$props4.type,
          location = _this$props4.location,
          locations = _this$props4.locations,
          showPopup = _this$props4.showPopup;
      var position = location && location.lat && location.lon ? [location.lat, location.lon] : null;
      if (!position) return null;
      var fgStyle = {
        fontSize: 24,
        width: 32,
        height: 32
      };
      var bgStyle = {
        fontSize: 32,
        width: 32,
        height: 32,
        paddingTop: 1
      };
      var match = locations.find(function (l) {
        return (0, _map.matchLatLon)(l, location);
      });
      var isWork = match && match.type === 'work';
      var isHome = match && match.type === 'home';

      var iconHtml = _server.default.renderToStaticMarkup(_react.default.createElement("span", {
        title: location.name,
        className: "fa-stack endpoint-".concat(type, "-icon"),
        style: {
          opacity: 1.0,
          marginLeft: -10,
          marginTop: -7
        }
      }, type === 'from' // From icon should have white circle background
      ? _react.default.createElement("i", {
        className: "fa-stack-1x fa fa-circle",
        style: _objectSpread({
          color: '#fff'
        }, fgStyle)
      }) : _react.default.createElement("span", null, _react.default.createElement(_locationIcon.default, {
        type: type,
        className: "fa-stack-1x",
        style: _objectSpread({
          color: '#333'
        }, bgStyle)
      }), _react.default.createElement("i", {
        className: "fa-stack-1x fa fa-circle",
        style: _objectSpread({
          color: '#fff'
        }, bgStyle, {
          fontSize: 12,
          marginTop: -4
        })
      })), _react.default.createElement(_locationIcon.default, {
        type: type,
        className: "fa-stack-1x",
        style: fgStyle
      })));

      var otherType = type === 'from' ? 'to' : 'from';
      var icon = isWork ? 'briefcase' : isHome ? 'home' : 'map-marker';
      return _react.default.createElement(_reactLeaflet.Marker, {
        draggable: true,
        icon: (0, _leaflet.divIcon)({
          html: iconHtml,
          className: ''
        }),
        position: position,
        onDragEnd: this._onDragEnd
      }, showPopup && _react.default.createElement(_reactLeaflet.Popup, null, _react.default.createElement("div", null, _react.default.createElement("strong", null, _react.default.createElement(_icon.default, {
        type: icon
      }), " ", location.name), _react.default.createElement("div", null, _react.default.createElement(_reactBootstrap.Button, {
        bsStyle: "link",
        bsSize: "small",
        disabled: isWork,
        style: {
          padding: 0
        },
        onClick: isHome ? this._forgetHome : this._rememberAsHome
      }, isHome ? _react.default.createElement("span", null, _react.default.createElement(_icon.default, {
        type: "times"
      }), " Forget home") : _react.default.createElement("span", null, _react.default.createElement(_icon.default, {
        type: "home"
      }), " Save as home"))), _react.default.createElement("div", null, _react.default.createElement(_reactBootstrap.Button, {
        bsStyle: "link",
        bsSize: "small",
        disabled: isHome,
        style: {
          padding: 0
        },
        onClick: isWork ? this._forgetWork : this._rememberAsWork
      }, isWork ? _react.default.createElement("span", null, _react.default.createElement(_icon.default, {
        type: "times"
      }), " Forget work") : _react.default.createElement("span", null, _react.default.createElement(_icon.default, {
        type: "briefcase"
      }), " Save as work"))), _react.default.createElement("div", null, _react.default.createElement(_reactBootstrap.Button, {
        bsStyle: "link",
        bsSize: "small",
        style: {
          padding: 0
        },
        onClick: this._clearLocation
      }, _react.default.createElement(_icon.default, {
        type: "times"
      }), " Remove as ", type, " location")), _react.default.createElement("div", null, _react.default.createElement(_reactBootstrap.Button, {
        bsStyle: "link",
        bsSize: "small",
        style: {
          padding: 0
        },
        onClick: this._swapLocation
      }, _react.default.createElement(_icon.default, {
        type: "refresh"
      }), " Change to ", otherType, " location")))));
    }
  }]);

  return Endpoint;
}(_react.Component);

exports.default = Endpoint;
module.exports = exports.default;

//# sourceMappingURL=endpoint.js
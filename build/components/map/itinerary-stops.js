"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.function.name");

var _leaflet = require("leaflet");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactLeaflet = require("react-leaflet");

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

// import polyline from '@mapbox/polyline'
// import { isTransit } from '../../util/itinerary'
var ItineraryStops =
/*#__PURE__*/
function (_Component) {
  _inherits(ItineraryStops, _Component);

  function ItineraryStops() {
    _classCallCheck(this, ItineraryStops);

    return _possibleConstructorReturn(this, _getPrototypeOf(ItineraryStops).apply(this, arguments));
  }

  _createClass(ItineraryStops, [{
    key: "addItineraryStop",
    value: function addItineraryStop(array, item) {
      if (item.stopId && array.indexOf(item.stopId) === -1) {
        array.push(item);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this = this;

      var itinerary = this.props.itinerary;
      var stops = [];
      itinerary.legs.map(function (l) {
        _this.addItineraryStop(stops, l.from);

        _this.addItineraryStop(stops, l.to);
      });
      return _react.default.createElement("div", null, stops.map(function (stop, index) {
        var icon = (0, _leaflet.divIcon)({
          html: "<span title=\"".concat(stop.name, "\" class=\"fa-stack stop-icon\" style=\"opacity: 1.0\">\n                    <i class=\"fa fa-circle fa-stack-2x\" style=\"color: #ffffff\"></i>\n                    <i class=\"fa fa-bus fa-stack-1x\" style=\"color: #000000\"></i>\n                  </span>"),
          className: ''
        });
        return _react.default.createElement(_reactLeaflet.Marker, {
          icon: icon,
          position: [stop.lat, stop.lon],
          key: index
        });
      }));
    }
  }]);

  return ItineraryStops;
}(_react.Component);

exports.default = ItineraryStops;

_defineProperty(ItineraryStops, "propTypes", {
  itinerary: _propTypes.default.object
});

module.exports = exports.default;

//# sourceMappingURL=itinerary-stops.js
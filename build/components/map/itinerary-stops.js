'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp;

var _leaflet = require('leaflet');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactLeaflet = require('react-leaflet');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import polyline from '@mapbox/polyline'

// import { isTransit } from '../../util/itinerary'

var ItineraryStops = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(ItineraryStops, _Component);

  function ItineraryStops() {
    (0, _classCallCheck3.default)(this, ItineraryStops);
    return (0, _possibleConstructorReturn3.default)(this, (ItineraryStops.__proto__ || (0, _getPrototypeOf2.default)(ItineraryStops)).apply(this, arguments));
  }

  (0, _createClass3.default)(ItineraryStops, [{
    key: 'addItineraryStop',
    value: function addItineraryStop(array, item) {
      if (item.stopId && array.indexOf(item.stopId) === -1) {
        array.push(item);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var itinerary = this.props.itinerary;

      var stops = [];
      itinerary.legs.map(function (l) {
        _this2.addItineraryStop(stops, l.from);
        _this2.addItineraryStop(stops, l.to);
      });
      return _react2.default.createElement(
        'div',
        null,
        stops.map(function (stop, index) {
          var icon = (0, _leaflet.divIcon)({
            html: '<span title="' + stop.name + '" class="fa-stack stop-icon" style="opacity: 1.0">\n                    <i class="fa fa-circle fa-stack-2x" style="color: #ffffff"></i>\n                    <i class="fa fa-bus fa-stack-1x" style="color: #000000"></i>\n                  </span>',
            className: ''
          });
          return _react2.default.createElement(_reactLeaflet.Marker, {
            icon: icon,
            position: [stop.lat, stop.lon],
            key: index
          });
        })
      );
    }
  }]);
  return ItineraryStops;
}(_react.Component), _class.propTypes = {
  itinerary: _react.PropTypes.object
}, _temp);
exports.default = ItineraryStops;
module.exports = exports['default'];

//# sourceMappingURL=itinerary-stops.js
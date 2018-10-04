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

var _reactLeaflet = require('react-leaflet');

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

require('leaflet.polylinemeasure/Leaflet.PolylineMeasure.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DistanceMeasure = function (_MapControl) {
  (0, _inherits3.default)(DistanceMeasure, _MapControl);

  function DistanceMeasure() {
    (0, _classCallCheck3.default)(this, DistanceMeasure);
    return (0, _possibleConstructorReturn3.default)(this, (DistanceMeasure.__proto__ || (0, _getPrototypeOf2.default)(DistanceMeasure)).apply(this, arguments));
  }

  (0, _createClass3.default)(DistanceMeasure, [{
    key: 'createLeafletElement',
    value: function createLeafletElement(props) {
      return _leaflet2.default.control.polylineMeasure({
        unit: 'landmiles',
        measureControlLabel: '&#x1f4cf;',
        backgroundColor: '#f3dd2d',
        clearMeasurementsOnStop: true
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var map = this.context.map;

      this.leafletElement.addTo(map);
    }
  }]);
  return DistanceMeasure;
}(_reactLeaflet.MapControl);

exports.default = DistanceMeasure;
module.exports = exports['default'];

//# sourceMappingURL=distance-measure.js
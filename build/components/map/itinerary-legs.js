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

var _class, _temp2;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactLeaflet = require('react-leaflet');

var _polyline = require('@mapbox/polyline');

var _polyline2 = _interopRequireDefault(_polyline);

var _itinerary = require('../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ItineraryLegs = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(ItineraryLegs, _Component);

  function ItineraryLegs() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, ItineraryLegs);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = ItineraryLegs.__proto__ || (0, _getPrototypeOf2.default)(ItineraryLegs)).call.apply(_ref, [this].concat(args))), _this), _this._onLegClick = function (e) {
      var index = e.layer.feature.geometry.index;
      var leg = _this.props.itinerary.legs[index];
      if (index === _this.props.activeLeg) {
        _this.props.setActiveLeg(null);
      } else {
        _this.props.setActiveLeg(index, leg);
      }
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(ItineraryLegs, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          itinerary = _props.itinerary,
          activeLeg = _props.activeLeg;

      return _react2.default.createElement(
        _reactLeaflet.FeatureGroup,
        null,
        itinerary.legs.map(function (leg, index) {
          var geojson = _polyline2.default.toGeoJSON(leg.legGeometry.points);
          geojson.index = index;
          var active = activeLeg === index;
          var color = active ? 'yellow' : (0, _itinerary.isTransit)(leg.mode) ? 'blue' : 'black';
          return _react2.default.createElement(_reactLeaflet.GeoJSON, {
            key: Math.random(),
            color: color,
            onClick: _this2._onLegClick,
            data: geojson });
        })
      );
    }
  }]);
  return ItineraryLegs;
}(_react.Component), _class.propTypes = {
  itinerary: _react.PropTypes.object,
  activeLeg: _react.PropTypes.number,
  setActiveLeg: _react.PropTypes.func
}, _temp2);
exports.default = ItineraryLegs;
module.exports = exports['default'];

//# sourceMappingURL=itinerary-legs.js
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactLeaflet = require('react-leaflet');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* A small circular marker showing the user's current position. Intended
 * primarily for use in mobile mode.
 */

var CurrentPositionMarker = (_temp = _class = function (_MapLayer) {
  (0, _inherits3.default)(CurrentPositionMarker, _MapLayer);

  function CurrentPositionMarker() {
    (0, _classCallCheck3.default)(this, CurrentPositionMarker);
    return (0, _possibleConstructorReturn3.default)(this, (CurrentPositionMarker.__proto__ || (0, _getPrototypeOf2.default)(CurrentPositionMarker)).apply(this, arguments));
  }

  (0, _createClass3.default)(CurrentPositionMarker, [{
    key: 'componentWillUnmount',


    // TODO: determine why the default MapLayer componentWillUnmount() method throws an error
    value: function componentWillUnmount() {}
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {}
  }, {
    key: 'createLeafletElement',
    value: function createLeafletElement() {}
  }, {
    key: 'updateLeafletElement',
    value: function updateLeafletElement() {}
  }, {
    key: 'render',
    value: function render() {
      var currentPosition = this.props.currentPosition;


      if (!currentPosition || !currentPosition.coords) return _react2.default.createElement(_reactLeaflet.FeatureGroup, null);

      return _react2.default.createElement(
        _reactLeaflet.FeatureGroup,
        null,
        _react2.default.createElement(_reactLeaflet.CircleMarker, {
          center: [currentPosition.coords.latitude, currentPosition.coords.longitude],
          radius: 3,
          fillOpacity: 0.5,
          fillColor: '#f44',
          color: '#f00',
          weight: 1
        })
      );
    }
  }]);
  return CurrentPositionMarker;
}(_reactLeaflet.MapLayer), _class.propTypes = {
  currentPosition: _react.PropTypes.object }, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    currentPosition: state.otp.location.currentPosition
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps)(CurrentPositionMarker);
module.exports = exports['default'];

//# sourceMappingURL=current-position-marker.js
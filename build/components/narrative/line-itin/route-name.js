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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _velocityReact = require('velocity-react');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _legBody = require('./leg-body');

var _legBody2 = _interopRequireDefault(_legBody);

var _viewTripButton = require('../../viewers/view-trip-button');

var _viewTripButton2 = _interopRequireDefault(_viewTripButton);

var _itinerary = require('../../../util/itinerary');

var _time = require('../../../util/time');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RouteName = function (_Component) {
  (0, _inherits3.default)(RouteName, _Component);

  function RouteName() {
    (0, _classCallCheck3.default)(this, RouteName);
    return (0, _possibleConstructorReturn3.default)(this, (RouteName.__proto__ || (0, _getPrototypeOf2.default)(RouteName)).apply(this, arguments));
  }

  (0, _createClass3.default)(RouteName, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          routeShortName = _props.routeShortName,
          routeLongName = _props.routeLongName,
          headsign = _props.headsign,
          key = _props.key,
          customIcons = _props.customIcons;


      return _react2.default.createElement(
        'div',
        { key: key, className: 'route-name leg-description' },
        ' ',
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'div',
            { className: 'icon' },
            (0, _itinerary.getModeIcon)(mode, customIcons)
          )
        ),
        routeShortName && _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'span',
            { className: 'route-short-name' },
            routeShortName
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'route-long-name' },
          routeLongName,
          headsign && _react2.default.createElement(
            'span',
            null,
            ' ',
            _react2.default.createElement(
              'span',
              { style: { fontWeight: '200' } },
              'to'
            ),
            ' ',
            headsign
          )
        )
      );
    }
  }]);
  return RouteName;
}(_react.Component);

exports.default = RouteName;
module.exports = exports['default'];

//# sourceMappingURL=route-name.js
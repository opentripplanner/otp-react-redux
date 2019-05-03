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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = require('react-bootstrap');

var _modeIcon = require('./mode-icon');

var _modeIcon2 = _interopRequireDefault(_modeIcon);

var _itinerary = require('../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ItinerarySummary = function (_Component) {
  (0, _inherits3.default)(ItinerarySummary, _Component);

  function ItinerarySummary() {
    (0, _classCallCheck3.default)(this, ItinerarySummary);
    return (0, _possibleConstructorReturn3.default)(this, (ItinerarySummary.__proto__ || (0, _getPrototypeOf2.default)(ItinerarySummary)).apply(this, arguments));
  }

  (0, _createClass3.default)(ItinerarySummary, [{
    key: 'renderRoute',
    value: function renderRoute(leg) {
      if ((0, _itinerary.isTransit)(leg.mode)) {
        return leg.routeShortName ? _react2.default.createElement(
          _reactBootstrap.Label,
          null,
          leg.routeShortName
        ) : leg.routeLongName ? _react2.default.createElement(
          _reactBootstrap.Label,
          null,
          leg.routeLongName
        ) : null;
      } else {
        return null;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var itinerary = this.props.itinerary;

      return _react2.default.createElement(
        'div',
        { className: 'summary' },
        itinerary.legs.map(function (leg, index) {
          return _react2.default.createElement(
            'span',
            { key: index },
            _react2.default.createElement(_modeIcon2.default, { mode: leg.mode }),
            _this2.renderRoute(leg),
            index < itinerary.legs.length - 1 ? ' ► ' : ''
          );
        })
      );
    }
  }]);
  return ItinerarySummary;
}(_react.Component);

ItinerarySummary.propTypes = {
  itinerary: _react.PropTypes.object
};
exports.default = ItinerarySummary;
module.exports = exports['default'];

//# sourceMappingURL=itinerary-summary.js
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

var AlertsBody = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(AlertsBody, _Component);

  function AlertsBody() {
    (0, _classCallCheck3.default)(this, AlertsBody);
    return (0, _possibleConstructorReturn3.default)(this, (AlertsBody.__proto__ || (0, _getPrototypeOf2.default)(AlertsBody)).apply(this, arguments));
  }

  (0, _createClass3.default)(AlertsBody, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'transit-alerts' },
        this.props.alerts.sort(function (a, b) {
          return a.effectiveStartDate < b.effectiveStartDate ? 1 : -1;
        }).map(function (alert, k) {
          var effectiveStartDate = (0, _moment2.default)(alert.effectiveStartDate);
          var effectiveDateString = 'Effective as of ';
          var daysAway = (0, _moment2.default)().diff(effectiveStartDate, 'days');
          if (Math.abs(daysAway) <= 1) effectiveDateString += (0, _moment2.default)(effectiveStartDate).format('h:MMa, ');
          effectiveDateString += effectiveStartDate.calendar(null, { sameElse: 'MMMM D, YYYY' }).split(' at')[0];
          return _react2.default.createElement(
            'div',
            { key: k, className: 'transit-alert' },
            _react2.default.createElement(
              'div',
              { className: 'alert-icon' },
              _react2.default.createElement('i', { className: 'fa fa-exclamation-triangle' })
            ),
            _react2.default.createElement(
              'div',
              { className: 'alert-body' },
              alert.alertDescriptionText
            ),
            _react2.default.createElement(
              'div',
              { className: 'effective-date' },
              effectiveDateString
            )
          );
        })
      );
    }
  }]);
  return AlertsBody;
}(_react.Component), _class.propTypes = {
  alerts: _propTypes2.default.array
}, _temp);
exports.default = AlertsBody;
module.exports = exports['default'];

//# sourceMappingURL=alerts-body.js
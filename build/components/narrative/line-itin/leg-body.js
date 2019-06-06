'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

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

var _viewTripButton = require('../../viewers/view-trip-button');

var _viewTripButton2 = _interopRequireDefault(_viewTripButton);

var _itinerary = require('../../../util/itinerary');

var _time = require('../../../util/time');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: support multi-route legs for profile routing

var LegBody = function (_Component) {
  (0, _inherits3.default)(LegBody, _Component);

  function LegBody() {
    (0, _classCallCheck3.default)(this, LegBody);
    return (0, _possibleConstructorReturn3.default)(this, (LegBody.__proto__ || (0, _getPrototypeOf2.default)(LegBody)).apply(this, arguments));
  }

  return LegBody;
}(_react.Component);

// Connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    operators: state.otp.config.operators
  };
};

var mapDispatchToProps = {};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(LegBody);
module.exports = exports['default'];

//# sourceMappingURL=leg-body.js
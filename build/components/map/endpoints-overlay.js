'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _endpoint = require('./endpoint');

var _endpoint2 = _interopRequireDefault(_endpoint);

var _map = require('../../actions/map');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EndpointsOverlay = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(EndpointsOverlay, _Component);

  function EndpointsOverlay() {
    (0, _classCallCheck3.default)(this, EndpointsOverlay);
    return (0, _possibleConstructorReturn3.default)(this, (EndpointsOverlay.__proto__ || (0, _getPrototypeOf2.default)(EndpointsOverlay)).apply(this, arguments));
  }

  (0, _createClass3.default)(EndpointsOverlay, [{
    key: 'render',
    value: function render() {
      var _props$query = this.props.query,
          from = _props$query.from,
          to = _props$query.to;

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(_endpoint2.default, (0, _extends3.default)({ type: 'from', location: from }, this.props)),
        _react2.default.createElement(_endpoint2.default, (0, _extends3.default)({ type: 'to', location: to }, this.props))
      );
    }
  }]);
  return EndpointsOverlay;
}(_react.Component), _class.propTypes = {
  query: _react.PropTypes.object
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    query: state.otp.currentQuery
  };
};

var mapDispatchToProps = {
  rememberPlace: _map.rememberPlace,
  setLocation: _map.setLocation
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(EndpointsOverlay);
module.exports = exports['default'];

//# sourceMappingURL=endpoints-overlay.js
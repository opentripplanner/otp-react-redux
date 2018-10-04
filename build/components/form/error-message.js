'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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

var _state = require('../../util/state');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ErrorMessage = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(ErrorMessage, _Component);

  function ErrorMessage() {
    (0, _classCallCheck3.default)(this, ErrorMessage);
    return (0, _possibleConstructorReturn3.default)(this, (ErrorMessage.__proto__ || (0, _getPrototypeOf2.default)(ErrorMessage)).apply(this, arguments));
  }

  (0, _createClass3.default)(ErrorMessage, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          error = _props.error,
          errorMessages = _props.errorMessages,
          currentQuery = _props.currentQuery;

      if (!error) return null;

      var message = error.msg;
      // check for configuration-defined message override
      if (errorMessages) {
        var msgConfig = errorMessages.find(function (m) {
          return m.id === error.id;
        });
        if (msgConfig) {
          if (msgConfig.modes) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = (0, _getIterator3.default)(msgConfig.modes), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var mode = _step.value;

                if (currentQuery.mode.includes(mode)) {
                  message = msgConfig.msg;
                  break;
                }
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          } else message = msgConfig.msg;
        }
      }

      return _react2.default.createElement(
        'div',
        { className: 'error-message' },
        _react2.default.createElement(
          'div',
          { className: 'header' },
          _react2.default.createElement('i', { className: 'fa fa-exclamation-circle' }),
          ' Could Not Plan Trip'
        ),
        _react2.default.createElement(
          'div',
          { className: 'message' },
          message
        )
      );
    }
  }]);
  return ErrorMessage;
}(_react.Component), _class.propTypes = {
  error: _react.PropTypes.object
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  return {
    error: activeSearch && activeSearch.response && activeSearch.response.error,
    currentQuery: state.otp.currentQuery,
    errorMessages: state.otp.config.errorMessages
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
  return {};
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ErrorMessage);
module.exports = exports['default'];

//# sourceMappingURL=error-message.js
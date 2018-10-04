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

var _class, _temp2;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _navigationBar = require('./navigation-bar');

var _navigationBar2 = _interopRequireDefault(_navigationBar);

var _dateTimeModal = require('../form/date-time-modal');

var _dateTimeModal2 = _interopRequireDefault(_dateTimeModal);

var _planTripButton = require('../form/plan-trip-button');

var _planTripButton2 = _interopRequireDefault(_planTripButton);

var _ui = require('../../actions/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MobileDateTimeScreen = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(MobileDateTimeScreen, _Component);

  function MobileDateTimeScreen() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, MobileDateTimeScreen);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = MobileDateTimeScreen.__proto__ || (0, _getPrototypeOf2.default)(MobileDateTimeScreen)).call.apply(_ref, [this].concat(args))), _this), _this._planTripClicked = function () {
      _this.props.setMobileScreen(_ui.MobileScreens.RESULTS_SUMMARY);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(MobileDateTimeScreen, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _container2.default,
        null,
        _react2.default.createElement(_navigationBar2.default, {
          headerText: 'Set Date/Time',
          showBackButton: true,
          backScreen: _ui.MobileScreens.SEARCH_FORM
        }),
        _react2.default.createElement(
          'div',
          { className: 'options-main-content mobile-padding' },
          _react2.default.createElement(_dateTimeModal2.default, null)
        ),
        _react2.default.createElement(
          'div',
          { className: 'options-lower-tray mobile-padding' },
          _react2.default.createElement(_planTripButton2.default, { onClick: this._planTripClicked })
        )
      );
    }
  }]);
  return MobileDateTimeScreen;
}(_react.Component), _class.propTypes = {
  setMobileScreen: _propTypes2.default.func
}, _temp2);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {};
};

var mapDispatchToProps = {
  setMobileScreen: _ui.setMobileScreen
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(MobileDateTimeScreen);
module.exports = exports['default'];

//# sourceMappingURL=date-time-screen.js
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

var _settingsSelectorPanel = require('../form/settings-selector-panel');

var _settingsSelectorPanel2 = _interopRequireDefault(_settingsSelectorPanel);

var _planTripButton = require('../form/plan-trip-button');

var _planTripButton2 = _interopRequireDefault(_planTripButton);

var _ui = require('../../actions/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MobileOptionsScreen = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(MobileOptionsScreen, _Component);

  function MobileOptionsScreen() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, MobileOptionsScreen);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = MobileOptionsScreen.__proto__ || (0, _getPrototypeOf2.default)(MobileOptionsScreen)).call.apply(_ref, [this].concat(args))), _this), _this._planTripClicked = function () {
      _this.props.setMobileScreen(_ui.MobileScreens.RESULTS_SUMMARY);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(MobileOptionsScreen, [{
    key: 'render',
    value: function render() {
      var icons = this.props.icons;


      return _react2.default.createElement(
        _container2.default,
        null,
        _react2.default.createElement(_navigationBar2.default, {
          headerText: 'Set Search Options',
          showBackButton: true,
          backScreen: _ui.MobileScreens.SEARCH_FORM
        }),
        _react2.default.createElement(
          'div',
          { className: 'options-main-content mobile-padding' },
          _react2.default.createElement(_settingsSelectorPanel2.default, { icons: icons })
        ),
        _react2.default.createElement(
          'div',
          { className: 'options-lower-tray mobile-padding' },
          _react2.default.createElement(_planTripButton2.default, { onClick: this._planTripClicked })
        )
      );
    }
  }]);
  return MobileOptionsScreen;
}(_react.Component), _class.propTypes = {
  icons: _propTypes2.default.object
}, _temp2);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {};
};

var mapDispatchToProps = {
  setMobileScreen: _ui.setMobileScreen
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(MobileOptionsScreen);
module.exports = exports['default'];

//# sourceMappingURL=options-screen.js
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

var _reactBootstrap = require('react-bootstrap');

var _reactFontawesome = require('react-fontawesome');

var _reactFontawesome2 = _interopRequireDefault(_reactFontawesome);

var _appMenu = require('../app/app-menu');

var _appMenu2 = _interopRequireDefault(_appMenu);

var _ui = require('../../actions/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MobileNavigationBar = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(MobileNavigationBar, _Component);

  function MobileNavigationBar() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, MobileNavigationBar);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = MobileNavigationBar.__proto__ || (0, _getPrototypeOf2.default)(MobileNavigationBar)).call.apply(_ref, [this].concat(args))), _this), _this._backButtonPressed = function () {
      console.log('back button pressed');
      var _this$props = _this.props,
          backScreen = _this$props.backScreen,
          onBackClicked = _this$props.onBackClicked;

      if (backScreen) _this.props.setMobileScreen(_this.props.backScreen);else if (typeof onBackClicked === 'function') onBackClicked();
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(MobileNavigationBar, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          showBackButton = _props.showBackButton,
          headerAction = _props.headerAction,
          headerText = _props.headerText,
          title = _props.title;


      return _react2.default.createElement(
        _reactBootstrap.Navbar,
        { fluid: true, fixedTop: true },
        _react2.default.createElement(
          _reactBootstrap.Navbar.Header,
          null,
          _react2.default.createElement(
            _reactBootstrap.Navbar.Brand,
            null,
            showBackButton ? _react2.default.createElement(
              'div',
              { className: 'mobile-back' },
              _react2.default.createElement(_reactFontawesome2.default, { name: 'arrow-left', onClick: this._backButtonPressed })
            ) : _react2.default.createElement(_appMenu2.default, null)
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'mobile-header' },
          headerText ? _react2.default.createElement(
            'div',
            { className: 'mobile-header-text' },
            headerText
          ) : _react2.default.createElement(
            'div',
            null,
            title
          )
        ),
        headerAction && _react2.default.createElement(
          'div',
          { className: 'mobile-close' },
          _react2.default.createElement(
            'div',
            { className: 'mobile-header-action' },
            headerAction
          )
        )
      );
    }
  }]);
  return MobileNavigationBar;
}(_react.Component), _class.propTypes = {
  backScreen: _propTypes2.default.number,
  headerAction: _propTypes2.default.element,
  headerText: _propTypes2.default.string,
  showBackButton: _propTypes2.default.bool,
  setMobileScreen: _propTypes2.default.func,
  title: _propTypes2.default.element
}, _temp2);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {};
};

var mapDispatchToProps = {
  setMobileScreen: _ui.setMobileScreen
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(MobileNavigationBar);
module.exports = exports['default'];

//# sourceMappingURL=navigation-bar.js
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reactBootstrap = require('react-bootstrap');

var _icon = require('../narrative/icon');

var _icon2 = _interopRequireDefault(_icon);

var _ui = require('../../actions/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: make menu items configurable via props/config

var AppMenu = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(AppMenu, _Component);

  function AppMenu() {
    (0, _classCallCheck3.default)(this, AppMenu);
    return (0, _possibleConstructorReturn3.default)(this, (AppMenu.__proto__ || (0, _getPrototypeOf2.default)(AppMenu)).apply(this, arguments));
  }

  (0, _createClass3.default)(AppMenu, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          reactRouterConfig = _props.reactRouterConfig,
          languageConfig = _props.languageConfig;


      return _react2.default.createElement(
        'div',
        { className: 'app-menu' },
        _react2.default.createElement(
          _reactBootstrap.DropdownButton,
          { title: _react2.default.createElement(_icon2.default, { type: 'bars' }), noCaret: true, className: 'app-menu-button', id: 'app-menu' },
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { onClick: function onClick() {
                _this2.props.setMainPanelContent(_ui.MainPanelContent.ROUTE_VIEWER);
              } },
            _react2.default.createElement(_icon2.default, { type: 'bus' }),
            ' ',
            languageConfig.routeViewer || 'Route Viewer'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { onClick: function onClick() {
                var startOverUrl = '/';
                if (reactRouterConfig && reactRouterConfig.basename) {
                  startOverUrl += reactRouterConfig.basename;
                }
                window.location.href = startOverUrl;
              } },
            _react2.default.createElement(_icon2.default, { type: 'undo' }),
            ' Start Over'
          )
        )
      );
    }
  }]);
  return AppMenu;
}(_react.Component), _class.propTypes = {
  setMainPanelContent: _propTypes2.default.func
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    languageConfig: state.otp.config.language
  };
};

var mapDispatchToProps = {
  setMainPanelContent: _ui.setMainPanelContent
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(AppMenu);
module.exports = exports['default'];

//# sourceMappingURL=app-menu.js
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

var _reactBootstrap = require('react-bootstrap');

var _modesPanel = require('./modes-panel');

var _modesPanel2 = _interopRequireDefault(_modesPanel);

var _generalSettingsPanel = require('./general-settings-panel');

var _generalSettingsPanel2 = _interopRequireDefault(_generalSettingsPanel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SettingsSelectorPanel = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(SettingsSelectorPanel, _Component);

  function SettingsSelectorPanel(props) {
    (0, _classCallCheck3.default)(this, SettingsSelectorPanel);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SettingsSelectorPanel.__proto__ || (0, _getPrototypeOf2.default)(SettingsSelectorPanel)).call(this, props));

    _this.state = { activePanel: 'MODES' };
    return _this;
  }

  (0, _createClass3.default)(SettingsSelectorPanel, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var panels = [{
        key: 'MODES',
        text: 'Modes',
        component: _react2.default.createElement(_modesPanel2.default, { icons: this.props.icons })
      }, {
        key: 'GENERAL',
        text: 'General',
        component: _react2.default.createElement(_generalSettingsPanel2.default, null)
      }];

      return _react2.default.createElement(
        'div',
        { className: 'settings-selector-panel' },
        _react2.default.createElement(
          'div',
          { className: 'button-row' },
          _react2.default.createElement(
            _reactBootstrap.ButtonGroup,
            { justified: true },
            panels.map(function (panel) {
              return _react2.default.createElement(
                _reactBootstrap.ButtonGroup,
                { key: panel.key },
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  {
                    className: panel.key === _this2.state.activePanel ? 'selected' : '',
                    onClick: function onClick() {
                      return _this2.setState({ activePanel: panel.key });
                    }
                  },
                  panel.text
                )
              );
            })
          )
        ),
        panels.find(function (p) {
          return p.key === _this2.state.activePanel;
        }).component
      );
    }
  }]);
  return SettingsSelectorPanel;
}(_react.Component), _class.propTypes = {
  icons: _react.PropTypes.object
}, _temp);
exports.default = SettingsSelectorPanel;
module.exports = exports['default'];

//# sourceMappingURL=settings-selector-panel.js
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactBootstrap = require('react-bootstrap');

var _dateTimePreview = require('./date-time-preview');

var _dateTimePreview2 = _interopRequireDefault(_dateTimePreview);

var _settingsPreview = require('./settings-preview');

var _settingsPreview2 = _interopRequireDefault(_settingsPreview);

var _dateTimeModal = require('./date-time-modal');

var _dateTimeModal2 = _interopRequireDefault(_dateTimeModal);

var _settingsSelectorPanel = require('./settings-selector-panel');

var _settingsSelectorPanel2 = _interopRequireDefault(_settingsSelectorPanel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TabbedFormPanel = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(TabbedFormPanel, _Component);

  function TabbedFormPanel(props) {
    (0, _classCallCheck3.default)(this, TabbedFormPanel);

    var _this = (0, _possibleConstructorReturn3.default)(this, (TabbedFormPanel.__proto__ || (0, _getPrototypeOf2.default)(TabbedFormPanel)).call(this, props));

    _this._onEditDateTimeClick = function () {
      var expandedDisplay = _this._isExpanded('DATETIME') ? null : 'DATETIME';
      _this.setState({ expandedDisplay: expandedDisplay });
    };

    _this._onEditSettingsClick = function () {
      var expandedDisplay = _this._isExpanded('SETTINGS') ? null : 'SETTINGS';
      _this.setState({ expandedDisplay: expandedDisplay });
    };

    _this._isExpanded = function (value) {
      return _this.state.expandedDisplay === value;
    };

    _this._onHideClick = function () {
      return _this.setState({ expandedDisplay: null });
    };

    _this.state = {
      expandedDisplay: null
    };
    return _this;
  }

  (0, _createClass3.default)(TabbedFormPanel, [{
    key: 'render',
    value: function render() {
      var expandedDisplay = this.state.expandedDisplay;
      var icons = this.props.icons;


      return _react2.default.createElement(
        'div',
        { className: 'tabbed-form-panel' },
        _react2.default.createElement(
          'div',
          { className: 'tab-row' },
          _react2.default.createElement(
            'div',
            { className: 'tab left ' + (this._isExpanded('DATETIME') ? ' selected' : '') },
            _react2.default.createElement(
              'div',
              { className: 'tab-content' },
              _react2.default.createElement(_dateTimePreview2.default, {
                onClick: this._onEditDateTimeClick
              })
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'tab right ' + (this._isExpanded('SETTINGS') ? ' selected' : '') },
            _react2.default.createElement(
              'div',
              { className: 'tab-content' },
              _react2.default.createElement(_settingsPreview2.default, { onClick: this._onEditSettingsClick })
            )
          )
        ),
        expandedDisplay && _react2.default.createElement(
          'div',
          { className: 'active-panel' },
          this._isExpanded('DATETIME') && _react2.default.createElement(_dateTimeModal2.default, null),
          this._isExpanded('SETTINGS') && _react2.default.createElement(_settingsSelectorPanel2.default, { icons: icons }),
          _react2.default.createElement(
            'div',
            { className: 'hide-button-row' },
            _react2.default.createElement(
              _reactBootstrap.Button,
              { className: 'hide-button clear-button-formatting', onClick: this._onHideClick },
              _react2.default.createElement('i', { className: 'fa fa-caret-up' }),
              ' Hide Settings'
            )
          )
        )
      );
    }
  }]);
  return TabbedFormPanel;
}(_react.Component), _class.propTypes = {
  icons: _propTypes2.default.object
}, _temp);
exports.default = TabbedFormPanel;
module.exports = exports['default'];

//# sourceMappingURL=tabbed-form-panel.js
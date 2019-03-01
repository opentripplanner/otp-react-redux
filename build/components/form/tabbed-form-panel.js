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

var _reactBootstrap = require('react-bootstrap');

var _reactRedux = require('react-redux');

var _dateTimePreview = require('./date-time-preview');

var _dateTimePreview2 = _interopRequireDefault(_dateTimePreview);

var _settingsPreview = require('./settings-preview');

var _settingsPreview2 = _interopRequireDefault(_settingsPreview);

var _dateTimeModal = require('./date-time-modal');

var _dateTimeModal2 = _interopRequireDefault(_dateTimeModal);

var _settingsSelectorPanel = require('./settings-selector-panel');

var _settingsSelectorPanel2 = _interopRequireDefault(_settingsSelectorPanel);

var _ui = require('../../actions/ui');

var _state = require('../../util/state');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TabbedFormPanel = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(TabbedFormPanel, _Component);

  function TabbedFormPanel() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, TabbedFormPanel);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = TabbedFormPanel.__proto__ || (0, _getPrototypeOf2.default)(TabbedFormPanel)).call.apply(_ref, [this].concat(args))), _this), _this._onEditDateTimeClick = function () {
      var _this$props = _this.props,
          mainPanelContent = _this$props.mainPanelContent,
          setMainPanelContent = _this$props.setMainPanelContent;

      setMainPanelContent(mainPanelContent === 'EDIT_DATETIME' ? null : 'EDIT_DATETIME');
    }, _this._onEditSettingsClick = function () {
      var _this$props2 = _this.props,
          mainPanelContent = _this$props2.mainPanelContent,
          setMainPanelContent = _this$props2.setMainPanelContent;

      setMainPanelContent(mainPanelContent === 'EDIT_SETTINGS' ? null : 'EDIT_SETTINGS');
    }, _this._onHideClick = function () {
      return _this.props.setMainPanelContent(null);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(TabbedFormPanel, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          icons = _props.icons,
          itineraries = _props.itineraries,
          mainPanelContent = _props.mainPanelContent;


      return _react2.default.createElement(
        'div',
        { className: 'tabbed-form-panel' },
        _react2.default.createElement(
          'div',
          { className: 'tab-row' },
          _react2.default.createElement(
            'div',
            { className: 'tab left ' + (mainPanelContent === 'EDIT_DATETIME' ? ' selected' : '') },
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
            { className: 'tab right ' + (mainPanelContent === 'EDIT_SETTINGS' ? ' selected' : '') },
            _react2.default.createElement(
              'div',
              { className: 'tab-content' },
              _react2.default.createElement(_settingsPreview2.default, { onClick: this._onEditSettingsClick })
            )
          )
        ),
        (mainPanelContent === 'EDIT_DATETIME' || mainPanelContent === 'EDIT_SETTINGS') && _react2.default.createElement(
          'div',
          { className: 'active-panel' },
          mainPanelContent === 'EDIT_DATETIME' && _react2.default.createElement(_dateTimeModal2.default, null),
          mainPanelContent === 'EDIT_SETTINGS' && _react2.default.createElement(_settingsSelectorPanel2.default, { icons: icons }),
          _react2.default.createElement(
            'div',
            { className: 'hide-button-row' },
            _react2.default.createElement(
              _reactBootstrap.Button,
              { className: 'hide-button clear-button-formatting', onClick: this._onHideClick },
              _react2.default.createElement('i', { className: 'fa fa-caret-up' }),
              ' ',
              itineraries && itineraries.length > 0 ? _react2.default.createElement(
                'span',
                null,
                'Show Results'
              ) : _react2.default.createElement(
                'span',
                null,
                'Hide Settings'
              )
            )
          )
        )
      );
    }
  }]);
  return TabbedFormPanel;
}(_react.Component), _class.propTypes = {
  icons: _propTypes2.default.object
}, _temp2);

// connect to redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    itineraries: (0, _state.getActiveItineraries)(state.otp),
    mainPanelContent: state.otp.ui.mainPanelContent
  };
};

var mapDispatchToProps = {
  setMainPanelContent: _ui.setMainPanelContent
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TabbedFormPanel);
module.exports = exports['default'];

//# sourceMappingURL=tabbed-form-panel.js
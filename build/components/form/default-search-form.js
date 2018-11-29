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

var _locationField = require('./location-field');

var _locationField2 = _interopRequireDefault(_locationField);

var _switchButton = require('./switch-button');

var _switchButton2 = _interopRequireDefault(_switchButton);

var _tabbedFormPanel = require('./tabbed-form-panel');

var _tabbedFormPanel2 = _interopRequireDefault(_tabbedFormPanel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DefaultSearchForm = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(DefaultSearchForm, _Component);

  function DefaultSearchForm() {
    (0, _classCallCheck3.default)(this, DefaultSearchForm);

    var _this = (0, _possibleConstructorReturn3.default)(this, (DefaultSearchForm.__proto__ || (0, _getPrototypeOf2.default)(DefaultSearchForm)).call(this));

    _this.state = {
      desktopDateTimeExpanded: false,
      desktopSettingsExpanded: false
    };
    return _this;
  }

  (0, _createClass3.default)(DefaultSearchForm, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          icons = _props.icons,
          mobile = _props.mobile;

      var actionText = mobile ? 'tap' : 'click';

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'div',
          { className: 'locations' },
          _react2.default.createElement(_locationField2.default, {
            type: 'from',
            label: 'Enter start location or ' + actionText + ' on map...',
            showClearButton: true
          }),
          _react2.default.createElement(_locationField2.default, {
            type: 'to',
            label: 'Enter destination or ' + actionText + ' on map...',
            showClearButton: !mobile
          }),
          _react2.default.createElement(
            'div',
            { className: 'switch-button-container' },
            _react2.default.createElement(_switchButton2.default, { content: _react2.default.createElement('i', { className: 'fa fa-exchange fa-rotate-90' }) })
          )
        ),
        _react2.default.createElement(_tabbedFormPanel2.default, { icons: icons })
      );
    }
  }]);
  return DefaultSearchForm;
}(_react.Component), _class.propTypes = {
  icons: _propTypes2.default.object,
  mobile: _propTypes2.default.bool
}, _class.defaultProps = {
  showFrom: true,
  showTo: true
}, _temp);
exports.default = DefaultSearchForm;
module.exports = exports['default'];

//# sourceMappingURL=default-search-form.js
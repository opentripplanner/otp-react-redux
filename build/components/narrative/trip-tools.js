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

var _class3, _temp4;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactBootstrap = require('react-bootstrap');

var _copyToClipboard = require('copy-to-clipboard');

var _copyToClipboard2 = _interopRequireDefault(_copyToClipboard);

var _bowser = require('bowser');

var _bowser2 = _interopRequireDefault(_bowser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TripTools = function (_Component) {
  (0, _inherits3.default)(TripTools, _Component);

  function TripTools() {
    (0, _classCallCheck3.default)(this, TripTools);
    return (0, _possibleConstructorReturn3.default)(this, (TripTools.__proto__ || (0, _getPrototypeOf2.default)(TripTools)).apply(this, arguments));
  }

  (0, _createClass3.default)(TripTools, [{
    key: 'render',
    value: function render() {
      var reportConfig = this.props.reportConfig;


      var buttons = [];

      buttons.push(_react2.default.createElement(ShareSaveDropdownButton, null));
      buttons.push(_react2.default.createElement(PrintButton, null));
      if (reportConfig && reportConfig.mailto) {
        buttons.push(_react2.default.createElement(ReportIssueButton, reportConfig));
      }

      return _react2.default.createElement(
        'div',
        { className: 'trip-tools' },
        buttons.map(function (btn, i) {
          var classNames = ['button-container'];
          if (i < buttons.length - 1) classNames.push('pad-right');
          return _react2.default.createElement(
            'div',
            { key: i, className: classNames.join(' ') },
            btn
          );
        })
      );
    }
  }]);
  return TripTools;
}(_react.Component);

// Share/Save Dropdown Component

var ShareSaveDropdownButton = function (_Component2) {
  (0, _inherits3.default)(ShareSaveDropdownButton, _Component2);

  function ShareSaveDropdownButton() {
    var _ref;

    var _temp, _this2, _ret;

    (0, _classCallCheck3.default)(this, ShareSaveDropdownButton);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this2 = (0, _possibleConstructorReturn3.default)(this, (_ref = ShareSaveDropdownButton.__proto__ || (0, _getPrototypeOf2.default)(ShareSaveDropdownButton)).call.apply(_ref, [this].concat(args))), _this2), _this2._onCopyToClipboardClick = function () {
      (0, _copyToClipboard2.default)(window.location.href);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this2, _ret);
  }

  (0, _createClass3.default)(ShareSaveDropdownButton, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactBootstrap.DropdownButton,
        {
          className: 'tool-button',
          title: _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement('i', { className: 'fa fa-share' }),
            ' Share/Save'
          ),
          id: 'tool-share-dropdown'
        },
        _react2.default.createElement(
          _reactBootstrap.MenuItem,
          { onClick: this._onCopyToClipboardClick },
          _react2.default.createElement('i', { className: 'fa fa-clipboard' }),
          ' Copy Link to Clipboard'
        )
      );
    }
  }]);
  return ShareSaveDropdownButton;
}(_react.Component);

// Print Button Component

var PrintButton = function (_Component3) {
  (0, _inherits3.default)(PrintButton, _Component3);

  function PrintButton() {
    var _ref2;

    var _temp2, _this3, _ret2;

    (0, _classCallCheck3.default)(this, PrintButton);

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return _ret2 = (_temp2 = (_this3 = (0, _possibleConstructorReturn3.default)(this, (_ref2 = PrintButton.__proto__ || (0, _getPrototypeOf2.default)(PrintButton)).call.apply(_ref2, [this].concat(args))), _this3), _this3._onClick = function () {
      // Note: this is designed to work only with hash routing.
      var printUrl = window.location.href.replace('#', '#/print');
      window.open(printUrl, '_blank');
    }, _temp2), (0, _possibleConstructorReturn3.default)(_this3, _ret2);
  }

  (0, _createClass3.default)(PrintButton, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          _reactBootstrap.Button,
          {
            className: 'tool-button',
            onClick: this._onClick
          },
          _react2.default.createElement('i', { className: 'fa fa-print' }),
          ' Print'
        )
      );
    }
  }]);
  return PrintButton;
}(_react.Component);

// Report Issue Button Component

var ReportIssueButton = (_temp4 = _class3 = function (_Component4) {
  (0, _inherits3.default)(ReportIssueButton, _Component4);

  function ReportIssueButton() {
    var _ref3;

    var _temp3, _this4, _ret3;

    (0, _classCallCheck3.default)(this, ReportIssueButton);

    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return _ret3 = (_temp3 = (_this4 = (0, _possibleConstructorReturn3.default)(this, (_ref3 = ReportIssueButton.__proto__ || (0, _getPrototypeOf2.default)(ReportIssueButton)).call.apply(_ref3, [this].concat(args))), _this4), _this4._onClick = function () {
      var _this4$props = _this4.props,
          mailto = _this4$props.mailto,
          subject = _this4$props.subject;


      var bodyLines = ['                       *** INSTRUCTIONS TO USER ***', 'This feature allows you to email a report to site administrators for review.', 'Please add any additional feedback for this trip under the \'Additional Comments\'', 'section below and send using your regular email program.', '', 'SEARCH DATA:', 'Address: ' + window.location.href, 'Browser: ' + _bowser2.default.name + ' ' + _bowser2.default.version, 'OS: ' + _bowser2.default.osname + ' ' + _bowser2.default.osversion, '', 'ADDITIONAL COMMENTS:', ''];

      window.open('mailto:' + mailto + '?subject=' + subject + '&body=' + encodeURIComponent(bodyLines.join('\n')), '_self');
    }, _temp3), (0, _possibleConstructorReturn3.default)(_this4, _ret3);
  }

  (0, _createClass3.default)(ReportIssueButton, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactBootstrap.Button,
        {
          className: 'tool-button',
          onClick: this._onClick
        },
        _react2.default.createElement('i', { className: 'fa fa-flag' }),
        ' Report Issue'
      );
    }
  }]);
  return ReportIssueButton;
}(_react.Component), _class3.defaultProps = {
  subject: 'Reporting an Issue with OpenTripPlanner'
}, _temp4);

// Connect main class to redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    reportConfig: state.otp.config.reportIssue
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps)(TripTools);
module.exports = exports['default'];

//# sourceMappingURL=trip-tools.js
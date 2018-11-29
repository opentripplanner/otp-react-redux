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

var _class, _temp, _class4, _temp4;
// import { DropdownButton, MenuItem } from 'react-bootstrap'


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactBootstrap = require('react-bootstrap');

var _copyToClipboard = require('copy-to-clipboard');

var _copyToClipboard2 = _interopRequireDefault(_copyToClipboard);

var _bowser = require('bowser');

var _bowser2 = _interopRequireDefault(_bowser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TripTools = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(TripTools, _Component);

  function TripTools() {
    (0, _classCallCheck3.default)(this, TripTools);
    return (0, _possibleConstructorReturn3.default)(this, (TripTools.__proto__ || (0, _getPrototypeOf2.default)(TripTools)).apply(this, arguments));
  }

  (0, _createClass3.default)(TripTools, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          buttonTypes = _props.buttonTypes,
          reportConfig = _props.reportConfig,
          reactRouterConfig = _props.reactRouterConfig;


      var buttonComponents = [];
      buttonTypes.forEach(function (type) {
        switch (type) {
          case 'COPY_URL':
            buttonComponents.push(_react2.default.createElement(CopyUrlButton, null));
            break;
          case 'PRINT':
            buttonComponents.push(_react2.default.createElement(PrintButton, null));
            break;
          case 'REPORT_ISSUE':
            if (!reportConfig || !reportConfig.mailto) break;
            buttonComponents.push(_react2.default.createElement(ReportIssueButton, reportConfig));
            break;
          case 'START_OVER':
            // Determine "home" URL
            var startOverUrl = '/';
            if (reactRouterConfig && reactRouterConfig.basename) {
              startOverUrl += reactRouterConfig.basename;
            }
            buttonComponents.push(_react2.default.createElement(LinkButton, { icon: 'undo', text: 'Start Over', url: startOverUrl }));
            break;
        }
      });

      return _react2.default.createElement(
        'div',
        { className: 'trip-tools' },
        buttonComponents.map(function (btn, i) {
          return _react2.default.createElement(
            'div',
            { key: i, className: 'button-container' },
            btn
          );
        })
      );
    }
  }]);
  return TripTools;
}(_react.Component), _class.defaultProps = {
  buttonTypes: ['COPY_URL', 'PRINT', 'REPORT_ISSUE', 'START_OVER']
}, _temp);

// Share/Save Dropdown Component -- not used currently

/*
class ShareSaveDropdownButton extends Component {
  _onCopyToClipboardClick = () => {
    copyToClipboard(window.location.href)
  }

  render () {
    return (
      <DropdownButton
        className='tool-button'
        title={<span><i className='fa fa-share' /> Share/Save</span>}
        id={'tool-share-dropdown'}
      >
        <MenuItem onClick={this._onCopyToClipboardClick}>
          <i className='fa fa-clipboard' /> Copy Link to Clipboard
        </MenuItem>
      </DropdownButton>
    )
  }
}
*/

// Copy URL Button

var CopyUrlButton = function (_Component2) {
  (0, _inherits3.default)(CopyUrlButton, _Component2);

  function CopyUrlButton(props) {
    (0, _classCallCheck3.default)(this, CopyUrlButton);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (CopyUrlButton.__proto__ || (0, _getPrototypeOf2.default)(CopyUrlButton)).call(this, props));

    _this2._onClick = function () {
      (0, _copyToClipboard2.default)(window.location.href);
      _this2.setState({ showCopied: true });
      setTimeout(function () {
        _this2.setState({ showCopied: false });
      }, 2000);
    };

    _this2.state = { showCopied: false };
    return _this2;
  }

  (0, _createClass3.default)(CopyUrlButton, [{
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
          this.state.showCopied ? _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement('i', { className: 'fa fa-check' }),
            ' Copied'
          ) : _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement('i', { className: 'fa fa-clipboard' }),
            ' Copy Link'
          )
        )
      );
    }
  }]);
  return CopyUrlButton;
}(_react.Component);

// Print Button Component

var PrintButton = function (_Component3) {
  (0, _inherits3.default)(PrintButton, _Component3);

  function PrintButton() {
    var _ref;

    var _temp2, _this3, _ret;

    (0, _classCallCheck3.default)(this, PrintButton);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp2 = (_this3 = (0, _possibleConstructorReturn3.default)(this, (_ref = PrintButton.__proto__ || (0, _getPrototypeOf2.default)(PrintButton)).call.apply(_ref, [this].concat(args))), _this3), _this3._onClick = function () {
      // Note: this is designed to work only with hash routing.
      var printUrl = window.location.href.replace('#', '#/print');
      window.open(printUrl, '_blank');
    }, _temp2), (0, _possibleConstructorReturn3.default)(_this3, _ret);
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

var ReportIssueButton = (_temp4 = _class4 = function (_Component4) {
  (0, _inherits3.default)(ReportIssueButton, _Component4);

  function ReportIssueButton() {
    var _ref2;

    var _temp3, _this4, _ret2;

    (0, _classCallCheck3.default)(this, ReportIssueButton);

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return _ret2 = (_temp3 = (_this4 = (0, _possibleConstructorReturn3.default)(this, (_ref2 = ReportIssueButton.__proto__ || (0, _getPrototypeOf2.default)(ReportIssueButton)).call.apply(_ref2, [this].concat(args))), _this4), _this4._onClick = function () {
      var _this4$props = _this4.props,
          mailto = _this4$props.mailto,
          subject = _this4$props.subject;


      var bodyLines = ['                       *** INSTRUCTIONS TO USER ***', 'This feature allows you to email a report to site administrators for review.', 'Please add any additional feedback for this trip under the \'Additional Comments\'', 'section below and send using your regular email program.', '', 'SEARCH DATA:', 'Address: ' + window.location.href, 'Browser: ' + _bowser2.default.name + ' ' + _bowser2.default.version, 'OS: ' + _bowser2.default.osname + ' ' + _bowser2.default.osversion, '', 'ADDITIONAL COMMENTS:', ''];

      window.open('mailto:' + mailto + '?subject=' + subject + '&body=' + encodeURIComponent(bodyLines.join('\n')), '_self');
    }, _temp3), (0, _possibleConstructorReturn3.default)(_this4, _ret2);
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
}(_react.Component), _class4.defaultProps = {
  subject: 'Reporting an Issue with OpenTripPlanner'
}, _temp4);

// Link to URL Button

var LinkButton = function (_Component5) {
  (0, _inherits3.default)(LinkButton, _Component5);

  function LinkButton() {
    var _ref3;

    var _temp5, _this5, _ret3;

    (0, _classCallCheck3.default)(this, LinkButton);

    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return _ret3 = (_temp5 = (_this5 = (0, _possibleConstructorReturn3.default)(this, (_ref3 = LinkButton.__proto__ || (0, _getPrototypeOf2.default)(LinkButton)).call.apply(_ref3, [this].concat(args))), _this5), _this5._onClick = function () {
      window.location.href = _this5.props.url;
    }, _temp5), (0, _possibleConstructorReturn3.default)(_this5, _ret3);
  }

  (0, _createClass3.default)(LinkButton, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          icon = _props2.icon,
          text = _props2.text;

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          _reactBootstrap.Button,
          {
            className: 'tool-button',
            onClick: this._onClick
          },
          icon && _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement('i', { className: 'fa fa-' + icon }),
            ' '
          ),
          text
        )
      );
    }
  }]);
  return LinkButton;
}(_react.Component);

// Connect main class to redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    reportConfig: state.otp.config.reportIssue,
    reactRouterConfig: state.otp.config.reactRouter
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps)(TripTools);
module.exports = exports['default'];

//# sourceMappingURL=trip-tools.js
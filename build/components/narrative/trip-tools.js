"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _reactBootstrap = require("react-bootstrap");

var _copyToClipboard = _interopRequireDefault(require("copy-to-clipboard"));

var _bowser = _interopRequireDefault(require("bowser"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TripTools =
/*#__PURE__*/
function (_Component) {
  _inherits(TripTools, _Component);

  function TripTools() {
    _classCallCheck(this, TripTools);

    return _possibleConstructorReturn(this, _getPrototypeOf(TripTools).apply(this, arguments));
  }

  _createClass(TripTools, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          buttonTypes = _this$props.buttonTypes,
          reportConfig = _this$props.reportConfig,
          reactRouterConfig = _this$props.reactRouterConfig;
      var buttonComponents = [];
      buttonTypes.forEach(function (type) {
        switch (type) {
          case 'COPY_URL':
            buttonComponents.push(_react.default.createElement(CopyUrlButton, null));
            break;

          case 'PRINT':
            buttonComponents.push(_react.default.createElement(PrintButton, null));
            break;

          case 'REPORT_ISSUE':
            if (!reportConfig || !reportConfig.mailto) break;
            buttonComponents.push(_react.default.createElement(ReportIssueButton, reportConfig));
            break;

          case 'START_OVER':
            // Determine "home" URL
            var startOverUrl = '/';

            if (reactRouterConfig && reactRouterConfig.basename) {
              startOverUrl += reactRouterConfig.basename;
            }

            buttonComponents.push(_react.default.createElement(LinkButton, {
              icon: "undo",
              text: "Start Over",
              url: startOverUrl
            }));
            break;
        }
      });
      return _react.default.createElement("div", {
        className: "trip-tools"
      }, buttonComponents.map(function (btn, i) {
        return _react.default.createElement("div", {
          key: i,
          className: "button-container"
        }, btn);
      }));
    }
  }]);

  return TripTools;
}(_react.Component); // Share/Save Dropdown Component -- not used currently

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


_defineProperty(TripTools, "defaultProps", {
  buttonTypes: ['COPY_URL', 'PRINT', 'REPORT_ISSUE', 'START_OVER']
});

var CopyUrlButton =
/*#__PURE__*/
function (_Component2) {
  _inherits(CopyUrlButton, _Component2);

  function CopyUrlButton(props) {
    var _this;

    _classCallCheck(this, CopyUrlButton);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(CopyUrlButton).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "_resetState", function () {
      return _this.setState({
        showCopied: false
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_onClick", function () {
      // If special routerId has been set in session storage, construct copy URL
      // for itinerary with #/start/ prefix to set routerId on page load.
      var routerId = window.sessionStorage.getItem('routerId');
      var url = window.location.href;

      if (routerId) {
        var parts = url.split('#');

        if (parts.length === 2) {
          url = "".concat(parts[0], "#/start/x/x/x/").concat(routerId).concat(parts[1]);
        } else {
          console.warn('URL not formatted as expected, copied URL will not contain session routerId.', routerId);
        }
      }

      (0, _copyToClipboard.default)(url);

      _this.setState({
        showCopied: true
      });

      window.setTimeout(_this._resetState, 2000);
    });

    _this.state = {
      showCopied: false
    };
    return _this;
  }

  _createClass(CopyUrlButton, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("div", null, _react.default.createElement(_reactBootstrap.Button, {
        className: "tool-button",
        onClick: this._onClick
      }, this.state.showCopied ? _react.default.createElement("span", null, _react.default.createElement("i", {
        className: "fa fa-check"
      }), " Copied") : _react.default.createElement("span", null, _react.default.createElement("i", {
        className: "fa fa-clipboard"
      }), " Copy Link")));
    }
  }]);

  return CopyUrlButton;
}(_react.Component); // Print Button Component


var PrintButton =
/*#__PURE__*/
function (_Component3) {
  _inherits(PrintButton, _Component3);

  function PrintButton() {
    var _getPrototypeOf2;

    var _this2;

    _classCallCheck(this, PrintButton);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this2 = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(PrintButton)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this2), "_onClick", function () {
      // Note: this is designed to work only with hash routing.
      var printUrl = window.location.href.replace('#', '#/print');
      window.open(printUrl, '_blank');
    });

    return _this2;
  }

  _createClass(PrintButton, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("div", null, _react.default.createElement(_reactBootstrap.Button, {
        className: "tool-button",
        onClick: this._onClick
      }, _react.default.createElement("i", {
        className: "fa fa-print"
      }), " Print"));
    }
  }]);

  return PrintButton;
}(_react.Component); // Report Issue Button Component


var ReportIssueButton =
/*#__PURE__*/
function (_Component4) {
  _inherits(ReportIssueButton, _Component4);

  function ReportIssueButton() {
    var _getPrototypeOf3;

    var _this3;

    _classCallCheck(this, ReportIssueButton);

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    _this3 = _possibleConstructorReturn(this, (_getPrototypeOf3 = _getPrototypeOf(ReportIssueButton)).call.apply(_getPrototypeOf3, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this3), "_onClick", function () {
      var _this3$props = _this3.props,
          mailto = _this3$props.mailto,
          subject = _this3$props.subject;
      var bodyLines = ['                       *** INSTRUCTIONS TO USER ***', 'This feature allows you to email a report to site administrators for review.', "Please add any additional feedback for this trip under the 'Additional Comments'", 'section below and send using your regular email program.', '', 'SEARCH DATA:', 'Address: ' + window.location.href, 'Browser: ' + _bowser.default.name + ' ' + _bowser.default.version, 'OS: ' + _bowser.default.osname + ' ' + _bowser.default.osversion, '', 'ADDITIONAL COMMENTS:', ''];
      window.open("mailto:".concat(mailto, "?subject=").concat(subject, "&body=").concat(encodeURIComponent(bodyLines.join('\n'))), '_self');
    });

    return _this3;
  }

  _createClass(ReportIssueButton, [{
    key: "render",
    value: function render() {
      return _react.default.createElement(_reactBootstrap.Button, {
        className: "tool-button",
        onClick: this._onClick
      }, _react.default.createElement("i", {
        className: "fa fa-flag"
      }), " Report Issue");
    }
  }]);

  return ReportIssueButton;
}(_react.Component); // Link to URL Button


_defineProperty(ReportIssueButton, "defaultProps", {
  subject: 'Reporting an Issue with OpenTripPlanner'
});

var LinkButton =
/*#__PURE__*/
function (_Component5) {
  _inherits(LinkButton, _Component5);

  function LinkButton() {
    var _getPrototypeOf4;

    var _this4;

    _classCallCheck(this, LinkButton);

    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    _this4 = _possibleConstructorReturn(this, (_getPrototypeOf4 = _getPrototypeOf(LinkButton)).call.apply(_getPrototypeOf4, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this4), "_onClick", function () {
      window.location.href = _this4.props.url;
    });

    return _this4;
  }

  _createClass(LinkButton, [{
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          icon = _this$props2.icon,
          text = _this$props2.text;
      return _react.default.createElement("div", null, _react.default.createElement(_reactBootstrap.Button, {
        className: "tool-button",
        onClick: this._onClick
      }, icon && _react.default.createElement("span", null, _react.default.createElement("i", {
        className: "fa fa-".concat(icon)
      }), " "), text));
    }
  }]);

  return LinkButton;
}(_react.Component); // Connect main class to redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    reportConfig: state.otp.config.reportIssue,
    reactRouterConfig: state.otp.config.reactRouter
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps)(TripTools);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=trip-tools.js
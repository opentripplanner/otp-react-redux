"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.object.freeze");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.function.name");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _reactBootstrap = require("react-bootstrap");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _ui = require("../../actions/ui");

var _linkMenuItem = _interopRequireWildcard(require("./link-menu-item"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  height: 2em;\n  margin: -15px 0;\n  width: 2em;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var Avatar = _styledComponents.default.img(_templateObject());
/**
 * This component displays the sign-in status in the nav bar.
 * - When a user is not logged in: display 'Sign In' as a link or button.
 * - When a user is logged in, display an 'avatar' (retrieved from the profile prop)
 *   and a dropdown button so the user can access more options.
 */


var NavLoginButton =
/*#__PURE__*/
function (_Component) {
  _inherits(NavLoginButton, _Component);

  function NavLoginButton() {
    _classCallCheck(this, NavLoginButton);

    return _possibleConstructorReturn(this, _getPrototypeOf(NavLoginButton).apply(this, arguments));
  }

  _createClass(NavLoginButton, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          className = _this$props.className,
          id = _this$props.id,
          links = _this$props.links,
          onSignInClick = _this$props.onSignInClick,
          onSignOutClick = _this$props.onSignOutClick,
          profile = _this$props.profile,
          style = _this$props.style;
      var commonProps = {
        className: className,
        id: id,
        style: style // If a profile is passed (a user is logged in), display avatar and drop-down menu.

      };

      if (profile) {
        var displayedName = profile.nickname || profile.name;
        return _react.default.createElement(_reactBootstrap.NavDropdown, _extends({}, commonProps, {
          pullRight: true,
          title: _react.default.createElement("span", null, _react.default.createElement(Avatar, {
            alt: displayedName,
            src: profile.picture,
            title: "".concat(displayedName, "\n(").concat(profile.email, ")")
          }))
        }), _react.default.createElement(_reactBootstrap.MenuItem, {
          header: true
        }, displayedName), links && links.map(function (link, i) {
          return _react.default.createElement(_linkMenuItem.default, {
            key: i,
            link: link
          });
        }), _react.default.createElement(_reactBootstrap.MenuItem, {
          divider: true
        }), _react.default.createElement(_reactBootstrap.MenuItem, {
          onSelect: onSignOutClick
        }, "Sign out"));
      } // Display the sign-in link if no profile is passed (user is not logged in).


      return _react.default.createElement(_reactBootstrap.NavItem, _extends({}, commonProps, {
        onClick: onSignInClick
      }), "Sign in");
    }
  }]);

  return NavLoginButton;
}(_react.Component); // connect to the redux store


_defineProperty(NavLoginButton, "propTypes", {
  id: _propTypes.default.string.isRequired,
  links: _propTypes.default.arrayOf(_linkMenuItem.linkType),
  onSignInClick: _propTypes.default.func.isRequired,
  onSignOutClick: _propTypes.default.func.isRequired,
  profile: _propTypes.default.shape({
    email: _propTypes.default.string.isRequired,
    name: _propTypes.default.string.isRequired,
    nickname: _propTypes.default.string,
    picture: _propTypes.default.string
  })
});

_defineProperty(NavLoginButton, "defaultProps", {
  links: null,
  profile: null
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {};
};

var mapDispatchToProps = {
  routeTo: _ui.routeTo
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(NavLoginButton);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=nav-login-button.js
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.replace");

var routerActions = _interopRequireWildcard(require("connected-react-router"));

var _react = _interopRequireWildcard(require("react"));

var _reactFontawesome = _interopRequireDefault(require("react-fontawesome"));

var _reactRedux = require("react-redux");

var uiActions = _interopRequireWildcard(require("../../actions/ui"));

var _user = require("../../util/user");

var _withLoggedInUserSupport = _interopRequireDefault(require("./with-logged-in-user-support"));

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

/**
 * This screen is flashed just after user sign in while state.user.loggedInUser is being fetched.
 * Once state.user.loggedInUser is available:
 * - For new users, route them to the account page (it will show account setup).
 *   while trying to preserve the search portion of the URL before login.
 * - For existing users, simply take them to the route (itinerary search, stop/trip viewer) that was in place before login.
 *
 * Rerouting is performed so that the current URL does not appear in the browser history.
 */
var AfterSignInScreen =
/*#__PURE__*/
function (_Component) {
  _inherits(AfterSignInScreen, _Component);

  function AfterSignInScreen() {
    _classCallCheck(this, AfterSignInScreen);

    return _possibleConstructorReturn(this, _getPrototypeOf(AfterSignInScreen).apply(this, arguments));
  }

  _createClass(AfterSignInScreen, [{
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      var _this$props = this.props,
          loggedInUser = _this$props.loggedInUser,
          replace = _this$props.replace,
          routeTo = _this$props.routeTo,
          pathBeforeSignIn = _this$props.pathBeforeSignIn; // Redirect when loggedInUser is populated (i.e. after several calls to componentDidUpdate())

      if (loggedInUser) {
        if ((0, _user.isNewUser)(loggedInUser)) {
          var previousSearch = pathBeforeSignIn.split('?')[1];
          var newSearch = previousSearch ? "?".concat(previousSearch) : null; // if not null, must include '?'.

          routeTo('/account', newSearch, routerActions.replace);
        } else {
          replace(pathBeforeSignIn);
        }
      }
    }
  }, {
    key: "render",
    value: function render() {
      // TODO: Improve the visuals.
      return _react.default.createElement("div", null, _react.default.createElement("h1", null, "Signed In...", _react.default.createElement("br", null), _react.default.createElement(_reactFontawesome.default, {
        name: "hourglass-half",
        size: "4x"
      })));
    }
  }]);

  return AfterSignInScreen;
}(_react.Component); // connect to the redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  var _state$user = state.user,
      loggedInUser = _state$user.loggedInUser,
      pathBeforeSignIn = _state$user.pathBeforeSignIn;
  return {
    loggedInUser: loggedInUser,
    pathBeforeSignIn: pathBeforeSignIn
  };
};

var mapDispatchToProps = {
  replace: routerActions.replace,
  routeTo: uiActions.routeTo
};

var _default = (0, _withLoggedInUserSupport.default)((0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(AfterSignInScreen));

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=after-signin-screen.js
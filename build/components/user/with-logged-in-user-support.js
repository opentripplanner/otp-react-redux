"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = withLoggedInUserSupport;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _useAuth0Hooks = require("use-auth0-hooks");

var userActions = _interopRequireWildcard(require("../../actions/user"));

var _constants = require("../../util/constants");

var _ui = require("../../util/ui");

var _awaitingScreen = _interopRequireDefault(require("./awaiting-screen"));

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
 * This higher-order component ensures that state.user is loaded
 * in the redux store for any wrapped component that may need it.
 * The requireLoggedInUser argument handles the two use cases for this component:
 * - Some components (e.g. those processing a user account) require a logged in user to be available,
 *   and without it they cannot function.
     For such components, set requireLoggedInUser to true.
 *   An awaiting screen will be displayed while state.user data are being fetched,
 *   and the wrapped component will be shown upon availability of state.user.
 * - Other components (e.g. landing pages) don't require a logged in user to be available to function
 *   but will display extra functionality if so.
 *   For such components, omit requireLoggedInUser parameter (or set to false).
 *   The wrapped component is shown immediately, and no awaiting screen is displayed while state.user is being retrieved.
 * @param {React.Component} WrappedComponent The component to be wrapped to that uses state.user from the redux store.
 * @param {boolean} requireLoggedInUser Whether the wrapped component requires state.user to properly function.
 */
function withLoggedInUserSupport(WrappedComponent, requireLoggedInUser) {
  return function (props) {
    return _react.default.createElement(UserLoaderScreenWithAuth, {
      requireLoggedInUser: requireLoggedInUser
    }, _react.default.createElement(WrappedComponent, props));
  };
}
/**
 * This component ensures that values under state.user are set when a user is logged in.
 * If needed by the children, this component displays a wait screen while state.user values are being fetched.
 * Upon completion (or if no user is logged in or if auth is disabled), it renders children.
 */


var UserLoaderScreen =
/*#__PURE__*/
function (_Component) {
  _inherits(UserLoaderScreen, _Component);

  function UserLoaderScreen() {
    _classCallCheck(this, UserLoaderScreen);

    return _possibleConstructorReturn(this, _getPrototypeOf(UserLoaderScreen).apply(this, arguments));
  }

  _createClass(UserLoaderScreen, [{
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      var _this$props = this.props,
          auth = _this$props.auth,
          fetchOrInitializeUser = _this$props.fetchOrInitializeUser,
          loggedInUser = _this$props.loggedInUser; // Once accessToken is available, proceed to fetch or initialize loggedInUser.

      if (auth && auth.accessToken && !loggedInUser) {
        fetchOrInitializeUser(auth);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          auth = _this$props2.auth,
          children = _this$props2.children,
          loggedInUser = _this$props2.loggedInUser,
          requireLoggedInUser = _this$props2.requireLoggedInUser;

      if (auth) {
        if (requireLoggedInUser && auth.isAuthenticated && !loggedInUser) {
          // Display a hint while fetching user data for logged in user (from componentDidMount).
          // Don't display this if loggedInUser is already available.
          // TODO: Improve this screen.
          return _react.default.createElement(_awaitingScreen.default, null);
        } else {
          return (0, _ui.renderChildrenWithProps)(children, {
            auth: auth
          });
        }
      }

      return children;
    }
  }]);

  return UserLoaderScreen;
}(_react.Component); // connect to the redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    loggedInUser: state.user.loggedInUser
  };
};

var mapDispatchToProps = {
  fetchOrInitializeUser: userActions.fetchOrInitializeUser
};
var UserLoaderScreenWithAuth = (0, _useAuth0Hooks.withAuth)((0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(UserLoaderScreen), {
  audience: _constants.AUTH0_AUDIENCE,
  scope: _constants.AUTH0_SCOPE
});
module.exports = exports.default;

//# sourceMappingURL=with-logged-in-user-support.js
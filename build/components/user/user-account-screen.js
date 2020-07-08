"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.promise");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("regenerator-runtime/runtime");

var _cloneDeep = _interopRequireDefault(require("lodash/cloneDeep"));

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _useAuth0Hooks = require("use-auth0-hooks");

var _ui = require("../../actions/ui");

var _user = require("../../actions/user");

var _user2 = require("../../util/user");

var _desktopNav = _interopRequireDefault(require("../app/desktop-nav"));

var _accountSetupFinishPane = _interopRequireDefault(require("./account-setup-finish-pane"));

var _existingAccountDisplay = _interopRequireDefault(require("./existing-account-display"));

var _favoriteLocationsPane = _interopRequireDefault(require("./favorite-locations-pane"));

var _newAccountWizard = _interopRequireDefault(require("./new-account-wizard"));

var _notificationPrefsPane = _interopRequireDefault(require("./notification-prefs-pane"));

var _phoneVerificationPane = _interopRequireDefault(require("./phone-verification-pane"));

var _termsOfUsePane = _interopRequireDefault(require("./terms-of-use-pane"));

var _verifyEmailScreen = _interopRequireDefault(require("./verify-email-screen"));

var _withLoggedInUserSupport = _interopRequireDefault(require("./with-logged-in-user-support"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * This screen handles creating/updating OTP user account settings.
 */
var UserAccountScreen =
/*#__PURE__*/
function (_Component) {
  _inherits(UserAccountScreen, _Component);

  function UserAccountScreen(_props) {
    var _this;

    _classCallCheck(this, UserAccountScreen);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(UserAccountScreen).call(this, _props));

    _defineProperty(_assertThisInitialized(_this), "_updateUserState", function (newUserData) {
      var userData = _this.state.userData;

      _this.setState({
        userData: _objectSpread({}, userData, {}, newUserData)
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_updateUserPrefs",
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var createOrUpdateUser, userData;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // TODO: Change state of Save button while the update action takes place.
              createOrUpdateUser = _this.props.createOrUpdateUser;
              userData = _this.state.userData;
              _context.next = 4;
              return createOrUpdateUser(userData);

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })));

    _defineProperty(_assertThisInitialized(_this), "_handleExit", function () {
      // On exit, route to default search route.
      _this.props.routeTo('/');
    });

    _defineProperty(_assertThisInitialized(_this), "_handleExitAndSave",
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this._updateUserPrefs();

            case 2:
              _this._handleExit();

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    })));

    _defineProperty(_assertThisInitialized(_this), "_hookUserData", function (Pane) {
      return function (props) {
        var userData = _this.state.userData;
        return _react.default.createElement(Pane, _extends({
          onUserDataChange: _this._updateUserState,
          userData: userData
        }, props));
      };
    });

    _defineProperty(_assertThisInitialized(_this), "_panes", {
      terms: _this._hookUserData(_termsOfUsePane.default),
      notifications: _this._hookUserData(_notificationPrefsPane.default),
      verifyPhone: _phoneVerificationPane.default,
      locations: _this._hookUserData(_favoriteLocationsPane.default),
      finish: _accountSetupFinishPane.default // TODO: Update title bar during componentDidMount.

    });

    _this.state = {
      userData: (0, _cloneDeep.default)(_props.loggedInUser)
    };
    return _this;
  }

  _createClass(UserAccountScreen, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          auth = _this$props.auth,
          loggedInUser = _this$props.loggedInUser;
      var userData = this.state.userData;
      var formContents;

      if ((0, _user2.isNewUser)(loggedInUser)) {
        if (!auth.user.email_verified) {
          // Check and prompt for email verification first to avoid extra user wait.
          formContents = _react.default.createElement(_verifyEmailScreen.default, null);
        } else {
          // New users are shown "wizard" (step-by-step) mode
          // (includes when a "new" user clicks 'My Account' from the account menu in the nav bar).
          formContents = _react.default.createElement(_newAccountWizard.default, {
            onComplete: this._handleExitAndSave,
            panes: this._panes,
            userData: userData
          });
        }
      } else {
        formContents = // Existing users are shown all panes together.
        _react.default.createElement(_existingAccountDisplay.default, {
          onCancel: this._handleExit,
          onComplete: this._handleExitAndSave,
          panes: this._panes
        });
      }

      return _react.default.createElement("div", {
        className: "otp"
      }, _react.default.createElement(_desktopNav.default, null), _react.default.createElement("form", {
        className: "container"
      }, formContents));
    }
  }]);

  return UserAccountScreen;
}(_react.Component); // connect to the redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    loggedInUser: state.user.loggedInUser
  };
};

var mapDispatchToProps = {
  createOrUpdateUser: _user.createOrUpdateUser,
  routeTo: _ui.routeTo
};

var _default = (0, _withLoggedInUserSupport.default)((0, _useAuth0Hooks.withLoginRequired)((0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(UserAccountScreen)), true);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=user-account-screen.js
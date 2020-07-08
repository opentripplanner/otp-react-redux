"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchOrInitializeUser = fetchOrInitializeUser;
exports.createOrUpdateUser = createOrUpdateUser;
exports.setPathBeforeSignIn = void 0;

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

require("regenerator-runtime/runtime");

require("core-js/modules/es6.string.sub");

var _reduxActions = require("redux-actions");

var _middleware = require("../util/middleware");

var _user = require("../util/user");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var setCurrentUser = (0, _reduxActions.createAction)('SET_CURRENT_USER');
var setPathBeforeSignIn = (0, _reduxActions.createAction)('SET_PATH_BEFORE_SIGNIN');
exports.setPathBeforeSignIn = setPathBeforeSignIn;

function getStateForNewUser(auth0User) {
  return {
    auth0UserId: auth0User.sub,
    email: auth0User.email,
    hasConsentedToTerms: false,
    // User must agree to terms.
    isEmailVerified: auth0User.email_verified,
    notificationChannel: 'email',
    phoneNumber: '',
    recentLocations: [],
    savedLocations: [],
    storeTripHistory: false // User must opt in.

  };
}
/**
 * Fetches user preferences to state.user, or set initial values under state.user if no user has been loaded.
 */


function fetchOrInitializeUser(auth) {
  return (
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(dispatch, getState) {
        var _getState, otp, accessToken, user, result, resultData, isNewAccount;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _getState = getState(), otp = _getState.otp;
                accessToken = auth.accessToken, user = auth.user;
                _context.prev = 2;
                _context.next = 5;
                return (0, _middleware.fetchUser)(otp.config.persistence.otp_middleware, accessToken);

              case 5:
                result = _context.sent;
                // Beware! On AWS API gateway, if a user is not found in the middleware
                // (e.g. they just created their Auth0 password but have not completed the account setup form yet),
                // the call above will return, for example:
                // {
                //    status: 'success',
                //    data: {
                //      "result": "ERR",
                //      "message": "No user with id=000000 found.",
                //      "code": 404,
                //      "detail": null
                //    }
                // }
                //
                // The same call to a middleware instance that is not behind an API gateway
                // will return:
                // {
                //    status: 'error',
                //    message: 'Error get-ing user...'
                // }
                // TODO: Improve AWS response.
                resultData = result.data;
                isNewAccount = result.status === 'error' || resultData && resultData.result === 'ERR';

                if (!isNewAccount) {
                  // TODO: Move next line somewhere else.
                  if (resultData.savedLocations === null) resultData.savedLocations = [];
                  dispatch(setCurrentUser({
                    accessToken: accessToken,
                    user: resultData
                  }));
                } else {
                  dispatch(setCurrentUser({
                    accessToken: accessToken,
                    user: getStateForNewUser(user)
                  }));
                }

                _context.next = 14;
                break;

              case 11:
                _context.prev = 11;
                _context.t0 = _context["catch"](2);
                // TODO: improve error handling.
                alert("An error was encountered:\n".concat(_context.t0));

              case 14:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[2, 11]]);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }()
  );
}
/**
 * Updates (or creates) a user entry in the middleware,
 * then, if that was successful, updates the redux state with that user.
 */


function createOrUpdateUser(userData) {
  return (
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(dispatch, getState) {
        var _getState2, otp, user, _otp$config$persisten, otpMiddleware, accessToken, loggedInUser, result, _userData;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _getState2 = getState(), otp = _getState2.otp, user = _getState2.user;
                _otp$config$persisten = otp.config.persistence.otp_middleware, otpMiddleware = _otp$config$persisten === void 0 ? null : _otp$config$persisten;

                if (!otpMiddleware) {
                  _context2.next = 14;
                  break;
                }

                accessToken = user.accessToken, loggedInUser = user.loggedInUser;

                if (!(0, _user.isNewUser)(loggedInUser)) {
                  _context2.next = 10;
                  break;
                }

                _context2.next = 7;
                return (0, _middleware.addUser)(otpMiddleware, accessToken, userData);

              case 7:
                result = _context2.sent;
                _context2.next = 13;
                break;

              case 10:
                _context2.next = 12;
                return (0, _middleware.updateUser)(otpMiddleware, accessToken, userData);

              case 12:
                result = _context2.sent;

              case 13:
                // TODO: improve the UI feedback messages for this.
                if (result.status === 'success' && result.data) {
                  // Update application state with the user entry as saved
                  // (as returned) by the middleware.
                  _userData = result.data;
                  dispatch(setCurrentUser({
                    accessToken: accessToken,
                    user: _userData
                  }));
                  alert('Your preferences have been saved.');
                } else {
                  alert("An error was encountered:\n".concat(JSON.stringify(result)));
                }

              case 14:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }()
  );
}

//# sourceMappingURL=user.js
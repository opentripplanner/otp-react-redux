"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _immutabilityHelper = _interopRequireDefault(require("immutability-helper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: port user-specific code from the otp reducer.
function createUserReducer() {
  var initialState = {};
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments.length > 1 ? arguments[1] : undefined;

    switch (action.type) {
      case 'SET_CURRENT_USER':
        {
          return (0, _immutabilityHelper.default)(state, {
            accessToken: {
              $set: action.payload.accessToken
            },
            loggedInUser: {
              $set: action.payload.user
            }
          });
        }

      case 'SET_PATH_BEFORE_SIGNIN':
        {
          return (0, _immutabilityHelper.default)(state, {
            pathBeforeSignIn: {
              $set: action.payload
            }
          });
        }

      default:
        return state;
    }
  };
}

var _default = createUserReducer;
exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=create-user-reducer.js
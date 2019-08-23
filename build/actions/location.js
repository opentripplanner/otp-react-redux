"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCurrentPosition = getCurrentPosition;
exports.addLocationSearch = exports.receivedPositionResponse = exports.fetchingPosition = exports.receivedPositionError = void 0;

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

require("regenerator-runtime/runtime");

var _reduxActions = require("redux-actions");

var _map = require("./map");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var receivedPositionError = (0, _reduxActions.createAction)('POSITION_ERROR');
exports.receivedPositionError = receivedPositionError;
var fetchingPosition = (0, _reduxActions.createAction)('POSITION_FETCHING');
exports.fetchingPosition = fetchingPosition;
var receivedPositionResponse = (0, _reduxActions.createAction)('POSITION_RESPONSE');
exports.receivedPositionResponse = receivedPositionResponse;

function getCurrentPosition() {
  var setAsType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var onSuccess = arguments.length > 1 ? arguments[1] : undefined;
  return (
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(dispatch, getState) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (navigator.geolocation) {
                  dispatch(fetchingPosition({
                    type: setAsType
                  }));
                  navigator.geolocation.getCurrentPosition( // On success
                  function (position) {
                    if (position) {
                      console.log('current loc', position, setAsType);
                      dispatch(receivedPositionResponse({
                        position: position
                      }));

                      if (setAsType) {
                        console.log('setting location to current position');
                        dispatch((0, _map.setLocationToCurrent)({
                          type: setAsType
                        }));
                        onSuccess && onSuccess();
                      }
                    } else {
                      dispatch(receivedPositionError({
                        error: {
                          message: 'Unknown error getting position'
                        }
                      }));
                    }
                  }, // On error
                  function (error) {
                    console.log('error getting current position', error);
                    dispatch(receivedPositionError({
                      error: error
                    }));
                  }, // Options
                  {
                    enableHighAccuracy: true
                  });
                } else {
                  console.log('current position not supported');
                  dispatch(receivedPositionError({
                    error: {
                      message: 'Geolocation not supported by your browser'
                    }
                  }));
                }

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }()
  );
}

var addLocationSearch = (0, _reduxActions.createAction)('ADD_LOCATION_SEARCH');
exports.addLocationSearch = addLocationSearch;

//# sourceMappingURL=location.js
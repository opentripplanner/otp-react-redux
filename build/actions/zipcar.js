"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.zipcarLocationsQuery = zipcarLocationsQuery;
exports.requestZipcarLocationsResponse = exports.receivedZipcarLocationsResponse = exports.receivedZipcarLocationsError = void 0;

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

require("regenerator-runtime/runtime");

var _reduxActions = require("redux-actions");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

if (typeof fetch === 'undefined') require('isomorphic-fetch');
var receivedZipcarLocationsError = (0, _reduxActions.createAction)('ZIPCAR_LOCATIONS_ERROR');
exports.receivedZipcarLocationsError = receivedZipcarLocationsError;
var receivedZipcarLocationsResponse = (0, _reduxActions.createAction)('ZIPCAR_LOCATIONS_RESPONSE');
exports.receivedZipcarLocationsResponse = receivedZipcarLocationsResponse;
var requestZipcarLocationsResponse = (0, _reduxActions.createAction)('ZIPCAR_LOCATIONS_REQUEST');
exports.requestZipcarLocationsResponse = requestZipcarLocationsResponse;

function zipcarLocationsQuery(url) {
  return (
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(dispatch, getState) {
        var json, response, error;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                dispatch(requestZipcarLocationsResponse());
                _context.prev = 1;
                _context.next = 4;
                return fetch(url);

              case 4:
                response = _context.sent;

                if (!(response.status >= 400)) {
                  _context.next = 9;
                  break;
                }

                error = new Error('Received error from server');
                error.response = response;
                throw error;

              case 9:
                _context.next = 11;
                return response.json();

              case 11:
                json = _context.sent;
                _context.next = 17;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context["catch"](1);
                return _context.abrupt("return", dispatch(receivedZipcarLocationsError(_context.t0)));

              case 17:
                dispatch(receivedZipcarLocationsResponse(json));

              case 18:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[1, 14]]);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }()
  );
}

//# sourceMappingURL=zipcar.js
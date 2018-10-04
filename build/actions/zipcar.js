'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestZipcarLocationsResponse = exports.receivedZipcarLocationsResponse = exports.receivedZipcarLocationsError = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.zipcarLocationsQuery = zipcarLocationsQuery;

var _reduxActions = require('redux-actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (typeof fetch === 'undefined') require('isomorphic-fetch');

var receivedZipcarLocationsError = exports.receivedZipcarLocationsError = (0, _reduxActions.createAction)('ZIPCAR_LOCATIONS_ERROR');
var receivedZipcarLocationsResponse = exports.receivedZipcarLocationsResponse = (0, _reduxActions.createAction)('ZIPCAR_LOCATIONS_RESPONSE');
var requestZipcarLocationsResponse = exports.requestZipcarLocationsResponse = (0, _reduxActions.createAction)('ZIPCAR_LOCATIONS_REQUEST');

function zipcarLocationsQuery() {
  return function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(dispatch, getState) {
      var otpState, url, json, response, error;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              otpState = getState().otp;


              dispatch(requestZipcarLocationsResponse());
              url = otpState.config.map.zipcarOverlay && otpState.config.map.zipcarOverlay.api;
              json = void 0;
              _context.prev = 4;
              _context.next = 7;
              return fetch(url);

            case 7:
              response = _context.sent;

              if (!(response.status >= 400)) {
                _context.next = 12;
                break;
              }

              error = new Error('Received error from server');

              error.response = response;
              throw error;

            case 12:
              _context.next = 14;
              return response.json();

            case 14:
              json = _context.sent;
              _context.next = 20;
              break;

            case 17:
              _context.prev = 17;
              _context.t0 = _context['catch'](4);
              return _context.abrupt('return', dispatch(receivedZipcarLocationsError(_context.t0)));

            case 20:

              dispatch(receivedZipcarLocationsResponse(json));

            case 21:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[4, 17]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
}

//# sourceMappingURL=zipcar.js
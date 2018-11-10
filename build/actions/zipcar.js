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

function zipcarLocationsQuery(url) {
  return function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(dispatch, getState) {
      var json, response, error;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              dispatch(requestZipcarLocationsResponse());
              json = void 0;
              _context.prev = 2;
              _context.next = 5;
              return fetch(url);

            case 5:
              response = _context.sent;

              if (!(response.status >= 400)) {
                _context.next = 10;
                break;
              }

              error = new Error('Received error from server');

              error.response = response;
              throw error;

            case 10:
              _context.next = 12;
              return response.json();

            case 12:
              json = _context.sent;
              _context.next = 18;
              break;

            case 15:
              _context.prev = 15;
              _context.t0 = _context['catch'](2);
              return _context.abrupt('return', dispatch(receivedZipcarLocationsError(_context.t0)));

            case 18:

              dispatch(receivedZipcarLocationsResponse(json));

            case 19:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[2, 15]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
}

//# sourceMappingURL=zipcar.js
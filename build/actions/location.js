'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addLocationSearch = exports.receivedPositionResponse = exports.fetchingPosition = exports.receivedPositionError = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.getCurrentPosition = getCurrentPosition;

var _reduxActions = require('redux-actions');

var _map = require('./map');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var receivedPositionError = exports.receivedPositionError = (0, _reduxActions.createAction)('POSITION_ERROR');
var fetchingPosition = exports.fetchingPosition = (0, _reduxActions.createAction)('POSITION_FETCHING');
var receivedPositionResponse = exports.receivedPositionResponse = (0, _reduxActions.createAction)('POSITION_RESPONSE');

function getCurrentPosition() {
  var setAsType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  return function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(dispatch, getState) {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (navigator.geolocation) {
                dispatch(fetchingPosition({ type: setAsType }));
                navigator.geolocation.getCurrentPosition(
                // On success
                function (position) {
                  if (position) {
                    console.log('current loc', position, setAsType);
                    dispatch(receivedPositionResponse({ position: position }));
                    if (setAsType) {
                      console.log('setting location to current position');
                      dispatch((0, _map.setLocationToCurrent)({ type: setAsType }));
                    }
                  } else {
                    dispatch(receivedPositionError({ error: { message: 'Unknown error getting position' } }));
                  }
                },
                // On error
                function (error) {
                  console.log('error getting current position', error);
                  dispatch(receivedPositionError({ error: error }));
                },
                // Options
                { enableHighAccuracy: true });
              } else {
                console.log('current position not supported');
                dispatch(receivedPositionError({ error: { message: 'Geolocation not supported by your browser' } }));
              }

            case 1:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();
}

var addLocationSearch = exports.addLocationSearch = (0, _reduxActions.createAction)('ADD_LOCATION_SEARCH');

//# sourceMappingURL=location.js
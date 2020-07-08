"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSecureFetchOptions = getSecureFetchOptions;
exports.secureFetch = secureFetch;
exports.fetchUser = fetchUser;
exports.addUser = addUser;
exports.updateUser = updateUser;

require("regenerator-runtime/runtime");

require("core-js/modules/es6.promise");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

if (typeof fetch === 'undefined') require('isomorphic-fetch');
var API_USER_PATH = '/api/secure/user';
/**
 * This method builds the options object for call to the fetch method.
 * @param {string} accessToken If non-null, a bearer Authorization header will be added with the specified token.
 * @param {string} apiKey If non-null, an x-api-key header will be added with the specified key.
 * @param {string} method The HTTP method to execute.
 * @param {*} options Extra options to pass to fetch.
 */

function getSecureFetchOptions(accessToken, apiKey) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'get';
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var headers = {
    // JSON request bodies only.
    'Content-Type': 'application/json'
  };

  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  if (accessToken) {
    headers.Authorization = "Bearer ".concat(accessToken);
  }

  return _objectSpread({
    method: method,
    mode: 'cors',
    // Middleware is at a different URL.
    headers: headers
  }, options);
}
/**
 * This convenience method wraps a fetch call to the specified URL
 * with the token and api key added (if provided) to the HTTP request header,
 * and wraps the response by adding the success/error status of the call.
 * @param {string} url The URL to call.
 * @param {string} accessToken If non-null, the Authorization token to add to request header.
 * @param {string} apiKey If non-null, the API key to add to the Authorization header.
 * @param {string} method The HTTP method to execute.
 * @param {*} options Extra options to pass to fetch.
 */


function secureFetch(_x, _x2, _x3) {
  return _secureFetch.apply(this, arguments);
}

function _secureFetch() {
  _secureFetch = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(url, accessToken, apiKey) {
    var method,
        options,
        res,
        result,
        message,
        _args = arguments;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            method = _args.length > 3 && _args[3] !== undefined ? _args[3] : 'get';
            options = _args.length > 4 && _args[4] !== undefined ? _args[4] : {};
            _context.next = 4;
            return fetch(url, getSecureFetchOptions(accessToken, apiKey, method, options));

          case 4:
            res = _context.sent;

            if (!(res.status && res.status >= 400 || res.code && res.code >= 400)) {
              _context.next = 12;
              break;
            }

            _context.next = 8;
            return res.json();

          case 8:
            result = _context.sent;
            message = "Error ".concat(method, "-ing user: ").concat(result.message);
            if (result.detail) message += "  (".concat(result.detail, ")");
            return _context.abrupt("return", {
              status: 'error',
              message: message
            });

          case 12:
            _context.next = 14;
            return res.json();

          case 14:
            _context.t0 = _context.sent;
            return _context.abrupt("return", {
              status: 'success',
              data: _context.t0
            });

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _secureFetch.apply(this, arguments);
}

function fetchUser(_x4, _x5) {
  return _fetchUser.apply(this, arguments);
}

function _fetchUser() {
  _fetchUser = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(middlewareConfig, token) {
    var apiBaseUrl, apiKey, requestUrl;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            apiBaseUrl = middlewareConfig.apiBaseUrl, apiKey = middlewareConfig.apiKey;
            requestUrl = "".concat(apiBaseUrl).concat(API_USER_PATH, "/fromtoken");
            return _context2.abrupt("return", secureFetch(requestUrl, token, apiKey));

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _fetchUser.apply(this, arguments);
}

function addUser(_x6, _x7, _x8) {
  return _addUser.apply(this, arguments);
}

function _addUser() {
  _addUser = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(middlewareConfig, token, data) {
    var apiBaseUrl, apiKey, requestUrl;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            apiBaseUrl = middlewareConfig.apiBaseUrl, apiKey = middlewareConfig.apiKey;
            requestUrl = "".concat(apiBaseUrl).concat(API_USER_PATH);
            return _context3.abrupt("return", secureFetch(requestUrl, token, apiKey, 'POST', {
              body: JSON.stringify(data)
            }));

          case 3:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _addUser.apply(this, arguments);
}

function updateUser(_x9, _x10, _x11) {
  return _updateUser.apply(this, arguments);
}

function _updateUser() {
  _updateUser = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(middlewareConfig, token, data) {
    var apiBaseUrl, apiKey, id, requestUrl;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            apiBaseUrl = middlewareConfig.apiBaseUrl, apiKey = middlewareConfig.apiKey;
            id = data.id; // Middleware ID, NOT auth0 (or similar) id.

            requestUrl = "".concat(apiBaseUrl).concat(API_USER_PATH, "/").concat(id);

            if (!id) {
              _context4.next = 7;
              break;
            }

            return _context4.abrupt("return", secureFetch(requestUrl, token, apiKey, 'PUT', {
              body: JSON.stringify(data)
            }));

          case 7:
            return _context4.abrupt("return", {
              status: 'error',
              message: 'Corrupted state: User ID not available for exiting user.'
            });

          case 8:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _updateUser.apply(this, arguments);
}

//# sourceMappingURL=middleware.js
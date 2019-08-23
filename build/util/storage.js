"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.storeItem = storeItem;
exports.getItem = getItem;
exports.removeItem = removeItem;
exports.randId = randId;

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

// Prefix to use with local storage keys.
var STORAGE_PREFIX = 'otp';
/**
 * Store a javascript object at the specified key.
 */

function storeItem(key, object) {
  window.localStorage.setItem("".concat(STORAGE_PREFIX, ".").concat(key), JSON.stringify(object));
}
/**
 * Retrieve a javascript object at the specified key. If not found, defaults to
 * null or, the optionally provided notFoundValue.
 */


function getItem(key) {
  var notFoundValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var itemAsString;

  try {
    itemAsString = window.localStorage.getItem("".concat(STORAGE_PREFIX, ".").concat(key));
    var json = JSON.parse(itemAsString);
    if (json) return json;else return notFoundValue;
  } catch (e) {
    // Catch any errors associated with parsing bad JSON.
    console.warn(e, itemAsString);
    return notFoundValue;
  }
}
/**
 * Remove item at specified key.
 */


function removeItem(key) {
  window.localStorage.removeItem("".concat(STORAGE_PREFIX, ".").concat(key));
}
/**
 * Generate a random ID. This might not quite be a UUID, but it serves our
 * purposes for now.
 */


function randId() {
  return Math.random().toString(36).substr(2, 9);
}

//# sourceMappingURL=storage.js
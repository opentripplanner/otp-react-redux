"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderChildrenWithProps = renderChildrenWithProps;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

var _react = require("react");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Renders children with additional props.
 * Modified from
 * https://stackoverflow.com/questions/32370994/how-to-pass-props-to-this-props-children#32371612
 * @param children the child elements to modify.
 * @param newProps the props to add.
 */
function renderChildrenWithProps(children, newProps) {
  var childrenWithProps = _react.Children.map(children, function (child) {
    // Checking isValidElement is the safe way and avoids a TS error too.
    if ((0, _react.isValidElement)(child)) {
      return (0, _react.cloneElement)(child, _objectSpread({}, newProps));
    }

    return child;
  });

  return childrenWithProps;
}

//# sourceMappingURL=ui.js
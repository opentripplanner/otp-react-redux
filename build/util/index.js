"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var auth = _interopRequireWildcard(require("./auth"));

var itinerary = _interopRequireWildcard(require("./itinerary"));

var state = _interopRequireWildcard(require("./state"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var OtpUtils = {
  auth: auth,
  itinerary: itinerary,
  state: state
};
var _default = OtpUtils;
exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=index.js
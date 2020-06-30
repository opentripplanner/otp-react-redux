"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.object.assign");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _lodash = _interopRequireDefault(require("lodash.isequal"));

var _connectedTripDetails = _interopRequireDefault(require("../connected-trip-details"));

var _tripTools = _interopRequireDefault(require("../trip-tools"));

var _placeRow = _interopRequireDefault(require("./place-row"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ItineraryBody =
/*#__PURE__*/
function (_Component) {
  _inherits(ItineraryBody, _Component);

  function ItineraryBody(props) {
    var _this;

    _classCallCheck(this, ItineraryBody);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ItineraryBody).call(this, props));
    _this.rowKey = 0;
    return _this;
  }

  _createClass(ItineraryBody, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _lodash.default)(this.props.companies, nextProps.companies) || !(0, _lodash.default)(this.props.itinerary, nextProps.itinerary);
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props = this.props,
          itinerary = _this$props.itinerary,
          setActiveLeg = _this$props.setActiveLeg,
          timeOptions = _this$props.timeOptions;
      var rows = [];
      var followsTransit = false;
      itinerary.legs.forEach(function (leg, i) {
        // Create a row containing this leg's start place and leg traversal details
        rows.push(_react.default.createElement(_placeRow.default, _extends({
          key: i,
          place: leg.from,
          time: leg.startTime,
          leg: leg,
          legIndex: i,
          followsTransit: followsTransit
        }, _this2.props))); // If this is the last leg, create a special PlaceRow for the destination only

        if (i === itinerary.legs.length - 1) {
          rows.push(_react.default.createElement(_placeRow.default, {
            place: leg.to,
            time: leg.endTime,
            timeOptions: timeOptions,
            setActiveLeg: setActiveLeg,
            key: i + 1
          }));
        }

        if (leg.transitLeg) followsTransit = true;
      });
      return _react.default.createElement("div", {
        className: "itin-body"
      }, rows, _react.default.createElement(_connectedTripDetails.default, {
        itinerary: itinerary
      }), _react.default.createElement(_tripTools.default, {
        itinerary: itinerary
      }));
    }
  }]);

  return ItineraryBody;
}(_react.Component);

exports.default = ItineraryBody;

_defineProperty(ItineraryBody, "propTypes", {
  companies: _propTypes.default.string,
  itinerary: _propTypes.default.object,
  routingType: _propTypes.default.string
});

module.exports = exports.default;

//# sourceMappingURL=itin-body.js
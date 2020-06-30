"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.function.name");

var _currencyFormatter = _interopRequireDefault(require("currency-formatter"));

var _coreUtils = _interopRequireDefault(require("@opentripplanner/core-utils"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _api = require("../../../actions/api");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var toSentenceCase = _coreUtils.default.itinerary.toSentenceCase;
var formatDuration = _coreUtils.default.time.formatDuration;
var isMobile = _coreUtils.default.ui.isMobile;

var TransportationNetworkCompanyLeg =
/*#__PURE__*/
function (_Component) {
  _inherits(TransportationNetworkCompanyLeg, _Component);

  function TransportationNetworkCompanyLeg() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, TransportationNetworkCompanyLeg);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(TransportationNetworkCompanyLeg)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "state", {});

    return _this;
  }

  _createClass(TransportationNetworkCompanyLeg, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          leg = _this$props.leg,
          legMode = _this$props.legMode,
          LYFT_CLIENT_ID = _this$props.LYFT_CLIENT_ID,
          UBER_CLIENT_ID = _this$props.UBER_CLIENT_ID;
      var universalLinks = {
        'UBER': "https://m.uber.com/".concat(isMobile() ? 'ul/' : '', "?client_id=").concat(UBER_CLIENT_ID, "&action=setPickup&pickup[latitude]=").concat(leg.from.lat, "&pickup[longitude]=").concat(leg.from.lon, "&pickup[nickname]=").concat(encodeURI(leg.from.name), "&dropoff[latitude]=").concat(leg.to.lat, "&dropoff[longitude]=").concat(leg.to.lon, "&dropoff[nickname]=").concat(encodeURI(leg.to.name)),
        'LYFT': "https://lyft.com/ride?id=".concat(defaultTncRideTypes['LYFT'], "&partner=").concat(LYFT_CLIENT_ID, "&pickup[latitude]=").concat(leg.from.lat, "&pickup[longitude]=").concat(leg.from.lon, "&destination[latitude]=").concat(leg.to.lat, "&destination[longitude]=").concat(leg.to.lon)
      };
      var tncData = leg.tncData;
      return _react.default.createElement("div", null, _react.default.createElement("p", null, "* estimated travel time does not account for traffic."), _react.default.createElement("a", {
        className: "btn btn-default",
        href: universalLinks[legMode.label.toUpperCase()],
        style: {
          marginBottom: 15
        },
        target: isMobile() ? '_self' : '_blank'
      }, "Book Ride"), tncData && tncData.estimatedArrival ? _react.default.createElement("p", null, "ETA for a driver: ", formatDuration(tncData.estimatedArrival)) : _react.default.createElement("p", null, "Could not obtain eta estimate from ", toSentenceCase(legMode.label), "!"), tncData && tncData.minCost ? _react.default.createElement("p", null, "Estimated cost: ", "".concat(_currencyFormatter.default.format(tncData.minCost, {
        code: tncData.currency
      }), " - ").concat(_currencyFormatter.default.format(tncData.maxCost, {
        code: tncData.currency
      }))) : _react.default.createElement("p", null, "Could not obtain ride estimate from ", toSentenceCase(legMode.label), "!"), "}");
    }
  }]);

  return TransportationNetworkCompanyLeg;
}(_react.Component);

_defineProperty(TransportationNetworkCompanyLeg, "propTypes", {
  leg: _propTypes.default.object,
  legMode: _propTypes.default.object
});

var defaultTncRideTypes = {
  'LYFT': 'lyft',
  'UBER': 'a6eef2e1-c99a-436f-bde9-fefb9181c0b0'
};

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var _state$otp$config = state.otp.config,
      LYFT_CLIENT_ID = _state$otp$config.LYFT_CLIENT_ID,
      UBER_CLIENT_ID = _state$otp$config.UBER_CLIENT_ID;
  return {
    companies: state.otp.currentQuery.companies,
    tncData: state.otp.tnc,
    LYFT_CLIENT_ID: LYFT_CLIENT_ID,
    UBER_CLIENT_ID: UBER_CLIENT_ID
  };
};

var mapDispatchToProps = {
  getTransportationNetworkCompanyEtaEstimate: _api.getTransportationNetworkCompanyEtaEstimate,
  getTransportationNetworkCompanyRideEstimate: _api.getTransportationNetworkCompanyRideEstimate
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TransportationNetworkCompanyLeg);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=tnc-leg.js
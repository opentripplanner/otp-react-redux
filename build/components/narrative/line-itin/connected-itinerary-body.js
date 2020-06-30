"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.object.freeze");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _lodash = _interopRequireDefault(require("lodash.isequal"));

var _transitLegSummary = _interopRequireDefault(require("@opentripplanner/itinerary-body/lib/defaults/transit-leg-summary"));

var _itineraryBody = _interopRequireDefault(require("@opentripplanner/itinerary-body/lib/otp-react-redux/itinerary-body"));

var _lineColumnContent = _interopRequireDefault(require("@opentripplanner/itinerary-body/lib/otp-react-redux/line-column-content"));

var _placeName = _interopRequireDefault(require("@opentripplanner/itinerary-body/lib/otp-react-redux/place-name"));

var _styled = require("@opentripplanner/itinerary-body/lib/styled");

var _routeDescription = _interopRequireDefault(require("@opentripplanner/itinerary-body/lib/otp-react-redux/route-description"));

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _map = require("../../../actions/map");

var _narrative = require("../../../actions/narrative");

var _ui = require("../../../actions/ui");

var _connectedTransitLegSubheader = _interopRequireDefault(require("./connected-transit-leg-subheader"));

var _connectedTripDetails = _interopRequireDefault(require("../connected-trip-details"));

var _tripTools = _interopRequireDefault(require("../trip-tools"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _templateObject2() {
  var data = _taggedTemplateLiteral(["\n  ", " {\n    font-weight: inherit;\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  padding: 20px 0px;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var noop = function noop() {};

var ItineraryBodyContainer = _styledComponents.default.div(_templateObject());

var StyledItineraryBody = (0, _styledComponents.default)(_itineraryBody.default)(_templateObject2(), _styled.PlaceName);

var ConnectedItineraryBody =
/*#__PURE__*/
function (_Component) {
  _inherits(ConnectedItineraryBody, _Component);

  function ConnectedItineraryBody() {
    _classCallCheck(this, ConnectedItineraryBody);

    return _possibleConstructorReturn(this, _getPrototypeOf(ConnectedItineraryBody).apply(this, arguments));
  }

  _createClass(ConnectedItineraryBody, [{
    key: "shouldComponentUpdate",

    /** avoid rerendering if the itinerary to display hasn't changed */
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _lodash.default)(this.props.itinerary, nextProps.itinerary);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          config = _this$props.config,
          diagramVisible = _this$props.diagramVisible,
          itinerary = _this$props.itinerary,
          LegIcon = _this$props.LegIcon,
          setActiveLeg = _this$props.setActiveLeg,
          setViewedTrip = _this$props.setViewedTrip,
          showLegDiagram = _this$props.showLegDiagram;
      return _react.default.createElement(ItineraryBodyContainer, null, _react.default.createElement(StyledItineraryBody, {
        config: config,
        diagramVisible: diagramVisible,
        itinerary: itinerary,
        LegIcon: LegIcon,
        LineColumnContent: _lineColumnContent.default,
        PlaceName: _placeName.default,
        RouteDescription: _routeDescription.default,
        setActiveLeg: setActiveLeg,
        setLegDiagram: showLegDiagram,
        setViewedTrip: setViewedTrip,
        showAgencyInfo: true,
        showElevationProfile: true,
        showLegIcon: true,
        showMapButtonColumn: false,
        showViewTripButton: true,
        toRouteAbbreviation: noop,
        TransitLegSubheader: _connectedTransitLegSubheader.default,
        TransitLegSummary: _transitLegSummary.default
      }), _react.default.createElement(_connectedTripDetails.default, {
        itinerary: itinerary
      }), _react.default.createElement(_tripTools.default, {
        itinerary: itinerary
      }));
    }
  }]);

  return ConnectedItineraryBody;
}(_react.Component);

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    config: state.otp.config,
    diagramVisible: state.otp.ui.diagramLeg
  };
};

var mapDispatchToProps = {
  setActiveLeg: _narrative.setActiveLeg,
  setViewedTrip: _ui.setViewedTrip,
  showLegDiagram: _map.showLegDiagram
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ConnectedItineraryBody);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=connected-itinerary-body.js
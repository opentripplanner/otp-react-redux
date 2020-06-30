"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es7.object.values");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.array.find-index");

var _coreUtils = _interopRequireDefault(require("@opentripplanner/core-utils"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactBootstrap = require("react-bootstrap");

var _velocityReact = require("velocity-react");

var _reactRedux = require("react-redux");

var _icon = _interopRequireDefault(require("../narrative/icon"));

var _ui = require("../../actions/ui");

var _api = require("../../actions/api");

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

function operatorIndexForRoute(transitOperators, route) {
  if (!route.agency) return 0;
  var index = transitOperators.findIndex(function (o) {
    return o.id.toLowerCase() === route.agency.id.split(':')[0].toLowerCase();
  });
  if (index !== -1 && typeof transitOperators[index].order !== 'undefined') return transitOperators[index].order;else return 0;
}
/**
 * Determine the appropriate contrast color for text (white or black) based on
 * the input hex string (e.g., '#ff00ff') value.
 *
 * From https://stackoverflow.com/a/11868398/915811
 *
 * TODO: Move to @opentripplanner/core-utils once otp-rr uses otp-ui library.
 */


function getContrastYIQ(hexcolor) {
  hexcolor = hexcolor.replace('#', '');
  var r = parseInt(hexcolor.substr(0, 2), 16);
  var g = parseInt(hexcolor.substr(2, 2), 16);
  var b = parseInt(hexcolor.substr(4, 2), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '000000' : 'ffffff';
}

var RouteViewer =
/*#__PURE__*/
function (_Component) {
  _inherits(RouteViewer, _Component);

  function RouteViewer() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, RouteViewer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(RouteViewer)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "_backClicked", function () {
      return _this.props.setMainPanelContent(null);
    });

    return _this;
  }

  _createClass(RouteViewer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.props.findRoutes();
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          findRoute = _this$props.findRoute,
          hideBackButton = _this$props.hideBackButton,
          languageConfig = _this$props.languageConfig,
          transitOperators = _this$props.transitOperators,
          routes = _this$props.routes,
          setViewedRoute = _this$props.setViewedRoute,
          viewedRoute = _this$props.viewedRoute;
      var sortedRoutes = routes ? Object.values(routes).sort(_coreUtils.default.itinerary.routeComparator) : [];
      var agencySortedRoutes = transitOperators.length > 0 ? sortedRoutes.sort(function (a, b) {
        return operatorIndexForRoute(transitOperators, a) - operatorIndexForRoute(transitOperators, b);
      }) : sortedRoutes;
      return _react.default.createElement("div", {
        className: "route-viewer"
      }, _react.default.createElement("div", {
        className: "route-viewer-header"
      }, !hideBackButton && _react.default.createElement("div", {
        className: "back-button-container"
      }, _react.default.createElement(_reactBootstrap.Button, {
        bsSize: "small",
        onClick: this._backClicked
      }, _react.default.createElement(_icon.default, {
        type: "arrow-left"
      }), "Back")), _react.default.createElement("div", {
        className: "header-text"
      }, languageConfig.routeViewer || 'Route Viewer'), _react.default.createElement("div", {
        className: ""
      }, languageConfig.routeViewerDetails), _react.default.createElement("div", {
        style: {
          clear: 'both'
        }
      })), _react.default.createElement("div", {
        className: "route-viewer-body"
      }, agencySortedRoutes.map(function (route) {
        // Find operator based on agency_id (extracted from OTP route ID).
        // TODO: re-implement multi-agency logos for route viewer.
        // const operator = operatorForRoute(transitOperators, route) || {}
        return _react.default.createElement(RouteRow, {
          findRoute: findRoute,
          isActive: viewedRoute && viewedRoute.routeId === route.id,
          key: route.id // operator={operator}
          ,
          route: route,
          setViewedRoute: setViewedRoute
        });
      })));
    }
  }]);

  return RouteViewer;
}(_react.Component);

_defineProperty(RouteViewer, "propTypes", {
  hideBackButton: _propTypes.default.bool,
  routes: _propTypes.default.object
});

var RouteRow =
/*#__PURE__*/
function (_PureComponent) {
  _inherits(RouteRow, _PureComponent);

  function RouteRow() {
    var _getPrototypeOf3;

    var _this2;

    _classCallCheck(this, RouteRow);

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    _this2 = _possibleConstructorReturn(this, (_getPrototypeOf3 = _getPrototypeOf(RouteRow)).call.apply(_getPrototypeOf3, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this2), "_onClick", function () {
      var _this2$props = _this2.props,
          findRoute = _this2$props.findRoute,
          isActive = _this2$props.isActive,
          route = _this2$props.route,
          setViewedRoute = _this2$props.setViewedRoute;

      if (isActive) {
        // Deselect current route if active.
        setViewedRoute({
          routeId: null
        });
      } else {
        // Otherwise, set active and fetch route patterns.
        findRoute({
          routeId: route.id
        });
        setViewedRoute({
          routeId: route.id
        });
      }
    });

    return _this2;
  }

  _createClass(RouteRow, [{
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          isActive = _this$props2.isActive,
          route = _this$props2.route,
          operator = _this$props2.operator;

      var _ref = operator || {},
          defaultRouteColor = _ref.defaultRouteColor,
          defaultRouteTextColor = _ref.defaultRouteTextColor,
          longNameSplitter = _ref.longNameSplitter;

      var backgroundColor = "#".concat(defaultRouteColor || route.color || 'ffffff'); // NOTE: text color is not a part of short response route object, so there
      // is no way to determine from OTP what the text color should be if the
      // background color is, say, black. Instead, determine the appropriate
      // contrast color and use that if no text color is available.

      var contrastColor = getContrastYIQ(backgroundColor);
      var color = "#".concat(defaultRouteTextColor || route.textColor || contrastColor); // Default long name is empty string (long name is an optional GTFS value).

      var longName = '';

      if (route.longName) {
        // Attempt to split route name if splitter is defined for operator (to
        // remove short name value from start of long name value).
        var nameParts = route.longName.split(longNameSplitter);
        longName = longNameSplitter && nameParts.length > 1 ? nameParts[1] : route.longName; // If long name and short name are identical, set long name to be an empty
        // string.

        if (longName === route.shortName) longName = '';
      }

      return _react.default.createElement("div", {
        style: {
          borderBottom: '1px solid gray',
          backgroundColor: isActive ? '#f6f8fa' : 'white'
        }
      }, _react.default.createElement(_reactBootstrap.Button, {
        className: "clear-button-formatting",
        style: {
          padding: 8,
          width: '100%'
        },
        onClick: this._onClick
      }, _react.default.createElement("div", {
        style: {
          display: 'inline-block'
        }
      }), _react.default.createElement("div", {
        style: {
          display: 'inline-block',
          marginTop: '2px'
        }
      }, _react.default.createElement(_reactBootstrap.Label, {
        style: {
          backgroundColor: backgroundColor === '#ffffff' ? 'rgba(0,0,0,0)' : backgroundColor,
          fontSize: 'medium',
          fontWeight: 400,
          color: color
        }
      }, _react.default.createElement("b", null, route.shortName), " ", longName))), _react.default.createElement(_velocityReact.VelocityTransitionGroup, {
        enter: {
          animation: 'slideDown'
        },
        leave: {
          animation: 'slideUp'
        }
      }, isActive && _react.default.createElement("div", {
        style: {
          padding: 8
        }
      }, route.url ? _react.default.createElement("a", {
        href: route.url,
        target: "_blank"
      }, "Route Details") : 'No route URL provided.')));
    }
  }]);

  return RouteRow;
}(_react.PureComponent); // connect to redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    transitOperators: state.otp.config.transitOperators,
    routes: state.otp.transitIndex.routes,
    viewedRoute: state.otp.ui.viewedRoute,
    languageConfig: state.otp.config.language
  };
};

var mapDispatchToProps = {
  findRoute: _api.findRoute,
  findRoutes: _api.findRoutes,
  setMainPanelContent: _ui.setMainPanelContent,
  setViewedRoute: _ui.setViewedRoute
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(RouteViewer);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=route-viewer.js
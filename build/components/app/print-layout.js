"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.regexp.search");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _reactBootstrap = require("react-bootstrap");

var _baseMap = _interopRequireDefault(require("../map/base-map"));

var _endpointsOverlay = _interopRequireDefault(require("../map/endpoints-overlay"));

var _transitiveOverlay = _interopRequireDefault(require("../map/transitive-overlay"));

var _printableItinerary = _interopRequireDefault(require("../narrative/printable/printable-itinerary"));

var _form = require("../../actions/form");

var _api = require("../../actions/api");

var _state = require("../../util/state");

var _time = require("../../util/time");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

var PrintLayout =
/*#__PURE__*/
function (_Component) {
  _inherits(PrintLayout, _Component);

  function PrintLayout(props) {
    var _this;

    _classCallCheck(this, PrintLayout);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(PrintLayout).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "_toggleMap", function () {
      _this.setState({
        mapVisible: !_this.state.mapVisible
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_print", function () {
      window.print();
    });

    _this.state = {
      mapVisible: true
    };
    return _this;
  }

  _createClass(PrintLayout, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var location = this.props.location; // Parse the URL query parameters, if present

      if (location && location.search) {
        this.props.parseUrlQueryString();
      }
    }
    /**
     * Add print-view class to html tag to ensure that iOS scroll fix only applies
     * to non-print views.
     */

  }, {
    key: "componentWillMount",
    value: function componentWillMount() {
      var root = document.getElementsByTagName('html')[0];
      root.setAttribute('class', 'print-view');
    }
    /**
     * Remove class attribute from html tag on clean up.
     */

  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var root = document.getElementsByTagName('html')[0];
      root.removeAttribute('class');
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          configCompanies = _this$props.configCompanies,
          customIcons = _this$props.customIcons,
          itinerary = _this$props.itinerary,
          timeFormat = _this$props.timeFormat;
      return _react.default.createElement("div", {
        className: "otp print-layout"
      }, _react.default.createElement("div", {
        className: "header"
      }, _react.default.createElement("div", {
        style: {
          float: 'right'
        }
      }, _react.default.createElement(_reactBootstrap.Button, {
        bsSize: "small",
        onClick: this._toggleMap
      }, _react.default.createElement("i", {
        className: "fa fa-map"
      }), " Toggle Map"), ' ', _react.default.createElement(_reactBootstrap.Button, {
        bsSize: "small",
        onClick: this._print
      }, _react.default.createElement("i", {
        className: "fa fa-print"
      }), " Print")), "Itinerary"), this.state.mapVisible && _react.default.createElement("div", {
        className: "map-container"
      }, _react.default.createElement(_baseMap.default, null, _react.default.createElement(_transitiveOverlay.default, null), _react.default.createElement(_endpointsOverlay.default, null))), itinerary ? _react.default.createElement(_printableItinerary.default, {
        configCompanies: configCompanies,
        customIcons: customIcons,
        itinerary: itinerary,
        timeFormat: timeFormat
      }) : null);
    }
  }]);

  return PrintLayout;
}(_react.Component); // connect to the redux store


_defineProperty(PrintLayout, "propTypes", {
  itinerary: _propTypes.default.object,
  parseQueryString: _propTypes.default.func
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    itinerary: (0, _state.getActiveItinerary)(state.otp),
    configCompanies: state.otp.config.companies,
    timeFormat: (0, _time.getTimeFormat)(state.otp.config)
  };
};

var mapDispatchToProps = {
  parseUrlQueryString: _form.parseUrlQueryString,
  routingQuery: _api.routingQuery
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(PrintLayout);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=print-layout.js
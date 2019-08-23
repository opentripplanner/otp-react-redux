"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.function.name");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _reactBootstrap = require("react-bootstrap");

var _defaultMap = _interopRequireDefault(require("../map/default-map"));

var _errorMessage = _interopRequireDefault(require("../form/error-message"));

var _itineraryCarousel = _interopRequireDefault(require("../narrative/itinerary-carousel"));

var _locationIcon = _interopRequireDefault(require("../icons/location-icon"));

var _container = _interopRequireDefault(require("./container"));

var _navigationBar = _interopRequireDefault(require("./navigation-bar"));

var _ui = require("../../actions/ui");

var _narrative = require("../../actions/narrative");

var _form = require("../../actions/form");

var _state = require("../../util/state");

var _ui2 = require("../../util/ui");

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

var MobileResultsScreen =
/*#__PURE__*/
function (_Component) {
  _inherits(MobileResultsScreen, _Component);

  function MobileResultsScreen() {
    var _this;

    _classCallCheck(this, MobileResultsScreen);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(MobileResultsScreen).call(this));

    _defineProperty(_assertThisInitialized(_this), "_editSearchClicked", function () {
      _this.props.clearActiveSearch();

      _this.props.setMobileScreen(_ui.MobileScreens.SEARCH_FORM);
    });

    _defineProperty(_assertThisInitialized(_this), "_optionClicked", function () {
      _this._setExpanded(!_this.state.expanded);
    });

    _defineProperty(_assertThisInitialized(_this), "_toggleRealtime", function () {
      return _this.props.setUseRealtimeResponse({
        useRealtime: !_this.props.useRealtime
      });
    });

    _this.state = {
      expanded: false
    };
    return _this;
  }

  _createClass(MobileResultsScreen, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      // Get the target element that we want to persist scrolling for
      // FIXME Do we need to add something that removes the listeners when
      // component unmounts?
      (0, _ui2.enableScrollForSelector)('.mobile-narrative-container');
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      // Check if the active leg changed
      if (this.props.activeLeg !== nextProps.activeLeg) {
        this._setExpanded(false);
      }
    }
  }, {
    key: "_setExpanded",
    value: function _setExpanded(expanded) {
      this.setState({
        expanded: expanded
      });
      this.refs['narrative-container'].scrollTop = 0;
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          error = _this$props.error,
          icons = _this$props.icons,
          itineraryClass = _this$props.itineraryClass,
          itineraryFooter = _this$props.itineraryFooter,
          query = _this$props.query,
          realtimeEffects = _this$props.realtimeEffects,
          resultCount = _this$props.resultCount,
          useRealtime = _this$props.useRealtime,
          activeItineraryIndex = _this$props.activeItineraryIndex;
      var expanded = this.state.expanded;
      var narrativeContainerStyle = expanded ? {
        top: 140,
        overflowY: 'auto'
      } : {
        height: 80,
        overflowY: 'hidden' // Ensure that narrative covers map.

      };
      narrativeContainerStyle.backgroundColor = 'white';
      var headerAction = null;
      var showRealtimeAnnotation = realtimeEffects.isAffectedByRealtimeData && (realtimeEffects.exceedsThreshold || realtimeEffects.routesDiffer || !useRealtime);
      /* Old navbar alert
      if (showRealtimeAnnotation) {
        headerAction = (
          <RealtimeAnnotation
            componentClass='popover'
            toggleRealtime={this._toggleRealtime}
            realtimeEffects={realtimeEffects}
            useRealtime={useRealtime}
          />
        )
      */

      var locationsSummary = _react.default.createElement("div", {
        style: {
          position: 'fixed',
          top: 50,
          left: 0,
          right: 0,
          height: 50,
          paddingRight: 10
        }
      }, _react.default.createElement(_reactBootstrap.Row, {
        className: "locations-summary",
        style: {
          padding: '4px 8px'
        }
      }, _react.default.createElement(_reactBootstrap.Col, {
        xs: 8,
        sm: 11,
        style: {
          fontSize: '1.1em',
          lineHeight: '1.2em'
        }
      }, _react.default.createElement("div", {
        className: "location"
      }, _react.default.createElement(_locationIcon.default, {
        type: "from"
      }), " ", query.from ? query.from.name : ''), _react.default.createElement("div", {
        className: "location",
        style: {
          marginTop: '2px'
        }
      }, _react.default.createElement(_locationIcon.default, {
        type: "to"
      }), " ", query.to ? query.to.name : '')), _react.default.createElement(_reactBootstrap.Col, {
        xs: 4,
        sm: 1
      }, _react.default.createElement(_reactBootstrap.Button, {
        className: "edit-search-button pull-right",
        onClick: this._editSearchClicked
      }, "Edit"))));

      if (error) {
        return _react.default.createElement(_container.default, null, _react.default.createElement(_navigationBar.default, {
          headerText: "No Trip Found"
        }), locationsSummary, _react.default.createElement("div", {
          className: "results-error-map"
        }, _react.default.createElement(_defaultMap.default, null)), _react.default.createElement("div", {
          className: "results-error-message"
        }, _react.default.createElement(_errorMessage.default, {
          error: error
        }), _react.default.createElement("div", {
          className: "options-lower-tray mobile-padding"
        }, _react.default.createElement(_reactBootstrap.Button, {
          className: "back-to-search-button",
          onClick: this._editSearchClicked,
          style: {
            width: '100%'
          }
        }, _react.default.createElement("i", {
          className: "fa fa-arrow-left"
        }), " Back to Search"))));
      } // Construct the 'dots'


      var dots = [];

      for (var i = 0; i < resultCount; i++) {
        dots.push(_react.default.createElement("div", {
          key: i,
          className: "dot".concat(activeItineraryIndex === i ? ' active' : '')
        }));
      }

      return _react.default.createElement(_container.default, null, _react.default.createElement(_navigationBar.default, {
        headerText: resultCount ? "We Found ".concat(resultCount, " Option").concat(resultCount > 1 ? 's' : '') : 'Waiting...',
        headerAction: headerAction
      }), locationsSummary, _react.default.createElement("div", {
        className: "results-map"
      }, this.props.map), _react.default.createElement("div", {
        className: "mobile-narrative-header",
        style: {
          bottom: expanded ? null : 100,
          top: expanded ? 100 : null
        },
        onClick: this._optionClicked
      }, "Option ", activeItineraryIndex + 1, _react.default.createElement("i", {
        className: "fa fa-caret-".concat(expanded ? 'down' : 'up'),
        style: {
          marginLeft: 8
        }
      })), _react.default.createElement("div", {
        ref: "narrative-container",
        className: "mobile-narrative-container",
        style: narrativeContainerStyle
      }, _react.default.createElement(_itineraryCarousel.default, {
        itineraryClass: itineraryClass,
        itineraryFooter: itineraryFooter,
        hideHeader: true,
        expanded: this.state.expanded,
        onClick: this._optionClicked,
        showRealtimeAnnotation: showRealtimeAnnotation,
        customIcons: icons
      })), _react.default.createElement("div", {
        className: "dots-container",
        style: {
          padding: 'none'
        }
      }, dots));
    }
  }]);

  return MobileResultsScreen;
}(_react.Component); // connect to the redux store


_defineProperty(MobileResultsScreen, "propTypes", {
  activeItineraryIndex: _propTypes.default.number,
  map: _propTypes.default.element,
  query: _propTypes.default.object,
  resultCount: _propTypes.default.number,
  setMobileScreen: _propTypes.default.func
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  var useRealtime = state.otp.useRealtime;
  var response = !activeSearch ? null : useRealtime ? activeSearch.response : activeSearch.nonRealtimeResponse;
  var realtimeEffects = (0, _state.getRealtimeEffects)(state.otp);
  return {
    query: state.otp.currentQuery,
    realtimeEffects: realtimeEffects,
    error: response && response.error,
    resultCount: response ? activeSearch.query.routingType === 'ITINERARY' ? response.plan ? response.plan.itineraries.length : 0 : response.otp.profile.length : null,
    useRealtime: useRealtime,
    activeItineraryIndex: activeSearch ? activeSearch.activeItinerary : null,
    activeLeg: activeSearch ? activeSearch.activeLeg : null
  };
};

var mapDispatchToProps = {
  clearActiveSearch: _form.clearActiveSearch,
  setMobileScreen: _ui.setMobileScreen,
  setUseRealtimeResponse: _narrative.setUseRealtimeResponse
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(MobileResultsScreen);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=results-screen.js
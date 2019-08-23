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

require("core-js/modules/es6.array.find");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.array.find-index");

require("core-js/modules/es6.function.name");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactBootstrap = require("react-bootstrap");

var _reactRedux = require("react-redux");

var _moment = _interopRequireDefault(require("moment"));

require("moment-timezone");

var _velocityReact = require("velocity-react");

var _icon = _interopRequireDefault(require("../narrative/icon"));

var _locationIcon = _interopRequireDefault(require("../icons/location-icon"));

var _ui = require("../../actions/ui");

var _api = require("../../actions/api");

var _map = require("../../actions/map");

var _itinerary = require("../../util/itinerary");

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

var StopViewer =
/*#__PURE__*/
function (_Component) {
  _inherits(StopViewer, _Component);

  function StopViewer() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, StopViewer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(StopViewer)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "state", {});

    _defineProperty(_assertThisInitialized(_this), "_backClicked", function () {
      return _this.props.setMainPanelContent(null);
    });

    _defineProperty(_assertThisInitialized(_this), "_setLocationFromStop", function (type) {
      var _this$props = _this.props,
          setLocation = _this$props.setLocation,
          stopData = _this$props.stopData;
      var location = {
        name: stopData.name,
        lat: stopData.lat,
        lon: stopData.lon
      };
      setLocation({
        type: type,
        location: location,
        reverseGeocode: true
      });

      _this.setState({
        popupPosition: null
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_onClickPlanTo", function () {
      return _this._setLocationFromStop('to');
    });

    _defineProperty(_assertThisInitialized(_this), "_onClickPlanFrom", function () {
      return _this._setLocationFromStop('from');
    });

    _defineProperty(_assertThisInitialized(_this), "_refreshStopTimes", function () {
      var _this$props2 = _this.props,
          findStopTimesForStop = _this$props2.findStopTimesForStop,
          viewedStop = _this$props2.viewedStop;
      findStopTimesForStop({
        stopId: viewedStop.stopId
      }); // TODO: GraphQL approach would just call findStop again.
      // findStop({ stopId: viewedStop.stopId })

      _this.setState({
        spin: true
      });

      window.setTimeout(_this._stopSpin, 1000);
    });

    _defineProperty(_assertThisInitialized(_this), "_onToggleAutoRefresh", function () {
      var _this$props3 = _this.props,
          autoRefreshStopTimes = _this$props3.autoRefreshStopTimes,
          toggleAutoRefresh = _this$props3.toggleAutoRefresh;

      if (autoRefreshStopTimes) {
        toggleAutoRefresh(false);
      } else {
        // Turn on auto-refresh and refresh immediately to give user feedback.
        _this._refreshStopTimes();

        toggleAutoRefresh(true);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_stopSpin", function () {
      return _this.setState({
        spin: false
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_startAutoRefresh", function () {
      var timer = window.setInterval(_this._refreshStopTimes, 10000);

      _this.setState({
        timer: timer
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_stopAutoRefresh", function () {
      window.clearInterval(_this.state.timer);
    });

    _defineProperty(_assertThisInitialized(_this), "_toggleFavorite", function () {
      var _this$props4 = _this.props,
          forgetStop = _this$props4.forgetStop,
          rememberStop = _this$props4.rememberStop,
          stopData = _this$props4.stopData;
      if (_this._isFavorite()) forgetStop(stopData.id);else rememberStop(stopData);
    });

    _defineProperty(_assertThisInitialized(_this), "_isFavorite", function () {
      return _this.props.stopData && _this.props.favoriteStops.findIndex(function (s) {
        return s.id === _this.props.stopData.id;
      }) !== -1;
    });

    return _this;
  }

  _createClass(StopViewer, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      // Load the viewed stop in the store when the Stop Viewer first mounts
      this.props.findStop({
        stopId: this.props.viewedStop.stopId
      }); // Turn on stop times refresh if enabled.

      if (this.props.autoRefreshStopTimes) this._startAutoRefresh();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      // Turn off auto refresh unconditionally (just in case).
      this._stopAutoRefresh();
    }
  }, {
    key: "componentWillReceiveProps",
    // refresh the stop in the store if the viewed stop changes w/ the
    // Stop Viewer already mounted
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.viewedStop && nextProps.viewedStop && this.props.viewedStop.stopId !== nextProps.viewedStop.stopId) {
        this.props.findStop({
          stopId: nextProps.viewedStop.stopId
        });
      } // Handle stopping or starting the auto refresh timer.


      if (this.props.autoRefreshStopTimes && !nextProps.autoRefreshStopTimes) this._stopAutoRefresh();else if (!this.props.autoRefreshStopTimes && nextProps.autoRefreshStopTimes) this._startAutoRefresh();
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props5 = this.props,
          hideBackButton = _this$props5.hideBackButton,
          homeTimezone = _this$props5.homeTimezone,
          showUserSettings = _this$props5.showUserSettings,
          stopData = _this$props5.stopData,
          stopViewerArriving = _this$props5.stopViewerArriving,
          stopViewerConfig = _this$props5.stopViewerConfig,
          timeFormat = _this$props5.timeFormat;
      var spin = this.state.spin; // Rewrite stop ID to not include Agency prefix, if present
      // TODO: make this functionality configurable?

      var stopId;

      if (stopData && stopData.id) {
        stopId = stopData.id.includes(':') ? stopData.id.split(':')[1] : stopData.id;
      } // construct a lookup table mapping pattern (e.g. 'ROUTE_ID-HEADSIGN') to an array of stoptimes


      var stopTimesByPattern = {};

      if (stopData && stopData.routes && stopData.stopTimes) {
        stopData.stopTimes.forEach(function (patternTimes) {
          var routeId = getRouteIdForPattern(patternTimes.pattern);
          var headsign = patternTimes.times[0] && patternTimes.times[0].headsign;
          patternTimes.pattern.headsign = headsign;
          var id = "".concat(routeId, "-").concat(headsign);

          if (!(id in stopTimesByPattern)) {
            var route = stopData.routes.find(function (r) {
              return r.id === routeId;
            }); // in some cases, the TriMet transit index will not return all routes
            // that serve a stop. Perhaps it doesn't return some routes if the
            // route only performs a drop-off at the stop... not quite sure. So a
            // check is needed to make sure we don't add data for routes not found
            // from the routes query.

            if (!route) {
              console.warn("Route with id ".concat(routeId, " not found in list of routes! No stop times from this route will be displayed."));
              return;
            }

            stopTimesByPattern[id] = {
              id: id,
              route: route,
              pattern: patternTimes.pattern,
              times: []
            };
          }

          var filteredTimes = patternTimes.times.filter(function (stopTime) {
            return stopTime.stopIndex < stopTime.stopCount - 1; // ensure that this isn't the last stop
          });
          stopTimesByPattern[id].times = stopTimesByPattern[id].times.concat(filteredTimes);
        });
      }

      return _react.default.createElement("div", {
        className: "stop-viewer"
      }, _react.default.createElement("div", {
        className: "stop-viewer-header"
      }, !hideBackButton && _react.default.createElement("div", {
        className: "back-button-container"
      }, _react.default.createElement(_reactBootstrap.Button, {
        bsSize: "small",
        onClick: this._backClicked
      }, _react.default.createElement(_icon.default, {
        type: "arrow-left"
      }), "Back")), _react.default.createElement("div", {
        className: "header-text"
      }, stopData ? _react.default.createElement("span", null, stopData.name) : _react.default.createElement("span", null, "Loading Stop..."), showUserSettings ? _react.default.createElement(_reactBootstrap.Button, {
        onClick: this._toggleFavorite,
        bsSize: "large",
        style: {
          color: this._isFavorite() ? 'yellow' : 'black',
          padding: 0,
          marginLeft: '5px'
        },
        bsStyle: "link"
      }, _react.default.createElement(_icon.default, {
        type: this._isFavorite() ? 'star' : 'star-o'
      })) : null), _react.default.createElement("div", {
        style: {
          clear: 'both'
        }
      })), stopData && _react.default.createElement("div", {
        className: "stop-viewer-body"
      }, _react.default.createElement("div", null, _react.default.createElement("div", null, _react.default.createElement("b", null, "Stop ID"), ": ", stopId, _react.default.createElement("button", {
        className: "link-button pull-right",
        style: {
          fontSize: 'small'
        },
        onClick: this._refreshStopTimes
      }, _react.default.createElement(_icon.default, {
        className: spin ? 'fa-spin' : '',
        type: "refresh"
      }), ' ', (0, _moment.default)(stopData.stopTimesLastUpdated).tz((0, _time.getUserTimezone)()).format(timeFormat))), _react.default.createElement("b", null, "Plan a trip:"), ' ', _react.default.createElement(_locationIcon.default, {
        type: "from"
      }), ' ', _react.default.createElement("button", {
        className: "link-button",
        onClick: this._onClickPlanFrom
      }, "From here"), ' ', "|", ' ', _react.default.createElement(_locationIcon.default, {
        type: "to"
      }), ' ', _react.default.createElement("button", {
        className: "link-button",
        onClick: this._onClickPlanTo
      }, "To here")), stopData.stopTimes && stopData.routes && _react.default.createElement("div", {
        style: {
          marginTop: 20
        }
      }, Object.values(stopTimesByPattern).sort(function (a, b) {
        return (0, _itinerary.routeComparator)(a.route, b.route);
      }).map(function (patternTimes) {
        // Only add pattern row if route is found.
        // FIXME: there is currently a bug with the alernative transit index
        // where routes are not associated with the stop if the only stoptimes
        // for the stop are drop off only. See https://github.com/ibi-group/trimet-mod-otp/issues/217
        if (!patternTimes.route) {
          console.warn("Cannot render stop times for missing route ID: ".concat(getRouteIdForPattern(patternTimes.pattern)));
          return null;
        }

        return _react.default.createElement(PatternRow, {
          pattern: patternTimes.pattern,
          route: patternTimes.route,
          stopTimes: patternTimes.times,
          stopViewerConfig: stopViewerConfig,
          key: patternTimes.id,
          stopViewerArriving: stopViewerArriving,
          homeTimezone: homeTimezone,
          timeFormat: timeFormat
        });
      })), _react.default.createElement("div", {
        style: {
          marginTop: '20px'
        }
      }, _react.default.createElement("label", {
        style: {
          fontWeight: 300,
          fontSize: 'small'
        }
      }, _react.default.createElement("input", {
        name: "autoUpdate",
        type: "checkbox",
        checked: this.props.autoRefreshStopTimes,
        onChange: this._onToggleAutoRefresh
      }), ' ', "Auto-refresh arrivals?"))));
    }
  }]);

  return StopViewer;
}(_react.Component);

_defineProperty(StopViewer, "propTypes", {
  hideBackButton: _propTypes.default.bool,
  stopData: _propTypes.default.object,
  viewedStop: _propTypes.default.object
});

var PatternRow =
/*#__PURE__*/
function (_Component2) {
  _inherits(PatternRow, _Component2);

  function PatternRow() {
    var _this2;

    _classCallCheck(this, PatternRow);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(PatternRow).call(this));

    _defineProperty(_assertThisInitialized(_this2), "_toggleExpandedView", function () {
      _this2.setState({
        expanded: !_this2.state.expanded
      });
    });

    _this2.state = {
      expanded: false
    };
    return _this2;
  }

  _createClass(PatternRow, [{
    key: "render",
    value: function render() {
      var _this$props6 = this.props,
          pattern = _this$props6.pattern,
          route = _this$props6.route,
          stopTimes = _this$props6.stopTimes,
          homeTimezone = _this$props6.homeTimezone,
          stopViewerArriving = _this$props6.stopViewerArriving,
          stopViewerConfig = _this$props6.stopViewerConfig,
          timeFormat = _this$props6.timeFormat; // sort stop times by next departure

      var sortedStopTimes = [];
      var hasStopTimes = stopTimes && stopTimes.length > 0;

      if (hasStopTimes) {
        sortedStopTimes = stopTimes.concat().sort(function (a, b) {
          var aTime = a.serviceDay + a.realtimeDeparture;
          var bTime = b.serviceDay + b.realtimeDeparture;
          return aTime - bTime;
        }) // We request only x departures per pattern, but the patterns are merged
        // according to shared headsigns, so we need to slice the stop times
        // here as well to ensure only x times are shown per route/headsign combo.
        // This is applied after the sort, so we're keeping the soonest departures.
        .slice(0, stopViewerConfig.numberOfDepartures);
      } else {
        // Do not include pattern row if it has no stop times.
        return null;
      }

      var routeName = route.shortName ? route.shortName : route.longName;
      return _react.default.createElement("div", {
        className: "route-row"
      }, _react.default.createElement("div", {
        className: "header"
      }, _react.default.createElement("div", {
        className: "route-name"
      }, _react.default.createElement("b", null, routeName), " To ", pattern.headsign), hasStopTimes && _react.default.createElement("div", {
        className: "next-trip-preview"
      }, getFormattedStopTime(sortedStopTimes[0], homeTimezone, stopViewerArriving, timeFormat)), _react.default.createElement("div", {
        className: "expansion-button-container"
      }, _react.default.createElement("button", {
        className: "expansion-button",
        onClick: this._toggleExpandedView
      }, _react.default.createElement(_icon.default, {
        type: "chevron-".concat(this.state.expanded ? 'up' : 'down')
      })))), _react.default.createElement(_velocityReact.VelocityTransitionGroup, {
        enter: {
          animation: 'slideDown'
        },
        leave: {
          animation: 'slideUp'
        }
      }, this.state.expanded && _react.default.createElement("div", null, _react.default.createElement("div", {
        className: "trip-table"
      }, _react.default.createElement("div", {
        className: "header"
      }, _react.default.createElement("div", {
        className: "cell"
      }), _react.default.createElement("div", {
        className: "cell time-column"
      }, "DEPARTURE"), _react.default.createElement("div", {
        className: "cell status-column"
      }, "STATUS")), hasStopTimes && sortedStopTimes.map(function (stopTime, i) {
        return _react.default.createElement("div", {
          className: "trip-row",
          style: {
            display: 'table-row',
            marginTop: 6,
            fontSize: 14
          },
          key: i
        }, _react.default.createElement("div", {
          className: "cell"
        }, "To ", stopTime.headsign), _react.default.createElement("div", {
          className: "cell time-column"
        }, getFormattedStopTime(stopTime, homeTimezone, stopViewerArriving, timeFormat)), _react.default.createElement("div", {
          className: "cell status-column"
        }, stopTime.realtimeState === 'UPDATED' ? getStatusLabel(stopTime.departureDelay) : _react.default.createElement("div", {
          className: "status-label",
          style: {
            backgroundColor: '#bbb'
          }
        }, "Scheduled")));
      })))));
    }
  }]);

  return PatternRow;
}(_react.Component);

var ONE_HOUR_IN_SECONDS = 3600;
var ONE_DAY_IN_SECONDS = 86400;
/**
 * Helper method to generate stop time w/ status icon
 *
 * @param  {object} stopTime  A stopTime object as received from a transit index API
 * @param  {string} [homeTimezone]  If configured, the timezone of the area
 * @param  {string} [soonText='Due']  The text to display for departure times
 *    about to depart in a short amount of time
 * @param  {string} timeFormat  A valid moment.js formatting string
 */

function getFormattedStopTime(stopTime, homeTimezone) {
  var soonText = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Due';
  var timeFormat = arguments.length > 3 ? arguments[3] : undefined;
  var userTimeZone = (0, _time.getUserTimezone)();
  var inHomeTimezone = homeTimezone && homeTimezone === userTimeZone;
  var now = (0, _moment.default)().tz(homeTimezone);
  var serviceDay = (0, _moment.default)(stopTime.serviceDay * 1000).tz(homeTimezone); // Determine if arrival occurs on different day, making sure to account for
  // any extra days added to the service day if it arrives after midnight. Note:
  // this can handle the rare (and non-existent?) case where an arrival occurs
  // 48:00 hours (or more) from the start of the service day.

  var departureTimeRemainder = stopTime.realtimeDeparture % ONE_DAY_IN_SECONDS;
  var daysAfterServiceDay = (stopTime.realtimeDeparture - departureTimeRemainder) / ONE_DAY_IN_SECONDS;
  var departureDay = serviceDay.add(daysAfterServiceDay, 'day');
  var vehicleDepartsToday = now.dayOfYear() === departureDay.dayOfYear(); // Determine whether to show departure as countdown (e.g. "5 min") or as HH:mm
  // time.

  var secondsUntilDeparture = stopTime.realtimeDeparture + stopTime.serviceDay - now.unix(); // Determine if vehicle arrives after midnight in order to advance the day of
  // the week when showing arrival time/day.

  var departsInFuture = secondsUntilDeparture > 0; // Show the exact time if the departure happens within an hour.

  var showCountdown = secondsUntilDeparture < ONE_HOUR_IN_SECONDS && departsInFuture; // Use "soon text" (e.g., Due) if vehicle is approaching.

  var countdownString = secondsUntilDeparture < 60 ? soonText : (0, _time.formatDuration)(secondsUntilDeparture);
  var formattedTime = (0, _time.formatSecondsAfterMidnight)(stopTime.realtimeDeparture, // Only show timezone (e.g., PDT) if user is not in home time zone (e.g., user
  // in New York, but viewing a trip planner for service based in Los Angeles).
  inHomeTimezone ? timeFormat : "".concat(timeFormat, " z")); // We only want to show the day of the week if the arrival is on a
  // different day and we're not showing the countdown string. This avoids
  // cases such as when it's Wednesday at 11:55pm and an arrival occurs at
  // Thursday 12:19am. We don't want the time to read: 'Thursday, 24 minutes'.

  var showDayOfWeek = !vehicleDepartsToday && !showCountdown;
  return _react.default.createElement("div", null, _react.default.createElement("div", {
    style: {
      float: 'left'
    }
  }, stopTime.realtimeState === 'UPDATED' ? _react.default.createElement(_icon.default, {
    type: "rss",
    style: {
      color: '#888',
      fontSize: '0.8em',
      marginRight: 2
    }
  }) : _react.default.createElement(_icon.default, {
    type: "clock-o",
    style: {
      color: '#888',
      fontSize: '0.8em',
      marginRight: 2
    }
  })), _react.default.createElement("div", {
    style: {
      marginLeft: 20,
      fontSize: showDayOfWeek ? 12 : 14
    }
  }, showDayOfWeek && _react.default.createElement("div", {
    style: {
      marginBottom: -4
    }
  }, departureDay.format('dddd')), _react.default.createElement("div", null, showCountdown // Show countdown string (e.g., 3 min or Due)
  ? countdownString // Show formatted time (with timezone if user is not in home timezone)
  : formattedTime)));
}

function getRouteIdForPattern(pattern) {
  var patternIdParts = pattern.id.split(':');
  var routeId = patternIdParts[0] + ':' + patternIdParts[1];
  return routeId;
} // helper method to generate status label


function getStatusLabel(delay) {
  // late departure
  if (delay > 60) {
    return _react.default.createElement("div", {
      className: "status-label",
      style: {
        backgroundColor: '#d9534f'
      }
    }, (0, _time.formatDuration)(delay), " Late");
  } // early departure


  if (delay < -60) {
    return _react.default.createElement("div", {
      className: "status-label",
      style: {
        backgroundColor: '#337ab7'
      }
    }, (0, _time.formatDuration)(Math.abs(delay)), " Early");
  } // on-time departure


  return _react.default.createElement("div", {
    className: "status-label",
    style: {
      backgroundColor: '#5cb85c'
    }
  }, "On Time");
} // connect to redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  var showUserSettings = (0, _state.getShowUserSettings)(state.otp);
  var stopViewerConfig = (0, _state.getStopViewerConfig)(state.otp);
  return {
    autoRefreshStopTimes: state.otp.user.autoRefreshStopTimes,
    favoriteStops: state.otp.user.favoriteStops,
    homeTimezone: state.otp.config.homeTimezone,
    viewedStop: state.otp.ui.viewedStop,
    showUserSettings: showUserSettings,
    stopData: state.otp.transitIndex.stops[state.otp.ui.viewedStop.stopId],
    stopViewerArriving: state.otp.config.language.stopViewerArriving,
    stopViewerConfig: stopViewerConfig,
    timeFormat: (0, _time.getTimeFormat)(state.otp.config)
  };
};

var mapDispatchToProps = {
  findStop: _api.findStop,
  findStopTimesForStop: _api.findStopTimesForStop,
  forgetStop: _map.forgetStop,
  rememberStop: _map.rememberStop,
  setLocation: _map.setLocation,
  setMainPanelContent: _ui.setMainPanelContent,
  toggleAutoRefresh: _ui.toggleAutoRefresh
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(StopViewer);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=stop-viewer.js
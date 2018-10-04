'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp2;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactBootstrap = require('react-bootstrap');

var _reactRedux = require('react-redux');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _velocityReact = require('velocity-react');

var _icon = require('../narrative/icon');

var _icon2 = _interopRequireDefault(_icon);

var _ui = require('../../actions/ui');

var _api = require('../../actions/api');

var _map = require('../../actions/map');

var _time = require('../../util/time');

var _itinerary = require('../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var StopViewer = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(StopViewer, _Component);

  function StopViewer() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, StopViewer);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = StopViewer.__proto__ || (0, _getPrototypeOf2.default)(StopViewer)).call.apply(_ref, [this].concat(args))), _this), _this._backClicked = function () {
      _this.props.clearViewedStop();
    }, _this._setLocationFromStop = function (type) {
      var _this$props = _this.props,
          setLocation = _this$props.setLocation,
          stopData = _this$props.stopData;

      var location = {
        name: stopData.name,
        lat: stopData.lat,
        lon: stopData.lon
      };
      setLocation({ type: type, location: location, reverseGeocode: true });
      _this.setState({ popupPosition: null });
    }, _this._onClickPlanTo = function () {
      return _this._setLocationFromStop('to');
    }, _this._onClickPlanFrom = function () {
      return _this._setLocationFromStop('from');
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(StopViewer, [{
    key: 'componentWillMount',


    // load the viewed stop in the store when the Stop Viewer first mounts
    value: function componentWillMount() {
      this.props.findStop({ stopId: this.props.viewedStop.stopId });
    }

    // refresh the stop in the store if the viewed stop changes w/ the
    // Stop Viewer already mounted

  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.viewedStop && nextProps.viewedStop && this.props.viewedStop.stopId !== nextProps.viewedStop.stopId) {
        this.props.findStop({ stopId: nextProps.viewedStop.stopId });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          stopData = _props.stopData,
          hideBackButton = _props.hideBackButton;

      // construct a lookup table mapping routeId (e.g. 'MyAgency:10') to an array of stoptimes

      var stopTimesByRoute = {};
      if (stopData && stopData.routes && stopData.stopTimes) {
        stopData.stopTimes.forEach(function (patternTimes) {
          var routeId = patternTimes.pattern.id.split(':')[0] + ':' + patternTimes.pattern.id.split(':')[1];
          if (!(routeId in stopTimesByRoute)) stopTimesByRoute[routeId] = [];

          var now = (0, _moment2.default)().diff((0, _moment2.default)().startOf('day'), 'seconds');
          var filteredTimes = patternTimes.times.filter(function (stopTime) {
            var diff = stopTime.realtimeDeparture - now;
            return diff >= 0 && diff < 14400;
          });
          stopTimesByRoute[routeId] = stopTimesByRoute[routeId].concat(filteredTimes);
        });
      }

      return _react2.default.createElement(
        'div',
        { className: 'stop-viewer' },
        _react2.default.createElement(
          'div',
          { className: 'stop-viewer-header' },
          !hideBackButton && _react2.default.createElement(
            'div',
            { className: 'back-button-container' },
            _react2.default.createElement(
              _reactBootstrap.Button,
              {
                bsSize: 'small',
                onClick: this._backClicked
              },
              _react2.default.createElement(_icon2.default, { type: 'arrow-left' }),
              'Back'
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'header-text' },
            stopData ? _react2.default.createElement(
              'span',
              null,
              stopData.name
            ) : _react2.default.createElement(
              'span',
              null,
              'Loading Stop..'
            )
          ),
          _react2.default.createElement('div', { style: { clear: 'both' } })
        ),
        stopData && _react2.default.createElement(
          'div',
          { className: 'stop-viewer-body' },
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                'b',
                null,
                'Stop ID'
              ),
              ': ',
              stopData.id
            ),
            _react2.default.createElement(
              'b',
              null,
              'Plan a trip:'
            ),
            ' ',
            _react2.default.createElement(_icon2.default, { type: 'dot-circle-o' }),
            ' ',
            _react2.default.createElement(
              'button',
              { className: 'link-button',
                onClick: this._onClickPlanFrom },
              'From here'
            ),
            ' ',
            '|',
            ' ',
            _react2.default.createElement(_icon2.default, { type: 'map-marker' }),
            ' ',
            _react2.default.createElement(
              'button',
              { className: 'link-button',
                onClick: this._onClickPlanTo },
              'To here'
            )
          ),
          stopData.routes && _react2.default.createElement(
            'div',
            { style: { marginTop: 20 } },
            stopData.routes.sort(_itinerary.routeComparator).map(function (route) {
              return _react2.default.createElement(RouteRow, {
                route: route,
                stopTimes: stopTimesByRoute[route.id],
                key: route.id
              });
            })
          )
        )
      );
    }
  }]);
  return StopViewer;
}(_react.Component), _class.propTypes = {
  hideBackButton: _propTypes2.default.boolean,
  stopData: _propTypes2.default.object,
  viewedStop: _propTypes2.default.object
}, _temp2);

var RouteRow = function (_Component2) {
  (0, _inherits3.default)(RouteRow, _Component2);

  function RouteRow() {
    (0, _classCallCheck3.default)(this, RouteRow);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (RouteRow.__proto__ || (0, _getPrototypeOf2.default)(RouteRow)).call(this));

    _this2._toggleExpandedView = function () {
      _this2.setState({ expanded: !_this2.state.expanded });
    };

    _this2.state = { expanded: false };
    return _this2;
  }

  (0, _createClass3.default)(RouteRow, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          route = _props2.route,
          stopTimes = _props2.stopTimes;

      // sort stop times by next departure

      var sortedStopTimes = null;
      if (stopTimes) {
        sortedStopTimes = stopTimes.sort(function (a, b) {
          if (a.realtimeDeparture < b.realtimeDeparture) return -1;
          if (a.realtimeDeparture > b.realtimeDeparture) return 1;
          return 0;
        });
      }

      return _react2.default.createElement(
        'div',
        { className: 'route-row' },
        _react2.default.createElement(
          'div',
          { className: 'header' },
          _react2.default.createElement(
            'div',
            { className: 'route-name' },
            _react2.default.createElement(
              'b',
              null,
              route.shortName
            ),
            ' ',
            route.longName
          ),
          stopTimes && stopTimes.length > 0 && _react2.default.createElement(
            'div',
            { className: 'next-trip-preview' },
            getFormattedStopTime(sortedStopTimes[0])
          ),
          _react2.default.createElement(
            'div',
            { className: 'expansion-button-container' },
            _react2.default.createElement(
              'button',
              { className: 'expansion-button', onClick: this._toggleExpandedView },
              _react2.default.createElement(_icon2.default, { type: 'chevron-' + (this.state.expanded ? 'up' : 'down') })
            )
          )
        ),
        _react2.default.createElement(
          _velocityReact.VelocityTransitionGroup,
          { enter: { animation: 'slideDown' }, leave: { animation: 'slideUp' } },
          this.state.expanded && _react2.default.createElement(
            'div',
            { className: 'trip-table' },
            _react2.default.createElement(
              'div',
              { style: { fontSize: '11px', color: 'gray' } },
              _react2.default.createElement(
                'div',
                { className: 'trip-table-column-header' },
                'STATUS'
              ),
              _react2.default.createElement(
                'div',
                { className: 'trip-table-column-header' },
                'DEPARTURE'
              ),
              _react2.default.createElement('div', { style: { clear: 'both ' } })
            ),
            stopTimes && sortedStopTimes.map(function (stopTime, i) {
              return _react2.default.createElement(
                'div',
                { className: 'trip-row', style: { marginTop: 6, fontSize: 14 }, key: i },
                _react2.default.createElement(
                  'div',
                  { style: { float: 'right', width: 80 } },
                  stopTime.realtimeState === 'UPDATED' ? getStatusLabel(stopTime.departureDelay) : _react2.default.createElement(
                    'div',
                    { className: 'status-label', style: { backgroundColor: '#bbb' } },
                    'Scheduled'
                  )
                ),
                _react2.default.createElement(
                  'div',
                  { style: { float: 'right', width: 80 } },
                  getFormattedStopTime(stopTime)
                ),
                _react2.default.createElement(
                  'div',
                  { key: i },
                  'To ',
                  stopTime.headsign
                ),
                _react2.default.createElement('div', { style: { clear: 'both ' } })
              );
            })
          )
        )
      );
    }
  }]);
  return RouteRow;
}(_react.Component);

// helper method to generate stop time w/ status icon


function getFormattedStopTime(stopTime) {
  return _react2.default.createElement(
    'span',
    null,
    stopTime.realtimeState === 'UPDATED' ? _react2.default.createElement(_icon2.default, { type: 'rss', style: { color: '#888', fontSize: '0.8em', marginRight: 2 } }) : _react2.default.createElement(_icon2.default, { type: 'clock-o', style: { color: '#888', fontSize: '0.8em', marginRight: 2 } }),
    (0, _time.formatStopTime)(stopTime.realtimeDeparture)
  );
}

// helper method to generate status label
function getStatusLabel(delay) {
  // late departure
  if (delay > 60) {
    return _react2.default.createElement(
      'div',
      { className: 'status-label', style: { backgroundColor: '#d9534f' } },
      (0, _time.formatDuration)(delay),
      ' Late'
    );
  }

  // early departure
  if (delay < -60) {
    return _react2.default.createElement(
      'div',
      { className: 'status-label', style: { backgroundColor: '#337ab7' } },
      (0, _time.formatDuration)(Math.abs(delay)),
      ' Early'
    );
  }

  // on-time departure
  return _react2.default.createElement(
    'div',
    { className: 'status-label', style: { backgroundColor: '#5cb85c' } },
    'On Time'
  );
}

// connect to redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    viewedStop: state.otp.ui.viewedStop,
    stopData: state.otp.transitIndex.stops[state.otp.ui.viewedStop.stopId]
  };
};

var mapDispatchToProps = {
  clearViewedStop: _ui.clearViewedStop,
  findStop: _api.findStop,
  setLocation: _map.setLocation
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(StopViewer);
module.exports = exports['default'];

//# sourceMappingURL=stop-viewer.js
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

var _class, _temp, _class2, _temp2, _class3, _temp3;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _velocityReact = require('velocity-react');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _viewTripButton = require('../../viewers/view-trip-button');

var _viewTripButton2 = _interopRequireDefault(_viewTripButton);

var _itinerary = require('../../../util/itinerary');

var _time = require('../../../util/time');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: support multi-route legs for profile routing

var TransitLegBody = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(TransitLegBody, _Component);

  function TransitLegBody(props) {
    (0, _classCallCheck3.default)(this, TransitLegBody);

    var _this = (0, _possibleConstructorReturn3.default)(this, (TransitLegBody.__proto__ || (0, _getPrototypeOf2.default)(TransitLegBody)).call(this, props));

    _this._onToggleStopsClick = function () {
      _this.setState({ stopsExpanded: !_this.state.stopsExpanded });
    };

    _this._onToggleAlertsClick = function () {
      _this.setState({ alertsExpanded: !_this.state.alertsExpanded });
    };

    _this._onSummaryClick = function () {
      _this.props.setActiveLeg(_this.props.legIndex, _this.props.leg);
    };

    _this.state = {
      alertsExpanded: false,
      stopsExpanded: false
    };
    return _this;
  }

  (0, _createClass3.default)(TransitLegBody, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          customIcons = _props.customIcons,
          leg = _props.leg,
          operator = _props.operator;
      var agencyBrandingUrl = leg.agencyBrandingUrl,
          agencyId = leg.agencyId,
          agencyName = leg.agencyName,
          agencyUrl = leg.agencyUrl,
          alerts = leg.alerts,
          mode = leg.mode,
          routeShortName = leg.routeShortName,
          routeLongName = leg.routeLongName,
          headsign = leg.headsign;
      var _state = this.state,
          alertsExpanded = _state.alertsExpanded,
          stopsExpanded = _state.stopsExpanded;
      // If the config contains an operator with a logo URL, prefer that over the
      // one provided by OTP (which is derived from agency.txt#agency_branding_url)

      var logoUrl = operator && operator.logo || agencyBrandingUrl;
      var iconMode = mode;
      if (typeof customIcons.customModeForLeg === 'function') {
        var customMode = customIcons.customModeForLeg(leg);
        if (customMode) iconMode = customMode;
      }

      return _react2.default.createElement(
        'div',
        { className: 'leg-body' },
        _react2.default.createElement(
          'div',
          { className: 'summary', onClick: this._onSummaryClick },
          _react2.default.createElement(
            'div',
            { className: 'route-name leg-description' },
            _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                'div',
                { className: 'icon' },
                (0, _itinerary.getModeIcon)(iconMode, customIcons)
              )
            ),
            routeShortName && _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                'span',
                { className: 'route-short-name' },
                routeShortName
              )
            ),
            _react2.default.createElement(
              'div',
              { className: 'route-long-name' },
              routeLongName,
              headsign && _react2.default.createElement(
                'span',
                null,
                ' ',
                _react2.default.createElement(
                  'span',
                  { style: { fontWeight: '200' } },
                  'to'
                ),
                ' ',
                headsign
              )
            )
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'agency-info' },
          'Service operated by',
          ' ',
          _react2.default.createElement(
            'a',
            { href: agencyUrl, target: '_blank' },
            agencyName,
            logoUrl && _react2.default.createElement('img', {
              src: logoUrl,
              height: 25,
              style: { marginLeft: '5px' } })
          )
        ),
        alerts && alerts.length > 0 && _react2.default.createElement(
          'div',
          { onClick: this._onToggleAlertsClick, className: 'transit-alerts-toggle' },
          _react2.default.createElement('i', { className: 'fa fa-exclamation-triangle' }),
          ' ',
          alerts.length,
          ' ',
          pluralize('alert', alerts),
          ' ',
          _react2.default.createElement('i', { className: 'fa fa-caret-' + (this.state.alertsExpanded ? 'up' : 'down') })
        ),
        _react2.default.createElement(
          _velocityReact.VelocityTransitionGroup,
          { enter: { animation: 'slideDown' }, leave: { animation: 'slideUp' } },
          alertsExpanded && _react2.default.createElement(AlertsBody, { alerts: leg.alerts })
        ),
        leg.intermediateStops && leg.intermediateStops.length > 0 && _react2.default.createElement(
          'div',
          { className: 'transit-leg-details' },
          _react2.default.createElement(
            'div',
            { onClick: this._onToggleStopsClick, className: 'header' },
            leg.duration && _react2.default.createElement(
              'span',
              null,
              'Ride ',
              (0, _time.formatDuration)(leg.duration)
            ),
            leg.intermediateStops && _react2.default.createElement(
              'span',
              null,
              ' / ',
              leg.intermediateStops.length + 1,
              ' stops ',
              _react2.default.createElement('i', { className: 'fa fa-caret-' + (this.state.stopsExpanded ? 'up' : 'down') })
            ),
            _react2.default.createElement(_viewTripButton2.default, {
              tripId: leg.tripId,
              fromIndex: leg.from.stopIndex,
              toIndex: leg.to.stopIndex
            })
          ),
          _react2.default.createElement(
            _velocityReact.VelocityTransitionGroup,
            { enter: { animation: 'slideDown' }, leave: { animation: 'slideUp' } },
            stopsExpanded ? _react2.default.createElement(IntermediateStops, { stops: leg.intermediateStops }) : null
          ),
          leg.averageWait && _react2.default.createElement(
            'span',
            null,
            'Typical Wait: ',
            (0, _time.formatDuration)(leg.averageWait)
          )
        )
      );
    }
  }]);
  return TransitLegBody;
}(_react.Component), _class.propTypes = {
  leg: _propTypes2.default.object,
  legIndex: _propTypes2.default.number,
  setActiveLeg: _propTypes2.default.func
}, _temp);

// Connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    operator: state.otp.config.operators.find(function (operator) {
      return operator.id === ownProps.leg.agencyId;
    })
  };
};

var mapDispatchToProps = {};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TransitLegBody);

var RouteName = function (_Component2) {
  (0, _inherits3.default)(RouteName, _Component2);

  function RouteName() {
    (0, _classCallCheck3.default)(this, RouteName);
    return (0, _possibleConstructorReturn3.default)(this, (RouteName.__proto__ || (0, _getPrototypeOf2.default)(RouteName)).apply(this, arguments));
  }

  (0, _createClass3.default)(RouteName, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          routeShortName = _props2.routeShortName,
          routeLongName = _props2.routeLongName,
          headsign = _props2.headsign,
          key = _props2.key,
          customIcons = _props2.customIcons;


      return _react2.default.createElement(
        'div',
        { key: key, className: 'route-name leg-description' },
        ' ',
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'div',
            { className: 'icon' },
            (0, _itinerary.getModeIcon)(mode, customIcons)
          )
        ),
        routeShortName && _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'span',
            { className: 'route-short-name' },
            routeShortName
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'route-long-name' },
          routeLongName,
          headsign && _react2.default.createElement(
            'span',
            null,
            ' ',
            _react2.default.createElement(
              'span',
              { style: { fontWeight: '200' } },
              'to'
            ),
            ' ',
            headsign
          )
        )
      );
    }
  }]);
  return RouteName;
}(_react.Component);

var IntermediateStops = (_temp2 = _class2 = function (_Component3) {
  (0, _inherits3.default)(IntermediateStops, _Component3);

  function IntermediateStops() {
    (0, _classCallCheck3.default)(this, IntermediateStops);
    return (0, _possibleConstructorReturn3.default)(this, (IntermediateStops.__proto__ || (0, _getPrototypeOf2.default)(IntermediateStops)).apply(this, arguments));
  }

  (0, _createClass3.default)(IntermediateStops, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'intermediate-stops' },
        this.props.stops.map(function (stop, k) {
          return _react2.default.createElement(
            'div',
            { className: 'stop-row', key: k },
            _react2.default.createElement(
              'div',
              { className: 'stop-marker' },
              '\u2022'
            ),
            _react2.default.createElement(
              'div',
              { className: 'stop-name' },
              stop.name
            )
          );
        })
      );
    }
  }]);
  return IntermediateStops;
}(_react.Component), _class2.propTypes = {
  stops: _propTypes2.default.array
}, _temp2);
var AlertsBody = (_temp3 = _class3 = function (_Component4) {
  (0, _inherits3.default)(AlertsBody, _Component4);

  function AlertsBody() {
    (0, _classCallCheck3.default)(this, AlertsBody);
    return (0, _possibleConstructorReturn3.default)(this, (AlertsBody.__proto__ || (0, _getPrototypeOf2.default)(AlertsBody)).apply(this, arguments));
  }

  (0, _createClass3.default)(AlertsBody, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'transit-alerts' },
        this.props.alerts.sort(function (a, b) {
          return a.effectiveStartDate < b.effectiveStartDate ? 1 : -1;
        }).map(function (alert, k) {
          var effectiveStartDate = (0, _moment2.default)(alert.effectiveStartDate);
          var effectiveDateString = 'Effective as of ';
          var daysAway = (0, _moment2.default)().diff(effectiveStartDate, 'days');
          if (Math.abs(daysAway) <= 1) effectiveDateString += (0, _moment2.default)(effectiveStartDate).format('h:MMa, ');
          effectiveDateString += effectiveStartDate.calendar(null, { sameElse: 'MMMM D, YYYY' }).split(' at')[0];
          return _react2.default.createElement(
            'div',
            { key: k, className: 'transit-alert' },
            _react2.default.createElement(
              'div',
              { className: 'alert-icon' },
              _react2.default.createElement('i', { className: 'fa fa-exclamation-triangle' })
            ),
            _react2.default.createElement(
              'div',
              { className: 'alert-body' },
              alert.alertDescriptionText
            ),
            _react2.default.createElement(
              'div',
              { className: 'effective-date' },
              effectiveDateString
            )
          );
        })
      );
    }
  }]);
  return AlertsBody;
}(_react.Component), _class3.propTypes = {
  alerts: _propTypes2.default.array
}, _temp3);

// TODO use pluralize that for internationalization (and complex plurals, i.e., not just adding 's')

function pluralize(str, list) {
  return '' + str + (list.length > 1 ? 's' : '');
}
module.exports = exports['default'];

//# sourceMappingURL=transit-leg-body.js
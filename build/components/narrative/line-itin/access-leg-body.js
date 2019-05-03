'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

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

var _class, _temp, _class2, _temp2;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _velocityReact = require('velocity-react');

var _currencyFormatter = require('currency-formatter');

var _currencyFormatter2 = _interopRequireDefault(_currencyFormatter);

var _legDiagramPreview = require('../leg-diagram-preview');

var _legDiagramPreview2 = _interopRequireDefault(_legDiagramPreview);

var _distance = require('../../../util/distance');

var _itinerary = require('../../../util/itinerary');

var _time = require('../../../util/time');

var _ui = require('../../../util/ui');

var _directionIcon = require('../../icons/direction-icon');

var _directionIcon2 = _interopRequireDefault(_directionIcon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AccessLegBody = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(AccessLegBody, _Component);

  function AccessLegBody(props) {
    (0, _classCallCheck3.default)(this, AccessLegBody);

    var _this = (0, _possibleConstructorReturn3.default)(this, (AccessLegBody.__proto__ || (0, _getPrototypeOf2.default)(AccessLegBody)).call(this, props));

    _this._onStepsHeaderClick = function () {
      _this.setState({ expanded: !_this.state.expanded });
    };

    _this._onSummaryClick = function () {
      _this.props.setActiveLeg(_this.props.legIndex, _this.props.leg);
    };

    _this.state = { expanded: false };
    return _this;
  }

  (0, _createClass3.default)(AccessLegBody, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          customIcons = _props.customIcons,
          leg = _props.leg,
          legMode = _props.legMode,
          timeOptions = _props.timeOptions,
          followsTransit = _props.followsTransit;


      if (leg.mode === 'CAR' && leg.hailedCar) {
        return _react2.default.createElement(TNCLeg, { leg: leg, legMode: legMode, onSummaryClick: this._onSummaryClick, timeOptions: timeOptions, followsTransit: followsTransit, customIcons: customIcons });
      }

      return _react2.default.createElement(
        'div',
        { className: 'leg-body' },
        _react2.default.createElement(AccessLegSummary, { leg: leg, legMode: legMode, onSummaryClick: this._onSummaryClick, customIcons: customIcons }),
        _react2.default.createElement(
          'div',
          { onClick: this._onStepsHeaderClick, className: 'steps-header' },
          (0, _time.formatDuration)(leg.duration),
          leg.steps && _react2.default.createElement(
            'span',
            null,
            ' ',
            _react2.default.createElement('i', { className: 'fa fa-caret-' + (this.state.expanded ? 'up' : 'down') })
          )
        ),
        _react2.default.createElement(
          _velocityReact.VelocityTransitionGroup,
          { enter: { animation: 'slideDown' }, leave: { animation: 'slideUp' } },
          this.state.expanded && _react2.default.createElement(AccessLegSteps, { steps: leg.steps })
        ),
        this.props.routingType === 'ITINERARY' && _react2.default.createElement(_legDiagramPreview2.default, { leg: leg })
      );
    }
  }]);
  return AccessLegBody;
}(_react.Component), _class.propTypes = {
  leg: _propTypes2.default.object,
  legMode: _propTypes2.default.any,
  routingType: _propTypes2.default.string
}, _temp);
exports.default = AccessLegBody;

var TNCLeg = function (_Component2) {
  (0, _inherits3.default)(TNCLeg, _Component2);

  function TNCLeg() {
    (0, _classCallCheck3.default)(this, TNCLeg);
    return (0, _possibleConstructorReturn3.default)(this, (TNCLeg.__proto__ || (0, _getPrototypeOf2.default)(TNCLeg)).apply(this, arguments));
  }

  (0, _createClass3.default)(TNCLeg, [{
    key: 'render',
    value: function render() {
      // TODO: ensure that client ID fields are populated
      var _props2 = this.props,
          customIcons = _props2.customIcons,
          leg = _props2.leg,
          legMode = _props2.legMode,
          timeOptions = _props2.timeOptions,
          followsTransit = _props2.followsTransit,
          LYFT_CLIENT_ID = _props2.LYFT_CLIENT_ID,
          UBER_CLIENT_ID = _props2.UBER_CLIENT_ID;

      var universalLinks = {
        'UBER': 'https://m.uber.com/' + ((0, _ui.isMobile)() ? 'ul/' : '') + '?client_id=' + UBER_CLIENT_ID + '&action=setPickup&pickup[latitude]=' + leg.from.lat + '&pickup[longitude]=' + leg.from.lon + '&pickup[formatted_address]=' + encodeURI(leg.from.name) + '&dropoff[latitude]=' + leg.to.lat + '&dropoff[longitude]=' + leg.to.lon + '&dropoff[formatted_address]=' + encodeURI(leg.to.name),
        'LYFT': 'https://lyft.com/ride?id=lyft&partner=' + LYFT_CLIENT_ID + '&pickup[latitude]=' + leg.from.lat + '&pickup[longitude]=' + leg.from.lon + '&destination[latitude]=' + leg.to.lat + '&destination[longitude]=' + leg.to.lon
      };
      var tncData = leg.tncData;


      if (!tncData || !tncData.estimatedArrival) return null;
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'div',
          { className: 'place-subheader' },
          'Wait ',
          !followsTransit && _react2.default.createElement(
            'span',
            null,
            Math.round(tncData.estimatedArrival / 60),
            ' minutes '
          ),
          'for ',
          tncData.displayName,
          ' pickup'
        ),
        _react2.default.createElement(
          'div',
          { className: 'leg-body' },
          _react2.default.createElement(AccessLegSummary, { leg: leg, legMode: legMode, onSummaryClick: this.props.onSummaryClick, customIcons: customIcons }),
          _react2.default.createElement(
            'div',
            { style: { marginTop: 10, marginBottom: 10, height: 32, position: 'relative' } },
            _react2.default.createElement(
              'a',
              {
                className: 'btn btn-default',
                href: universalLinks[tncData.company],
                style: { position: 'absolute', top: 0, left: 0, height: 32, paddingTop: 4, width: 90, textAlign: 'center' },
                target: (0, _ui.isMobile)() ? '_self' : '_blank'
              },
              'Book Ride'
            ),
            followsTransit && _react2.default.createElement('div', { style: { position: 'absolute', top: 0, left: 94, width: 0, height: 0, borderTop: '16px solid transparent', borderBottom: '16px solid transparent', borderRight: '16px solid #fcf9d3' } }),
            followsTransit && _react2.default.createElement(
              'div',
              { style: { position: 'absolute', top: 0, left: 110, right: 0, bottom: 0 } },
              _react2.default.createElement(
                'div',
                { style: { display: 'table', backgroundColor: '#fcf9d3', width: '100%', height: '100%' } },
                _react2.default.createElement(
                  'div',
                  { style: { padding: '0px 2px', display: 'table-cell', verticalAlign: 'middle', color: '#444', fontStyle: 'italic', lineHeight: 0.95 } },
                  'Wait until ',
                  (0, _time.formatTime)(leg.startTime - tncData.estimatedArrival * 1000, timeOptions),
                  ' to book'
                )
              )
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'steps-header' },
            'Estimated travel time: ',
            (0, _time.formatDuration)(leg.duration),
            ' (does not account for traffic)'
          ),
          tncData.minCost && _react2.default.createElement(
            'p',
            null,
            'Estimated cost: ',
            _currencyFormatter2.default.format(tncData.minCost, { code: tncData.currency }) + ' - ' + _currencyFormatter2.default.format(tncData.maxCost, { code: tncData.currency })
          )
        )
      );
    }
  }]);
  return TNCLeg;
}(_react.Component);

var AccessLegSummary = function (_Component3) {
  (0, _inherits3.default)(AccessLegSummary, _Component3);

  function AccessLegSummary() {
    (0, _classCallCheck3.default)(this, AccessLegSummary);
    return (0, _possibleConstructorReturn3.default)(this, (AccessLegSummary.__proto__ || (0, _getPrototypeOf2.default)(AccessLegSummary)).apply(this, arguments));
  }

  (0, _createClass3.default)(AccessLegSummary, [{
    key: 'render',
    value: function render() {
      var _props3 = this.props,
          customIcons = _props3.customIcons,
          leg = _props3.leg,
          legMode = _props3.legMode;

      return _react2.default.createElement(
        'div',
        { className: 'summary leg-description', onClick: this.props.onSummaryClick },
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'div',
            { className: 'icon' },
            (0, _itinerary.getModeIcon)(legMode, customIcons)
          )
        ),
        _react2.default.createElement(
          'div',
          null,
          (0, _itinerary.getLegModeString)(leg),
          ' ',
          leg.distance && _react2.default.createElement(
            'span',
            null,
            ' ',
            (0, _distance.distanceString)(leg.distance)
          ),
          ' to ' + (0, _itinerary.getPlaceName)(leg.to)
        )
      );
    }
  }]);
  return AccessLegSummary;
}(_react.Component);

var AccessLegSteps = (_temp2 = _class2 = function (_Component4) {
  (0, _inherits3.default)(AccessLegSteps, _Component4);

  function AccessLegSteps() {
    (0, _classCallCheck3.default)(this, AccessLegSteps);
    return (0, _possibleConstructorReturn3.default)(this, (AccessLegSteps.__proto__ || (0, _getPrototypeOf2.default)(AccessLegSteps)).apply(this, arguments));
  }

  (0, _createClass3.default)(AccessLegSteps, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'steps' },
        this.props.steps.map(function (step, k) {
          return _react2.default.createElement(
            'div',
            { className: 'step-row', key: k },
            _react2.default.createElement(
              'div',
              { style: { width: 16, height: 16, float: 'left', fill: '#999999' } },
              _react2.default.createElement(_directionIcon2.default, { relativeDirection: step.relativeDirection })
            ),
            _react2.default.createElement(
              'div',
              { style: { marginLeft: 24, lineHeight: 1.25, paddingTop: 1 } },
              (0, _itinerary.getStepDirection)(step),
              _react2.default.createElement(
                'span',
                null,
                step.relativeDirection === 'ELEVATOR' ? ' to ' : ' on '
              ),
              _react2.default.createElement(
                'span',
                { style: { fontWeight: 500 } },
                (0, _itinerary.getStepStreetName)(step)
              )
            )
          );
        })
      );
    }
  }]);
  return AccessLegSteps;
}(_react.Component), _class2.propTypes = {
  steps: _propTypes2.default.array
}, _temp2);
module.exports = exports['default'];

//# sourceMappingURL=access-leg-body.js
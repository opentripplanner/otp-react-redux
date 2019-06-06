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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _locationIcon = require('../../icons/location-icon');

var _locationIcon2 = _interopRequireDefault(_locationIcon);

var _viewStopButton = require('../../viewers/view-stop-button');

var _viewStopButton2 = _interopRequireDefault(_viewStopButton);

var _itinerary = require('../../../util/itinerary');

var _time = require('../../../util/time');

var _transitLegBody = require('./transit-leg-body');

var _transitLegBody2 = _interopRequireDefault(_transitLegBody);

var _accessLegBody = require('./access-leg-body');

var _accessLegBody2 = _interopRequireDefault(_accessLegBody);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: make this a prop
var defaultRouteColor = '#008';

var PlaceRow = function (_Component) {
  (0, _inherits3.default)(PlaceRow, _Component);

  function PlaceRow() {
    (0, _classCallCheck3.default)(this, PlaceRow);
    return (0, _possibleConstructorReturn3.default)(this, (PlaceRow.__proto__ || (0, _getPrototypeOf2.default)(PlaceRow)).apply(this, arguments));
  }

  (0, _createClass3.default)(PlaceRow, [{
    key: '_createLegLine',
    value: function _createLegLine(leg) {
      switch (leg.mode) {
        case 'WALK':
          return _react2.default.createElement('div', { className: 'leg-line leg-line-walk' });
        case 'BICYCLE':
        case 'BICYCLE_RENT':
          return _react2.default.createElement('div', { className: 'leg-line leg-line-bicycle' });
        case 'CAR':
          return _react2.default.createElement('div', { className: 'leg-line leg-line-car' });
        case 'MICROMOBILITY':
        case 'MICROMOBILITY_RENT':
          return _react2.default.createElement('div', { className: 'leg-line leg-line-vehicle' });
        default:
          return _react2.default.createElement('div', { className: 'leg-line leg-line-transit', style: {
              backgroundColor: leg.routeColor ? '#' + leg.routeColor : defaultRouteColor
            } });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          customIcons = _props.customIcons,
          leg = _props.leg,
          legIndex = _props.legIndex,
          place = _props.place,
          time = _props.time,
          timeOptions = _props.timeOptions,
          followsTransit = _props.followsTransit,
          previousLeg = _props.previousLeg;

      var stackIcon = function stackIcon(name, color, size) {
        return _react2.default.createElement('i', { className: 'fa fa-' + name + ' fa-stack-1x', style: { color: color, fontSize: size + 'px' } });
      };

      var icon = void 0;
      if (!leg) {
        // This is the itinerary destination
        icon = _react2.default.createElement(
          'span',
          { className: 'fa-stack place-icon-group' },
          stackIcon('circle', 'white', 26),
          _react2.default.createElement(_locationIcon2.default, { type: 'to', className: 'fa-stack-1x', style: { fontSize: 20 } })
        );
      } else if (legIndex === 0) {
        // The is the origin
        icon = _react2.default.createElement(
          'span',
          { className: 'fa-stack place-icon-group' },
          stackIcon('circle', 'white', 26),
          _react2.default.createElement(_locationIcon2.default, { type: 'from', className: 'fa-stack-1x', style: { fontSize: 20 } })
        );
      } else {
        // This is an intermediate place
        icon = _react2.default.createElement(
          'span',
          { className: 'fa-stack place-icon-group' },
          stackIcon('circle', 'white', 22),
          stackIcon('circle-o', 'black', 22)
        );
      }

      var interline = leg && leg.interlineWithPreviousLeg;
      var changeVehicles = previousLeg && previousLeg.to.stopId === leg.from.stopId && (0, _itinerary.isTransit)(previousLeg.mode) && (0, _itinerary.isTransit)(leg.mode);
      var special = interline || changeVehicles;
      return _react2.default.createElement(
        'div',
        { className: 'place-row', key: this.rowKey++ },
        _react2.default.createElement(
          'div',
          { className: 'time' },
          time && (0, _time.formatTime)(time, timeOptions)
        ),
        _react2.default.createElement(
          'div',
          { className: 'line-container' },
          leg && this._createLegLine(leg),
          _react2.default.createElement(
            'div',
            null,
            !special && icon
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'place-details' },
          special && _react2.default.createElement(
            'div',
            { className: 'interline-dot' },
            '\u2022'
          ),
          _react2.default.createElement(
            'div',
            { className: 'place-name' },
            interline ? _react2.default.createElement(
              'div',
              { className: 'interline-name' },
              'Stay on Board at ',
              _react2.default.createElement(
                'b',
                null,
                place.name
              )
            ) : changeVehicles ? _react2.default.createElement(
              'div',
              { className: 'interline-name' },
              'Change Vehicles at ',
              _react2.default.createElement(
                'b',
                null,
                place.name
              )
            ) : _react2.default.createElement(
              'div',
              null,
              (0, _itinerary.getPlaceName)(place)
            )
          ),
          place.stopId && !special && _react2.default.createElement(
            'div',
            { className: 'place-subheader' },
            _react2.default.createElement(
              'span',
              null,
              'Stop ID ',
              place.stopId.split(':')[1]
            ),
            _react2.default.createElement(_viewStopButton2.default, { stopId: place.stopId })
          ),
          leg && leg.rentedBike && _react2.default.createElement(
            'div',
            { className: 'place-subheader' },
            'Pick up shared bike'
          ),
          leg && leg.rentedCar && _react2.default.createElement(
            'div',
            { className: 'place-subheader' },
            'Pick up ',
            leg.from.networks ? leg.from.networks.join('/') : 'rented car',
            ' ',
            leg.from.name
          ),
          leg && leg.rentedVehicle && _react2.default.createElement(
            'div',
            { className: 'place-subheader' },
            'Pick up ',
            leg.from.networks ? leg.from.networks.join('/') : 'rented vehicle',
            ' ',
            leg.from.name
          ),
          leg && (leg.transitLeg ? /* This is a transit leg */
          _react2.default.createElement(_transitLegBody2.default, {
            leg: leg,
            legIndex: legIndex,
            setActiveLeg: this.props.setActiveLeg,
            customIcons: customIcons
          }) : /* This is an access (e.g. walk/bike/etc.) leg */
          _react2.default.createElement(_accessLegBody2.default, {
            leg: leg,
            legIndex: legIndex,
            legMode: (0, _itinerary.getLegMode)(this.props.companies, leg).legMode,
            routingType: this.props.routingType,
            setActiveLeg: this.props.setActiveLeg,
            timeOptions: timeOptions,
            followsTransit: followsTransit,
            customIcons: customIcons
          }))
        )
      );
    }
  }]);
  return PlaceRow;
}(_react.Component);

exports.default = PlaceRow;
module.exports = exports['default'];

//# sourceMappingURL=place-row.js
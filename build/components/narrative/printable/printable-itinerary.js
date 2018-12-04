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

var _class, _temp, _class2, _temp2, _class3, _temp3, _class4, _temp4;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _modeIcon = require('../../icons/mode-icon');

var _modeIcon2 = _interopRequireDefault(_modeIcon);

var _tripDetails = require('../trip-details');

var _tripDetails2 = _interopRequireDefault(_tripDetails);

var _time = require('../../../util/time');

var _itinerary = require('../../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PrintableItinerary = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(PrintableItinerary, _Component);

  function PrintableItinerary() {
    (0, _classCallCheck3.default)(this, PrintableItinerary);
    return (0, _possibleConstructorReturn3.default)(this, (PrintableItinerary.__proto__ || (0, _getPrototypeOf2.default)(PrintableItinerary)).apply(this, arguments));
  }

  (0, _createClass3.default)(PrintableItinerary, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          itinerary = _props.itinerary,
          companies = _props.companies;

      return _react2.default.createElement(
        'div',
        { className: 'printable-itinerary' },
        itinerary.legs.map(function (leg, k) {
          return leg.transitLeg ? _react2.default.createElement(TransitLeg, { key: k, leg: leg }) : leg.hailedCar ? _react2.default.createElement(TNCLeg, { leg: leg, legMode: (0, _itinerary.getLegMode)(companies, leg) }) : _react2.default.createElement(AccessLeg, { key: k, leg: leg });
        }),
        _react2.default.createElement(_tripDetails2.default, { itinerary: itinerary })
      );
    }
  }]);
  return PrintableItinerary;
}(_react.Component), _class.propTypes = {
  itinerary: _propTypes2.default.object
}, _temp);
exports.default = PrintableItinerary;
var TransitLeg = (_temp2 = _class2 = function (_Component2) {
  (0, _inherits3.default)(TransitLeg, _Component2);

  function TransitLeg() {
    (0, _classCallCheck3.default)(this, TransitLeg);
    return (0, _possibleConstructorReturn3.default)(this, (TransitLeg.__proto__ || (0, _getPrototypeOf2.default)(TransitLeg)).apply(this, arguments));
  }

  (0, _createClass3.default)(TransitLeg, [{
    key: 'render',
    value: function render() {
      var leg = this.props.leg;

      return _react2.default.createElement(
        'div',
        { className: 'leg' },
        _react2.default.createElement(
          'div',
          { className: 'mode-icon' },
          _react2.default.createElement(_modeIcon2.default, { mode: leg.mode })
        ),
        _react2.default.createElement(
          'div',
          { className: 'leg-body' },
          _react2.default.createElement(
            'div',
            { className: 'leg-header' },
            _react2.default.createElement(
              'b',
              null,
              leg.routeShortName,
              ' ',
              leg.routeLongName
            ),
            ' to ',
            _react2.default.createElement(
              'b',
              null,
              leg.to.name
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'leg-details' },
            _react2.default.createElement(
              'div',
              { className: 'leg-detail' },
              'Board at ',
              _react2.default.createElement(
                'b',
                null,
                leg.from.name
              ),
              ' at ',
              (0, _time.formatTime)(leg.startTime)
            ),
            _react2.default.createElement(
              'div',
              { className: 'leg-detail' },
              'Get off at ',
              _react2.default.createElement(
                'b',
                null,
                leg.to.name
              ),
              ' at ',
              (0, _time.formatTime)(leg.endTime)
            )
          )
        )
      );
    }
  }]);
  return TransitLeg;
}(_react.Component), _class2.propTypes = {
  leg: _propTypes2.default.object
}, _temp2);
var AccessLeg = (_temp3 = _class3 = function (_Component3) {
  (0, _inherits3.default)(AccessLeg, _Component3);

  function AccessLeg() {
    (0, _classCallCheck3.default)(this, AccessLeg);
    return (0, _possibleConstructorReturn3.default)(this, (AccessLeg.__proto__ || (0, _getPrototypeOf2.default)(AccessLeg)).apply(this, arguments));
  }

  (0, _createClass3.default)(AccessLeg, [{
    key: 'render',
    value: function render() {
      var leg = this.props.leg;

      return _react2.default.createElement(
        'div',
        { className: 'leg' },
        _react2.default.createElement(
          'div',
          { className: 'mode-icon' },
          _react2.default.createElement(_modeIcon2.default, { mode: leg.mode })
        ),
        _react2.default.createElement(
          'div',
          { className: 'leg-body' },
          _react2.default.createElement(
            'div',
            { className: 'leg-header' },
            _react2.default.createElement(
              'b',
              null,
              (0, _itinerary.getLegModeString)(leg)
            ),
            ' to ',
            _react2.default.createElement(
              'b',
              null,
              leg.to.name
            )
          ),
          !leg.hailedCar && _react2.default.createElement(
            'div',
            { className: 'leg-details' },
            leg.steps.map(function (step, k) {
              return _react2.default.createElement(
                'div',
                { key: k, className: 'leg-detail' },
                (0, _itinerary.getStepDirection)(step),
                ' on ',
                _react2.default.createElement(
                  'b',
                  null,
                  (0, _itinerary.getStepStreetName)(step)
                )
              );
            })
          )
        )
      );
    }
  }]);
  return AccessLeg;
}(_react.Component), _class3.propTypes = {
  leg: _propTypes2.default.object
}, _temp3);
var TNCLeg = (_temp4 = _class4 = function (_Component4) {
  (0, _inherits3.default)(TNCLeg, _Component4);

  function TNCLeg() {
    (0, _classCallCheck3.default)(this, TNCLeg);
    return (0, _possibleConstructorReturn3.default)(this, (TNCLeg.__proto__ || (0, _getPrototypeOf2.default)(TNCLeg)).apply(this, arguments));
  }

  (0, _createClass3.default)(TNCLeg, [{
    key: 'render',
    value: function render() {
      var leg = this.props.leg;
      var tncData = leg.tncData;

      if (!tncData) return null;

      return _react2.default.createElement(
        'div',
        { className: 'leg' },
        _react2.default.createElement(
          'div',
          { className: 'mode-icon' },
          _react2.default.createElement(_modeIcon2.default, { mode: leg.mode })
        ),
        _react2.default.createElement(
          'div',
          { className: 'leg-body' },
          _react2.default.createElement(
            'div',
            { className: 'leg-header' },
            _react2.default.createElement(
              'b',
              null,
              'Take ',
              tncData.displayName
            ),
            ' to ',
            _react2.default.createElement(
              'b',
              null,
              leg.to.name
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'leg-details' },
            _react2.default.createElement(
              'div',
              { className: 'leg-detail' },
              'Estimated wait time for pickup: ',
              _react2.default.createElement(
                'b',
                null,
                (0, _time.formatDuration)(tncData.estimatedArrival)
              )
            ),
            _react2.default.createElement(
              'div',
              { className: 'leg-detail' },
              'Estimated travel time: ',
              _react2.default.createElement(
                'b',
                null,
                (0, _time.formatDuration)(leg.duration)
              ),
              ' (does not account for traffic)'
            )
          )
        )
      );
    }
  }]);
  return TNCLeg;
}(_react.Component), _class4.propTypes = {
  leg: _propTypes2.default.object
}, _temp4);
module.exports = exports['default'];

//# sourceMappingURL=printable-itinerary.js
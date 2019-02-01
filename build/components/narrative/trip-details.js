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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactBootstrap = require('react-bootstrap');

var _velocityReact = require('velocity-react');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _itinerary = require('../../util/itinerary');

var _time = require('../../util/time');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TripDetails = function (_Component) {
  (0, _inherits3.default)(TripDetails, _Component);

  function TripDetails() {
    (0, _classCallCheck3.default)(this, TripDetails);
    return (0, _possibleConstructorReturn3.default)(this, (TripDetails.__proto__ || (0, _getPrototypeOf2.default)(TripDetails)).apply(this, arguments));
  }

  (0, _createClass3.default)(TripDetails, [{
    key: 'render',
    value: function render() {
      var itinerary = this.props.itinerary;

      var date = (0, _moment2.default)(itinerary.startTime);

      // process the transit fare

      var _calculateFares = (0, _itinerary.calculateFares)(itinerary),
          centsToString = _calculateFares.centsToString,
          dollarsToString = _calculateFares.dollarsToString,
          maxTNCFare = _calculateFares.maxTNCFare,
          minTNCFare = _calculateFares.minTNCFare,
          transitFare = _calculateFares.transitFare;

      var companies = void 0;
      itinerary.legs.forEach(function (leg) {
        if (leg.tncData) {
          companies = leg.tncData.company;
        }
      });
      var fare = void 0;
      if (transitFare || minTNCFare) {
        fare = _react2.default.createElement(
          'span',
          null,
          transitFare && _react2.default.createElement(
            'span',
            null,
            'Transit Fare: ',
            _react2.default.createElement(
              'b',
              null,
              centsToString(transitFare)
            )
          ),
          minTNCFare !== 0 && _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement('br', null),
            _react2.default.createElement(
              'span',
              { style: { textTransform: 'capitalize' } },
              companies.toLowerCase()
            ),
            ' ',
            'Fare: ',
            _react2.default.createElement(
              'b',
              null,
              dollarsToString(minTNCFare),
              ' - ',
              dollarsToString(maxTNCFare)
            )
          )
        );
      }

      // Compute calories burned.

      var _calculatePhysicalAct = (0, _itinerary.calculatePhysicalActivity)(itinerary),
          bikeDuration = _calculatePhysicalAct.bikeDuration,
          caloriesBurned = _calculatePhysicalAct.caloriesBurned,
          walkDuration = _calculatePhysicalAct.walkDuration;

      var timeOptions = {
        format: 'h:mm a',
        offset: (0, _itinerary.getTimeZoneOffset)(itinerary)
      };

      return _react2.default.createElement(
        'div',
        { className: 'trip-details' },
        _react2.default.createElement(
          'div',
          { className: 'trip-details-header' },
          'Trip Details'
        ),
        _react2.default.createElement(
          'div',
          { className: 'trip-details-body' },
          _react2.default.createElement(TripDetail, {
            icon: _react2.default.createElement('i', { className: 'fa fa-calendar' }),
            summary: _react2.default.createElement(
              'span',
              null,
              _react2.default.createElement(
                'span',
                null,
                'Depart ',
                _react2.default.createElement(
                  'b',
                  null,
                  date.format('MMMM DD, YYYY')
                )
              ),
              this.props.routingType === 'ITINERARY' && _react2.default.createElement(
                'span',
                null,
                ' at ',
                _react2.default.createElement(
                  'b',
                  null,
                  (0, _time.formatTime)(itinerary.startTime, timeOptions)
                )
              )
            )
          }),
          fare && _react2.default.createElement(TripDetail, {
            icon: _react2.default.createElement('i', { className: 'fa fa-money' }),
            summary: fare
          }),
          caloriesBurned > 0 && _react2.default.createElement(TripDetail, {
            icon: _react2.default.createElement('i', { className: 'fa fa-heartbeat' }),
            summary: _react2.default.createElement(
              'span',
              null,
              'Calories Burned: ',
              _react2.default.createElement(
                'b',
                null,
                Math.round(caloriesBurned)
              )
            ),
            description: _react2.default.createElement(
              'span',
              null,
              'Calories burned is based on ',
              _react2.default.createElement(
                'b',
                null,
                Math.round(walkDuration / 60),
                ' minute(s)'
              ),
              ' ',
              'spent walking and ',
              _react2.default.createElement(
                'b',
                null,
                Math.round(bikeDuration / 60),
                ' minute(s)'
              ),
              ' ',
              'spent biking during this trip. Adapted from',
              ' ',
              _react2.default.createElement(
                'a',
                {
                  href: 'https://health.gov/dietaryguidelines/dga2005/document/html/chapter3.htm#table4',
                  target: '_blank' },
                'Dietary Guidelines for Americans 2005, page 16, Table 4'
              ),
              '.'
            )
          })
        )
      );
    }
  }]);
  return TripDetails;
}(_react.Component);

var TripDetail = function (_Component2) {
  (0, _inherits3.default)(TripDetail, _Component2);

  function TripDetail(props) {
    (0, _classCallCheck3.default)(this, TripDetail);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (TripDetail.__proto__ || (0, _getPrototypeOf2.default)(TripDetail)).call(this, props));

    _this2._onExpandClick = function () {
      _this2.setState({ expanded: true });
    };

    _this2._onHideClick = function () {
      _this2.setState({ expanded: false });
    };

    _this2.state = {
      expanded: false
    };
    return _this2;
  }

  (0, _createClass3.default)(TripDetail, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          icon = _props.icon,
          summary = _props.summary,
          description = _props.description;

      return _react2.default.createElement(
        'div',
        { className: 'trip-detail' },
        _react2.default.createElement(
          'div',
          { className: 'icon' },
          icon
        ),
        _react2.default.createElement(
          'div',
          { className: 'summary' },
          summary,
          description && _react2.default.createElement(
            _reactBootstrap.Button,
            {
              className: 'expand-button clear-button-formatting',
              onClick: this._onExpandClick
            },
            _react2.default.createElement('i', { className: 'fa fa-question-circle' })
          ),
          _react2.default.createElement(
            _velocityReact.VelocityTransitionGroup,
            { enter: { animation: 'slideDown' }, leave: { animation: 'slideUp' } },
            this.state.expanded && _react2.default.createElement(
              'div',
              { className: 'description' },
              _react2.default.createElement(
                _reactBootstrap.Button,
                {
                  className: 'hide-button clear-button-formatting',
                  onClick: this._onHideClick
                },
                _react2.default.createElement('i', { className: 'fa fa-close' })
              ),
              description
            )
          )
        )
      );
    }
  }]);
  return TripDetail;
}(_react.Component);

// Connect main class to redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    routingType: state.otp.currentQuery.routingType,
    tnc: state.otp.tnc
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps)(TripDetails);
module.exports = exports['default'];

//# sourceMappingURL=trip-details.js
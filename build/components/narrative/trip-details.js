'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultTncRideTypes = {
  'LYFT': 'lyft',
  'UBER': 'a6eef2e1-c99a-436f-bde9-fefb9181c0b0'
};

var TripDetails = function (_Component) {
  (0, _inherits3.default)(TripDetails, _Component);

  function TripDetails() {
    (0, _classCallCheck3.default)(this, TripDetails);
    return (0, _possibleConstructorReturn3.default)(this, (TripDetails.__proto__ || (0, _getPrototypeOf2.default)(TripDetails)).apply(this, arguments));
  }

  (0, _createClass3.default)(TripDetails, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          itinerary = _props.itinerary,
          companies = _props.companies,
          tnc = _props.tnc;

      var date = (0, _moment2.default)(itinerary.startTime);

      // process the transit fare
      var transitFare = void 0;
      if (itinerary.fare && itinerary.fare.fare && itinerary.fare.fare.regular) {
        var reg = itinerary.fare.fare.regular;
        transitFare = reg.currency.symbol + (reg.cents / Math.pow(10, reg.currency.defaultFractionDigits)).toFixed(reg.currency.defaultFractionDigits);
      }

      // Process any TNC fares
      var minTNCFare = 0;
      var maxTNCFare = 0;
      if (tnc) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = (0, _getIterator3.default)(itinerary.legs), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var leg = _step.value;

            if (leg.mode === 'CAR' && leg.hailedCar) {
              var from = (0, _itinerary.getTNCLocation)(leg, 'from');
              var to = (0, _itinerary.getTNCLocation)(leg, 'to');
              if (tnc && tnc.rideEstimates && tnc.rideEstimates[from] && tnc.rideEstimates[from][to] && tnc.rideEstimates[from][to][companies]) {
                var estimate = tnc.rideEstimates[from][to][companies][defaultTncRideTypes[companies]];
                // TODO: Support non-USD
                minTNCFare += estimate.minCost;
                maxTNCFare += estimate.maxCost;
              }
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        if (minTNCFare) minTNCFare = '$' + minTNCFare.toFixed(2);
        if (maxTNCFare) maxTNCFare = '$' + maxTNCFare.toFixed(2);
      }

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
              transitFare
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
            ' Fare: ',
            _react2.default.createElement(
              'b',
              null,
              minTNCFare,
              ' - ',
              maxTNCFare
            )
          )
        );
      }

      // compute calories burned
      var walkDuration = 0;
      var bikeDuration = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(itinerary.legs), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _leg = _step2.value;

          if (_leg.mode.startsWith('WALK')) walkDuration += _leg.duration;
          if (_leg.mode.startsWith('BICYCLE')) bikeDuration += _leg.duration;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var caloriesBurned = walkDuration / 3600 * 280 + bikeDuration / 3600 * 290;

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
                  date.format('h:mma')
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
              ' spent walking and ',
              _react2.default.createElement(
                'b',
                null,
                Math.round(bikeDuration / 60),
                ' minute(s)'
              ),
              ' spent biking during this trip. Adapted from ',
              _react2.default.createElement(
                'a',
                { href: 'https://health.gov/dietaryguidelines/dga2005/document/html/chapter3.htm#table4', target: '_blank' },
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
      var _props2 = this.props,
          icon = _props2.icon,
          summary = _props2.summary,
          description = _props2.description;

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
    companies: state.otp.currentQuery.companies,
    tnc: state.otp.tnc
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps)(TripDetails);
module.exports = exports['default'];

//# sourceMappingURL=trip-details.js
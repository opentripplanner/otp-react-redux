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

var _currencyFormatter = require('currency-formatter');

var _currencyFormatter2 = _interopRequireDefault(_currencyFormatter);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _api = require('../../../actions/api');

var _itinerary = require('../../../util/itinerary');

var _time = require('../../../util/time');

var _ui = require('../../../util/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TransportationNetworkCompanyLeg = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(TransportationNetworkCompanyLeg, _Component);

  function TransportationNetworkCompanyLeg() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, TransportationNetworkCompanyLeg);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = TransportationNetworkCompanyLeg.__proto__ || (0, _getPrototypeOf2.default)(TransportationNetworkCompanyLeg)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(TransportationNetworkCompanyLeg, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this._resolveTncData(this.props, true);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this._resolveTncData(nextProps);
    }
  }, {
    key: '_resolveTncData',
    value: function _resolveTncData(props, isMounting) {
      var companies = props.companies,
          getTransportationNetworkCompanyEtaEstimate = props.getTransportationNetworkCompanyEtaEstimate,
          getTransportationNetworkCompanyRideEstimate = props.getTransportationNetworkCompanyRideEstimate,
          leg = props.leg,
          tncData = props.tncData;

      var from = getTNCLocation(leg, 'from');
      var to = getTNCLocation(leg, 'to');
      var rideType = defaultTncRideTypes[companies];
      var now = new Date().getTime();

      var stateUpdate = {
        eta: null,
        rideEstimate: null
      };

      var hasTncEtaData = tncData.etaEstimates[from] && tncData.etaEstimates[from][companies] && tncData.etaEstimates[from][companies][rideType];

      var tncEtaDataIsValid = hasTncEtaData && tncData.etaEstimates[from][companies][rideType].estimateTimestamp.getTime() + 30000 > now;

      if (hasTncEtaData && tncEtaDataIsValid) {
        stateUpdate.eta = tncData.etaEstimates[from][companies][rideType];
      } else if (isMounting || hasTncEtaData && !tncEtaDataIsValid) {
        getTransportationNetworkCompanyEtaEstimate({
          companies: companies, from: from
        });
      } else {
        stateUpdate.noEtaEstimateAvailable = true;
      }

      var hasTncRideData = tncData.rideEstimates[from] && tncData.rideEstimates[from][to] && tncData.rideEstimates[from][to][companies] && tncData.rideEstimates[from][to][companies][rideType];

      var tncRideDataIsValid = hasTncRideData && tncData.rideEstimates[from][to][companies][rideType].estimateTimestamp.getTime() + 30000 > now;

      if (hasTncRideData && tncRideDataIsValid) {
        stateUpdate.rideEstimate = tncData.rideEstimates[from][to][companies][rideType];
      } else if (isMounting || hasTncRideData && !tncRideDataIsValid) {
        getTransportationNetworkCompanyRideEstimate({
          company: companies, from: from, rideType: rideType, to: to
        });
      } else {
        stateUpdate.noRideEstimateAvailable = true;
      }

      this.setState(stateUpdate);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          leg = _props.leg,
          legMode = _props.legMode,
          LYFT_CLIENT_ID = _props.LYFT_CLIENT_ID,
          UBER_CLIENT_ID = _props.UBER_CLIENT_ID;

      var universalLinks = {
        'UBER': 'https://m.uber.com/' + ((0, _ui.isMobile)() ? 'ul/' : '') + '?client_id=' + UBER_CLIENT_ID + '&action=setPickup&pickup[latitude]=' + leg.from.lat + '&pickup[longitude]=' + leg.from.lon + '&pickup[nickname]=' + encodeURI(leg.from.name) + '&dropoff[latitude]=' + leg.to.lat + '&dropoff[longitude]=' + leg.to.lon + '&dropoff[nickname]=' + encodeURI(leg.to.name),
        'LYFT': 'https://lyft.com/ride?id=' + defaultTncRideTypes['LYFT'] + '&partner=' + LYFT_CLIENT_ID + '&pickup[latitude]=' + leg.from.lat + '&pickup[longitude]=' + leg.from.lon + '&destination[latitude]=' + leg.to.lat + '&destination[longitude]=' + leg.to.lon
      };
      var _state = this.state,
          eta = _state.eta,
          noEtaEstimateAvailable = _state.noEtaEstimateAvailable,
          noRideEstimateAvailable = _state.noRideEstimateAvailable,
          rideEstimate = _state.rideEstimate;

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'p',
          null,
          '* estimated travel time does not account for traffic.'
        ),
        _react2.default.createElement(
          'a',
          {
            className: 'btn btn-default',
            href: universalLinks[legMode.label.toUpperCase()],
            style: { marginBottom: 15 },
            target: (0, _ui.isMobile)() ? '_self' : '_blank'
          },
          'Book Ride'
        ),
        !eta && !noEtaEstimateAvailable && _react2.default.createElement(
          'p',
          null,
          'Getting eta estimate from ',
          (0, _itinerary.toSentenceCase)(legMode.label),
          '...'
        ),
        !eta && noEtaEstimateAvailable && _react2.default.createElement(
          'p',
          null,
          'Could not obtain eta estimate from ',
          (0, _itinerary.toSentenceCase)(legMode.label),
          '!'
        ),
        eta && _react2.default.createElement(
          'p',
          null,
          'ETA for a driver: ',
          (0, _time.formatDuration)(eta.estimatedSeconds)
        ),
        !rideEstimate && !noRideEstimateAvailable && _react2.default.createElement(
          'p',
          null,
          'Getting ride estimate from ',
          (0, _itinerary.toSentenceCase)(legMode.label),
          '...'
        ),
        !rideEstimate && noRideEstimateAvailable && _react2.default.createElement(
          'p',
          null,
          'Could not obtain ride estimate from ',
          (0, _itinerary.toSentenceCase)(legMode.label),
          '!'
        ),
        rideEstimate && _react2.default.createElement(
          'p',
          null,
          'Estimated cost: ',
          _currencyFormatter2.default.format(rideEstimate.minCost, { code: rideEstimate.currency }) + ' - ' + _currencyFormatter2.default.format(rideEstimate.maxCost, { code: rideEstimate.currency })
        )
      );
    }
  }]);
  return TransportationNetworkCompanyLeg;
}(_react.Component), _class.propTypes = {
  leg: _react.PropTypes.object,
  legMode: _react.PropTypes.object
}, _temp2);


function getTNCLocation(leg, type) {
  var location = leg[type];
  return location.lat.toFixed(5) + ',' + location.lon.toFixed(5);
}

var defaultTncRideTypes = {
  'LYFT': 'lyft',
  'UBER': 'a6eef2e1-c99a-436f-bde9-fefb9181c0b0'
};

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var _state$otp$config = state.otp.config,
      LYFT_CLIENT_ID = _state$otp$config.LYFT_CLIENT_ID,
      UBER_CLIENT_ID = _state$otp$config.UBER_CLIENT_ID;

  return {
    companies: state.otp.currentQuery.companies,
    tncData: state.otp.tnc,
    LYFT_CLIENT_ID: LYFT_CLIENT_ID,
    UBER_CLIENT_ID: UBER_CLIENT_ID
  };
};

var mapDispatchToProps = {
  getTransportationNetworkCompanyEtaEstimate: _api.getTransportationNetworkCompanyEtaEstimate,
  getTransportationNetworkCompanyRideEstimate: _api.getTransportationNetworkCompanyRideEstimate
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TransportationNetworkCompanyLeg);
module.exports = exports['default'];

//# sourceMappingURL=tnc-leg.js
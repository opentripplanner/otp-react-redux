'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _reactRedux = require('react-redux');

var _api = require('../../actions/api');

var _itinerary = require('../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TNCWrapper = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(TNCWrapper, _Component);

  function TNCWrapper() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, TNCWrapper);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = TNCWrapper.__proto__ || (0, _getPrototypeOf2.default)(TNCWrapper)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(TNCWrapper, [{
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

      var from = (0, _itinerary.getTNCLocation)(leg, 'from');
      var to = (0, _itinerary.getTNCLocation)(leg, 'to');
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
      var _state = this.state,
          eta = _state.eta,
          noEtaEstimateAvailable = _state.noEtaEstimateAvailable,
          noRideEstimateAvailable = _state.noRideEstimateAvailable,
          rideEstimate = _state.rideEstimate;

      return _react2.default.createElement(this.props.componentClass, (0, _extends3.default)({
        eta: eta,
        noEtaEstimateAvailable: noEtaEstimateAvailable,
        rideEstimate: rideEstimate,
        noRideEstimateAvailable: noRideEstimateAvailable
      }, this.props));
    }
  }]);
  return TNCWrapper;
}(_react.Component), _class.propTypes = {
  leg: _react.PropTypes.object,
  legMode: _react.PropTypes.object
}, _temp2);


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

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TNCWrapper);
module.exports = exports['default'];

//# sourceMappingURL=tnc-wrapper.js
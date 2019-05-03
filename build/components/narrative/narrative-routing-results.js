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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _loading = require('./loading');

var _loading2 = _interopRequireDefault(_loading);

var _narrativeProfileOptions = require('./narrative-profile-options');

var _narrativeProfileOptions2 = _interopRequireDefault(_narrativeProfileOptions);

var _tabbedItineraries = require('./tabbed-itineraries');

var _tabbedItineraries2 = _interopRequireDefault(_tabbedItineraries);

var _errorMessage = require('../form/error-message');

var _errorMessage2 = _interopRequireDefault(_errorMessage);

var _state = require('../../util/state');

var _ui = require('../../actions/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NarrativeRoutingResults = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(NarrativeRoutingResults, _Component);

  function NarrativeRoutingResults() {
    (0, _classCallCheck3.default)(this, NarrativeRoutingResults);
    return (0, _possibleConstructorReturn3.default)(this, (NarrativeRoutingResults.__proto__ || (0, _getPrototypeOf2.default)(NarrativeRoutingResults)).apply(this, arguments));
  }

  (0, _createClass3.default)(NarrativeRoutingResults, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if ((!this.props.itineraries || this.props.itineraries.length === 0) && nextProps.itineraries && nextProps.itineraries.length > 0) {
        this.props.setMainPanelContent(null);
      }
      if (!this.props.error && nextProps.error) this.props.setMainPanelContent(null);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          customIcons = _props.customIcons,
          error = _props.error,
          itineraryClass = _props.itineraryClass,
          itineraryFooter = _props.itineraryFooter,
          pending = _props.pending,
          routingType = _props.routingType,
          itineraries = _props.itineraries,
          mainPanelContent = _props.mainPanelContent;

      if (pending) return _react2.default.createElement(_loading2.default, null);
      if (error) return _react2.default.createElement(_errorMessage2.default, null);
      if (mainPanelContent) return null;

      return routingType === 'ITINERARY' ? _react2.default.createElement(_tabbedItineraries2.default, { itineraryClass: itineraryClass, itineraryFooter: itineraryFooter, itineraries: itineraries, customIcons: customIcons }) : _react2.default.createElement(_narrativeProfileOptions2.default, {
        itineraryClass: itineraryClass,
        customIcons: customIcons
      });
    }
  }]);
  return NarrativeRoutingResults;
}(_react.Component), _class.propTypes = {
  customIcons: _react.PropTypes.object,
  itineraryClass: _react.PropTypes.func,
  routingType: _react.PropTypes.string
}, _temp);


var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  return {
    mainPanelContent: state.otp.ui.mainPanelContent,
    error: activeSearch && activeSearch.response && activeSearch.response.error,
    itineraries: (0, _state.getActiveItineraries)(state.otp),
    pending: activeSearch && activeSearch.pending,
    routingType: activeSearch && activeSearch.query.routingType
  };
};

var mapDispatchToProps = {
  setMainPanelContent: _ui.setMainPanelContent
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(NarrativeRoutingResults);
module.exports = exports['default'];

//# sourceMappingURL=narrative-routing-results.js
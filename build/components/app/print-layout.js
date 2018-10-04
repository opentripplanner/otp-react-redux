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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reactBootstrap = require('react-bootstrap');

var _baseMap = require('../map/base-map');

var _baseMap2 = _interopRequireDefault(_baseMap);

var _endpointsOverlay = require('../map/endpoints-overlay');

var _endpointsOverlay2 = _interopRequireDefault(_endpointsOverlay);

var _transitiveOverlay = require('../map/transitive-overlay');

var _transitiveOverlay2 = _interopRequireDefault(_transitiveOverlay);

var _printableItinerary = require('../narrative/printable/printable-itinerary');

var _printableItinerary2 = _interopRequireDefault(_printableItinerary);

var _form = require('../../actions/form');

var _state = require('../../util/state');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PrintLayout = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(PrintLayout, _Component);

  function PrintLayout(props) {
    (0, _classCallCheck3.default)(this, PrintLayout);

    var _this = (0, _possibleConstructorReturn3.default)(this, (PrintLayout.__proto__ || (0, _getPrototypeOf2.default)(PrintLayout)).call(this, props));

    _this._toggleMap = function () {
      _this.setState({ mapVisible: !_this.state.mapVisible });
    };

    _this._print = function () {
      window.print();
    };

    _this.state = {
      mapVisible: true
    };
    return _this;
  }

  (0, _createClass3.default)(PrintLayout, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var location = this.props.location;
      // Parse the URL query parameters, if present

      if (location && location.search) {
        this.props.parseUrlQueryString(location.search);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          itinerary = _props.itinerary,
          companies = _props.companies;

      return _react2.default.createElement(
        'div',
        { className: 'otp' },
        _react2.default.createElement(
          'div',
          { className: 'print-layout-container' },
          _react2.default.createElement(
            'div',
            { className: 'print-layout' },
            _react2.default.createElement(
              'div',
              { className: 'header' },
              _react2.default.createElement(
                'div',
                { style: { float: 'right' } },
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  { bsSize: 'small', onClick: this._toggleMap },
                  _react2.default.createElement('i', { className: 'fa fa-map' }),
                  ' Toggle Map'
                ),
                ' ',
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  { bsSize: 'small', onClick: this._print },
                  _react2.default.createElement('i', { className: 'fa fa-print' }),
                  ' Print'
                )
              ),
              'Itinerary'
            ),
            this.state.mapVisible && _react2.default.createElement(
              'div',
              { className: 'map-container' },
              _react2.default.createElement(
                _baseMap2.default,
                null,
                _react2.default.createElement(_transitiveOverlay2.default, null),
                _react2.default.createElement(_endpointsOverlay2.default, null)
              )
            ),
            itinerary && _react2.default.createElement(_printableItinerary2.default, { itinerary: itinerary, companies: companies })
          )
        )
      );
    }
  }]);
  return PrintLayout;
}(_react.Component), _class.propTypes = {
  itinerary: _propTypes2.default.object,
  parseQueryString: _propTypes2.default.func
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    itinerary: (0, _state.getActiveItinerary)(state.otp),
    companies: state.otp.currentQuery.companies
  };
};

var mapDispatchToProps = {
  parseUrlQueryString: _form.parseUrlQueryString
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(PrintLayout);
module.exports = exports['default'];

//# sourceMappingURL=print-layout.js
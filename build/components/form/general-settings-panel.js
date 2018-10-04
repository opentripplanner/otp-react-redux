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

var _dropdownSelector = require('./dropdown-selector');

var _dropdownSelector2 = _interopRequireDefault(_dropdownSelector);

var _queryParams = require('../../util/query-params');

var _queryParams2 = _interopRequireDefault(_queryParams);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GeneralSettingsPanel = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(GeneralSettingsPanel, _Component);

  function GeneralSettingsPanel() {
    (0, _classCallCheck3.default)(this, GeneralSettingsPanel);
    return (0, _possibleConstructorReturn3.default)(this, (GeneralSettingsPanel.__proto__ || (0, _getPrototypeOf2.default)(GeneralSettingsPanel)).apply(this, arguments));
  }

  (0, _createClass3.default)(GeneralSettingsPanel, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          paramNames = _props.paramNames,
          query = _props.query;

      return _react2.default.createElement(
        'div',
        { className: 'general-settings-panel' },
        paramNames.map(function (param) {
          var paramInfo = _queryParams2.default.find(function (qp) {
            return qp.name === param;
          });
          // Check that the parameter applies to the specified routingType
          if (!paramInfo.routingTypes.includes(query.routingType)) return;

          // Check that the applicability test (if provided) is satisfied
          if (typeof paramInfo.applicable === 'function' && !paramInfo.applicable(query)) return;

          // Create the UI component based on the selector type
          switch (paramInfo.selector) {
            case 'DROPDOWN':
              return _react2.default.createElement(_dropdownSelector2.default, {
                key: paramInfo.name,
                name: paramInfo.name,
                value: query[paramInfo.name],
                label: typeof paramInfo.label === 'function' ? paramInfo.label(query) : paramInfo.label,
                options: typeof paramInfo.options === 'function' ? paramInfo.options(query) : paramInfo.options
              });
          }
        })
      );
    }
  }]);
  return GeneralSettingsPanel;
}(_react.Component), _class.propTypes = {
  query: _react.PropTypes.object,
  paramNames: _react.PropTypes.array
}, _class.defaultProps = {
  // The universe of properties to include in this form:
  // TODO: allow override in config
  paramNames: ['maxWalkDistance', 'maxWalkTime', 'walkSpeed', 'maxBikeDistance', 'maxBikeTime', 'bikeSpeed', 'optimize', 'optimizeBike']
}, _temp);

// connect to redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    query: state.otp.currentQuery
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
  return {};
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(GeneralSettingsPanel);
module.exports = exports['default'];

//# sourceMappingURL=general-settings-panel.js
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

var _reactBootstrap = require('react-bootstrap');

var _reactRedux = require('react-redux');

var _itinerary = require('../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SettingsPreview = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(SettingsPreview, _Component);

  function SettingsPreview() {
    (0, _classCallCheck3.default)(this, SettingsPreview);
    return (0, _possibleConstructorReturn3.default)(this, (SettingsPreview.__proto__ || (0, _getPrototypeOf2.default)(SettingsPreview)).apply(this, arguments));
  }

  (0, _createClass3.default)(SettingsPreview, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          caret = _props.caret,
          companies = _props.companies,
          editButtonText = _props.editButtonText,
          icons = _props.icons,
          modeGroups = _props.modeGroups,
          queryModes = _props.queryModes;


      var totalModeCount = 0;
      modeGroups.forEach(function (g) {
        totalModeCount += g.modes.length;
      });

      var selectedModeCount = this.props.queryModes.length;

      var selectedModes = _react2.default.createElement(
        'div',
        { className: 'selected-modes' },
        selectedModeCount === totalModeCount ? _react2.default.createElement(
          'div',
          { className: 'all-selected' },
          'All Modes Selected'
        ) : _react2.default.createElement(
          'div',
          { className: 'some-selected' },
          _react2.default.createElement(
            'div',
            { className: 'some-selected-label' },
            selectedModeCount,
            ' Modes Selected'
          ),
          _react2.default.createElement(
            'div',
            { className: 'some-selected-modes' },
            queryModes.map(function (mode) {
              return _react2.default.createElement(
                'div',
                { className: 'mode-icon', key: mode },
                (0, _itinerary.getModeIcon)(mode === 'CAR_HAIL' ? {
                  mode: 'CAR_HAIL',
                  company: companies
                } : mode, icons)
              );
            })
          )
        )
      );

      var button = _react2.default.createElement(
        'div',
        { className: 'button-container' },
        _react2.default.createElement(
          _reactBootstrap.Button,
          { className: 'settings-button', onClick: this.props.onClick },
          editButtonText,
          caret && _react2.default.createElement(
            'span',
            null,
            ' ',
            _react2.default.createElement('i', { className: 'fa fa-caret-' + caret })
          )
        )
      );

      return this.props.compressed ? /* 'compressed' layout -- button is below selected mode preview */_react2.default.createElement(
        'div',
        { className: 'settings-preview compressed' },
        selectedModes,
        button
      ) : /* 'wide' layout -- button and selected mode preview are side-by-side  */_react2.default.createElement(
        'div',
        { className: 'settings-preview wide' },
        button,
        selectedModes,
        _react2.default.createElement('div', { style: { clear: 'both' } })
      );
    }
  }]);
  return SettingsPreview;
}(_react.Component), _class.propTypes = {
  // component props
  caret: _react.PropTypes.string,
  compressed: _react.PropTypes.bool,
  editButtonText: _react.PropTypes.element,
  icons: _react.PropTypes.object,
  showCaret: _react.PropTypes.bool,
  onClick: _react.PropTypes.func,

  // application state
  companies: _react.PropTypes.string,
  modeGroups: _react.PropTypes.array,
  queryModes: _react.PropTypes.array
}, _class.defaultProps = {
  editButtonText: _react2.default.createElement('i', { className: 'fa fa-pencil' })
}, _temp);


var mapStateToProps = function mapStateToProps(state, ownProps) {
  var _state$otp = state.otp,
      config = _state$otp.config,
      currentQuery = _state$otp.currentQuery;
  var companies = currentQuery.companies,
      mode = currentQuery.mode;

  return {
    companies: companies,
    modeGroups: config.modeGroups,
    queryModes: mode.split(',')
  };
};

var mapDispatchToProps = {};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(SettingsPreview);
module.exports = exports['default'];

//# sourceMappingURL=settings-preview.js
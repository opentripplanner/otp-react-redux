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

var _form = require('../../actions/form');

var _modeButton = require('./mode-button');

var _modeButton2 = _interopRequireDefault(_modeButton);

var _itinerary = require('../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ModesPanel = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(ModesPanel, _Component);

  function ModesPanel() {
    (0, _classCallCheck3.default)(this, ModesPanel);
    return (0, _possibleConstructorReturn3.default)(this, (ModesPanel.__proto__ || (0, _getPrototypeOf2.default)(ModesPanel)).apply(this, arguments));
  }

  (0, _createClass3.default)(ModesPanel, [{
    key: '_getVisibleModes',
    value: function _getVisibleModes(group) {
      var _this2 = this;

      // Don't show the CAR_HAIL services in profile modes
      // TODO: this could be handled more elegantly?
      return group.modes.filter(function (mode) {
        return mode.mode !== 'CAR_HAIL' || _this2.props.routingType !== 'PROFILE';
      });
    }

    // Returns whether a particular mode or TNC agency is active

  }, {
    key: '_modeIsActive',
    value: function _modeIsActive(mode) {
      var _props = this.props,
          companies = _props.companies,
          queryModes = _props.queryModes;

      if (mode.mode === 'CAR_HAIL') {
        return Boolean(companies && companies.includes(mode.label.toUpperCase()));
      } else {
        return queryModes.includes(mode.mode || mode);
      }
    }
  }, {
    key: '_setGroupSelected',
    value: function _setGroupSelected(group, isSelected) {
      var queryModes = this.props.queryModes.slice(0); // Clone the modes array

      this._getVisibleModes(group).forEach(function (mode) {
        var modeStr = mode.mode || mode;
        queryModes = queryModes.filter(function (m) {
          return m !== modeStr;
        });
        if (isSelected) queryModes.push(modeStr);
      });

      // Update the mode array in the store
      this.props.setQueryParam({ mode: queryModes.join(',') });
    }
  }, {
    key: '_toggleMode',
    value: function _toggleMode(mode) {
      var modeStr = mode.mode || mode;

      var _props2 = this.props,
          routingType = _props2.routingType,
          setQueryParam = _props2.setQueryParam;

      var queryModes = this.props.queryModes.slice(0); // Clone the modes array

      var queryParamUpdate = {};

      // Special case: we are in ITINERARY mode and changing the one access mode
      if (routingType === 'ITINERARY' && (0, _itinerary.isAccessMode)(modeStr)) {
        queryModes = queryModes.filter(function (m) {
          return !(0, _itinerary.isAccessMode)(m);
        });
        queryModes.push(modeStr);

        // do extra stuff if mode selected was a TNC
        queryParamUpdate.companies = modeStr === 'CAR_HAIL' ? mode.label.toUpperCase() : null;

        // Otherwise, if mode is currently selected, deselect it
      } else if (queryModes.includes(modeStr)) {
        queryModes = queryModes.filter(function (m) {
          return m !== modeStr;
        });

        // Or, if mode is currently not selected, select it
      } else if (!queryModes.includes(modeStr)) {
        queryModes.push(modeStr);
      }

      queryParamUpdate.mode = queryModes.join(',');

      // Update the mode array in the store
      setQueryParam(queryParamUpdate);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var _props3 = this.props,
          icons = _props3.icons,
          modeGroups = _props3.modeGroups,
          routingType = _props3.routingType;


      return _react2.default.createElement(
        'div',
        { className: 'modes-panel' },
        modeGroups.map(function (group, k) {
          var groupModes = _this3._getVisibleModes(group);
          // Determine whether to show Select/Deselect All actions
          var accessCount = groupModes.filter(function (m) {
            return (0, _itinerary.isAccessMode)(m.mode || m);
          }).length;
          var showGroupSelect = (routingType === 'PROFILE' || routingType === 'ITINERARY' && accessCount === 0) && groupModes.length > 1;

          return _react2.default.createElement(
            'div',
            { className: 'mode-group-row', key: k },
            _react2.default.createElement(
              'div',
              { className: 'group-header' },
              showGroupSelect && _react2.default.createElement(
                'div',
                { className: 'group-select' },
                _react2.default.createElement(
                  'button',
                  { className: 'link-button',
                    onClick: function onClick() {
                      return _this3._setGroupSelected(group, true);
                    }
                  },
                  'Select All'
                ),
                ' ',
                '|',
                ' ',
                _react2.default.createElement(
                  'button',
                  { className: 'link-button',
                    onClick: function onClick() {
                      return _this3._setGroupSelected(group, false);
                    }
                  },
                  'Unselect All'
                )
              ),
              _react2.default.createElement(
                'div',
                { className: 'group-name' },
                group.name
              )
            ),
            _react2.default.createElement(
              'div',
              { className: 'group-icons' },
              groupModes.map(function (mode) {
                return _react2.default.createElement(_modeButton2.default, {
                  active: _this3._modeIsActive(mode),
                  icons: icons,
                  key: mode.mode ? mode.mode + '-' + mode.label : mode,
                  mode: mode,
                  label: mode.label || readableModeString(mode),
                  onClick: function onClick() {
                    return _this3._toggleMode(mode);
                  }
                });
              })
            )
          );
        })
      );
    }
  }]);
  return ModesPanel;
}(_react.Component), _class.propTypes = {
  icons: _react.PropTypes.object,
  modeGroups: _react.PropTypes.array,
  queryModes: _react.PropTypes.array,
  setQueryParam: _react.PropTypes.func
}, _temp);

// Make a mode string more readable (e.g. 'BICYCLE_RENT' -> 'Bicycle Rent')

function readableModeString(mode) {
  var str = mode.replace('_', ' ');
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

// connect to redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var _state$otp$currentQue = state.otp.currentQuery,
      companies = _state$otp$currentQue.companies,
      mode = _state$otp$currentQue.mode,
      routingType = _state$otp$currentQue.routingType;

  return {
    companies: companies,
    modeGroups: state.otp.config.modeGroups,
    queryModes: !mode || mode.length === 0 ? [] : mode.split(','),
    routingType: routingType
  };
};

var mapDispatchToProps = { setQueryParam: _form.setQueryParam };

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ModesPanel);
module.exports = exports['default'];

//# sourceMappingURL=modes-panel.js
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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactBootstrap = require('react-bootstrap');

var _velocityReact = require('velocity-react');

var _form = require('../../actions/form');

var _modeButton = require('./mode-button');

var _modeButton2 = _interopRequireDefault(_modeButton);

var _itinerary = require('../../util/itinerary');

var _generalSettingsPanel = require('./general-settings-panel');

var _generalSettingsPanel2 = _interopRequireDefault(_generalSettingsPanel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SettingsSelectorPanel = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(SettingsSelectorPanel, _Component);

  function SettingsSelectorPanel(props) {
    (0, _classCallCheck3.default)(this, SettingsSelectorPanel);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SettingsSelectorPanel.__proto__ || (0, _getPrototypeOf2.default)(SettingsSelectorPanel)).call(this, props));

    _this._setTransit = function () {
      if (_this._lastTransitMode) {
        // returning to transit from active mode
        _this.props.setQueryParam({ mode: _this._lastTransitMode });
        _this._lastTransitMode = null;
      } else {
        _this.props.setQueryParam({ mode: 'WALK,TRAM,BUS,RAIL,GONDOLA' });
      }
    };

    _this._setWalkOnly = function () {
      _this._setSoloMode('WALK');
    };

    _this._setBikeOnly = function () {
      _this._setSoloMode('BICYCLE');
    };

    _this._setOwnBike = function () {
      var nonBikeModes = _this.props.queryModes.filter(function (m) {
        return !m.startsWith('BICYCLE');
      });
      _this.props.setQueryParam({ mode: 'BICYCLE,' + nonBikeModes.join(',') });
    };

    _this._setRentedBike = function () {
      var nonBikeModes = _this.props.queryModes.filter(function (m) {
        return !m.startsWith('BICYCLE');
      });
      _this.props.setQueryParam({ mode: 'BICYCLE_RENT,' + nonBikeModes.join(',') });
    };

    _this._setAccessMode = function (mode) {
      var queryModes = _this.props.queryModes.slice(0); // Clone the modes array
      var modeStr = mode.mode || mode;
      var queryParamUpdate = {};

      queryModes = queryModes.filter(function (m) {
        return !(0, _itinerary.isAccessMode)(m);
      });
      queryModes.push(modeStr);

      // do extra stuff if mode selected was a TNC
      queryParamUpdate.companies = modeStr === 'CAR_HAIL' ? mode.company.toUpperCase() : null;

      queryParamUpdate.mode = queryModes.join(',');

      _this.props.setQueryParam(queryParamUpdate);
    };

    _this.state = { activePanel: 'MODES' };
    return _this;
  }

  // Returns whether a particular mode or TNC agency is active


  (0, _createClass3.default)(SettingsSelectorPanel, [{
    key: '_modeIsActive',
    value: function _modeIsActive(mode) {
      var _props = this.props,
          companies = _props.companies,
          queryModes = _props.queryModes;

      if (mode.mode === 'CAR_HAIL') {
        return Boolean(companies && companies.includes(mode.company.toUpperCase()));
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(queryModes), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var m = _step.value;

          if (m.startsWith(mode.mode)) return true;
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

      return false;
    }
  }, {
    key: '_setSoloMode',
    value: function _setSoloMode(mode) {
      // save current access/transit modes
      if ((0, _itinerary.hasTransit)(this.props.mode)) this._lastTransitMode = this.props.mode;
      this.props.setQueryParam({ mode: mode });
    }
  }, {
    key: '_toggleTransitMode',
    value: function _toggleTransitMode(mode) {
      var modeStr = mode.mode || mode;
      var queryModes = this.props.queryModes.slice(0); // Clone the modes array

      // do not allow the last transit mode to be deselected
      var transitModes = queryModes.filter(function (m) {
        return (0, _itinerary.isTransit)(m);
      });
      if (transitModes.length === 1 && transitModes[0] === modeStr) return;

      // If mode is currently selected, deselect it
      if (queryModes.includes(modeStr)) {
        queryModes = queryModes.filter(function (m) {
          return m !== modeStr;
        });
        // Or, if mode is currently not selected, select it
      } else if (!queryModes.includes(modeStr)) {
        queryModes.push(modeStr);
      }
      this.props.setQueryParam({ mode: queryModes.join(',') });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props2 = this.props,
          mode = _props2.mode,
          icons = _props2.icons,
          queryModes = _props2.queryModes;


      var modeHasTransit = (0, _itinerary.hasTransit)(mode);

      var transitModes = [{
        mode: 'BUS',
        label: 'Bus'
      }, {
        mode: 'TRAM',
        label: 'MAX & Streetcar'
      }, {
        mode: 'RAIL',
        label: 'Wes'
      }, {
        mode: 'GONDOLA',
        label: 'Aerial Tram'
      }];

      var accessModes = [{
        mode: 'WALK',
        label: 'Walk + Transit'
      }, {
        mode: 'BICYCLE',
        label: 'Bike + Transit'
      }, {
        mode: 'CAR_PARK',
        label: 'Park & Ride'
      }, {
        mode: 'CAR_HAIL',
        company: 'UBER',
        label: 'Uber + Transit'
      }, {
        mode: 'CAR_HAIL',
        company: 'LYFT',
        label: 'Lyft + Transit'
      }, {
        mode: 'CAR_RENT',
        label: 'car2go + Transit'
      }];

      var bikeOptions = [{
        mode: 'BICYCLE',
        label: 'Own Bike',
        iconWidth: 18,
        action: this._setOwnBike
      }, {
        mode: 'BICYCLE_RENT',
        label: 'Biketown',
        iconWidth: 36,
        action: this._setRentedBike
      }];

      var sideButtonStyle = {
        height: 60,
        lineHeight: '1.1',
        fontSize: 12,
        borderLeft: '1px solid #f0f0f0',
        textAlign: 'center',
        padding: '6px 0px'
      };
      return _react2.default.createElement(
        'div',
        { className: 'settings-selector-panel' },
        _react2.default.createElement(
          _reactBootstrap.Row,
          { className: 'button-row' },
          _react2.default.createElement(
            _reactBootstrap.Col,
            { xs: 12 },
            _react2.default.createElement(
              _reactBootstrap.ButtonGroup,
              { justified: true },
              _react2.default.createElement(
                _reactBootstrap.ButtonGroup,
                { key: 'transit', style: { width: '100%' } },
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  { style: { height: 60 },
                    className: modeHasTransit ? 'selected' : '',
                    onClick: this._setTransit
                  },
                  _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                      'div',
                      { style: { display: 'inline-block', marginRight: 10, width: 30, height: 30, verticalAlign: 'middle' } },
                      (0, _itinerary.getModeIcon)('TRANSIT', icons)
                    ),
                    _react2.default.createElement(
                      'div',
                      { style: { display: 'inline-block', fontSize: 28, fontWeight: 500, verticalAlign: 'middle' } },
                      'Take Transit'
                    )
                  )
                )
              ),
              _react2.default.createElement(
                _reactBootstrap.ButtonGroup,
                { key: 'walk-only', style: { width: 45 } },
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  { style: sideButtonStyle,
                    className: mode === 'WALK' ? 'selected' : '',
                    onClick: this._setWalkOnly
                  },
                  'Walk',
                  _react2.default.createElement('br', null),
                  'Only'
                )
              ),
              _react2.default.createElement(
                _reactBootstrap.ButtonGroup,
                { key: 'bike-only', style: { width: 45 } },
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  { style: sideButtonStyle,
                    className: !modeHasTransit && (0, _itinerary.hasBike)(mode) ? 'selected' : '',
                    onClick: this._setBikeOnly
                  },
                  'Bike',
                  _react2.default.createElement('br', null),
                  'Only'
                )
              )
            )
          )
        ),
        _react2.default.createElement(
          _velocityReact.VelocityTransitionGroup,
          {
            enter: { animation: 'slideDown' },
            leave: { animation: 'slideUp' }
          },
          modeHasTransit && _react2.default.createElement(
            'div',
            { className: 'modes-panel' },
            _react2.default.createElement(
              _reactBootstrap.Row,
              { className: 'mode-group-row' },
              accessModes.map(function (mode, k) {
                return _react2.default.createElement(
                  _reactBootstrap.Col,
                  { xs: 4, key: k },
                  _react2.default.createElement(_modeButton2.default, {
                    active: modeHasTransit && _this2._modeIsActive(mode),
                    icons: icons,
                    mode: mode,
                    height: 46,
                    label: mode.label,
                    showPlusTransit: true,
                    onClick: function onClick() {
                      return _this2._setAccessMode(mode);
                    }
                  })
                );
              })
            ),
            _react2.default.createElement(
              _reactBootstrap.Row,
              { className: 'mode-group-row' },
              transitModes.map(function (mode, k) {
                return _react2.default.createElement(
                  _reactBootstrap.Col,
                  { xs: 3, key: k },
                  _react2.default.createElement(_modeButton2.default, {
                    active: _this2._modeIsActive(mode),
                    icons: icons,
                    mode: mode,
                    label: mode.label,
                    showCheck: true,
                    height: 56,
                    onClick: function onClick() {
                      return _this2._toggleTransitMode(mode);
                    }
                  })
                );
              })
            )
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Row,
          null,
          _react2.default.createElement(
            _reactBootstrap.Col,
            { xs: 12, className: 'general-settings-panel' },
            _react2.default.createElement(
              'div',
              { style: { fontSize: 18, margin: '16px 0px' } },
              'Travel Preferences'
            ),
            (0, _itinerary.hasBike)(mode) && _react2.default.createElement(
              'div',
              { style: { marginBottom: 16 } },
              _react2.default.createElement(
                'div',
                { className: 'setting-label', style: { float: 'left' } },
                'Use'
              ),
              _react2.default.createElement(
                'div',
                { style: { textAlign: 'right' } },
                _react2.default.createElement(
                  _reactBootstrap.ButtonGroup,
                  null,
                  bikeOptions.map(function (option, k) {
                    return _react2.default.createElement(
                      _reactBootstrap.Button,
                      { key: k,
                        style: { backgroundColor: queryModes.includes(option.mode) ? '#000' : '#aaa', color: '#fff', letterSpacing: 1, textTransform: 'uppercase', fontSize: 12 },
                        onClick: option.action
                      },
                      _react2.default.createElement(
                        'div',
                        { style: { display: 'inline-block', width: option.iconWidth, height: 18, fill: '#fff', verticalAlign: 'middle', marginRight: 10 } },
                        (0, _itinerary.getModeIcon)(option.mode, icons)
                      ),
                      _react2.default.createElement(
                        'span',
                        { style: { verticalAlign: 'middle' } },
                        option.label
                      )
                    );
                  })
                )
              )
            ),
            _react2.default.createElement(_generalSettingsPanel2.default, null)
          )
        )
      );
    }
  }]);
  return SettingsSelectorPanel;
}(_react.Component), _class.propTypes = {
  icons: _react.PropTypes.object
}, _temp);

// connect to redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var _state$otp$currentQue = state.otp.currentQuery,
      companies = _state$otp$currentQue.companies,
      mode = _state$otp$currentQue.mode,
      routingType = _state$otp$currentQue.routingType;

  return {
    mode: mode,
    companies: companies,
    modeGroups: state.otp.config.modeGroups,
    queryModes: !mode || mode.length === 0 ? [] : mode.split(','),
    routingType: routingType
  };
};

var mapDispatchToProps = { setQueryParam: _form.setQueryParam };

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(SettingsSelectorPanel);
module.exports = exports['default'];

//# sourceMappingURL=settings-1.js
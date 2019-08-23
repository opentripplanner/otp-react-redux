"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.function.name");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _form = require("../../actions/form");

var _modeButton = _interopRequireDefault(require("./mode-button"));

var _itinerary = require("../../util/itinerary");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ModesPanel =
/*#__PURE__*/
function (_Component) {
  _inherits(ModesPanel, _Component);

  function ModesPanel() {
    _classCallCheck(this, ModesPanel);

    return _possibleConstructorReturn(this, _getPrototypeOf(ModesPanel).apply(this, arguments));
  }

  _createClass(ModesPanel, [{
    key: "_getVisibleModes",
    value: function _getVisibleModes(group) {
      var _this = this;

      // Don't show the CAR_HAIL services in profile modes
      // TODO: this could be handled more elegantly?
      return group.modes.filter(function (mode) {
        return mode.mode !== 'CAR_HAIL' || _this.props.routingType !== 'PROFILE';
      });
    } // Returns whether a particular mode or TNC agency is active

  }, {
    key: "_modeIsActive",
    value: function _modeIsActive(mode) {
      var _this$props = this.props,
          companies = _this$props.companies,
          queryModes = _this$props.queryModes;

      if (mode.mode === 'CAR_HAIL') {
        return Boolean(companies && companies.includes(mode.label.toUpperCase()));
      } else {
        return queryModes.includes(mode.mode || mode);
      }
    }
  }, {
    key: "_setGroupSelected",
    value: function _setGroupSelected(group, isSelected) {
      var queryModes = this.props.queryModes.slice(0); // Clone the modes array

      this._getVisibleModes(group).forEach(function (mode) {
        var modeStr = mode.mode || mode;
        queryModes = queryModes.filter(function (m) {
          return m !== modeStr;
        });
        if (isSelected) queryModes.push(modeStr);
      }); // Update the mode array in the store


      this.props.setQueryParam({
        mode: queryModes.join(',')
      });
    }
  }, {
    key: "_toggleMode",
    value: function _toggleMode(mode) {
      var modeStr = mode.mode || mode;
      var _this$props2 = this.props,
          routingType = _this$props2.routingType,
          setQueryParam = _this$props2.setQueryParam;
      var queryModes = this.props.queryModes.slice(0); // Clone the modes array

      var queryParamUpdate = {}; // Special case: we are in ITINERARY mode and changing the one access mode

      if (routingType === 'ITINERARY' && (0, _itinerary.isAccessMode)(modeStr)) {
        queryModes = queryModes.filter(function (m) {
          return !(0, _itinerary.isAccessMode)(m);
        });
        queryModes.push(modeStr); // do extra stuff if mode selected was a TNC

        queryParamUpdate.companies = modeStr === 'CAR_HAIL' ? mode.label.toUpperCase() : null; // Otherwise, if mode is currently selected, deselect it
      } else if (queryModes.includes(modeStr)) {
        queryModes = queryModes.filter(function (m) {
          return m !== modeStr;
        }); // Or, if mode is currently not selected, select it
      } else if (!queryModes.includes(modeStr)) {
        queryModes.push(modeStr);
      }

      queryParamUpdate.mode = queryModes.join(','); // Update the mode array in the store

      setQueryParam(queryParamUpdate);
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props3 = this.props,
          icons = _this$props3.icons,
          modeGroups = _this$props3.modeGroups,
          routingType = _this$props3.routingType;
      return _react.default.createElement("div", {
        className: "modes-panel"
      }, modeGroups.map(function (group, k) {
        var groupModes = _this2._getVisibleModes(group); // Determine whether to show Select/Deselect All actions


        var accessCount = groupModes.filter(function (m) {
          return (0, _itinerary.isAccessMode)(m.mode || m);
        }).length;
        var showGroupSelect = (routingType === 'PROFILE' || routingType === 'ITINERARY' && accessCount === 0) && groupModes.length > 1;
        return _react.default.createElement("div", {
          className: "mode-group-row",
          key: k
        }, _react.default.createElement("div", {
          className: "group-header"
        }, showGroupSelect && _react.default.createElement("div", {
          className: "group-select"
        }, _react.default.createElement("button", {
          className: "link-button",
          onClick: function onClick() {
            return _this2._setGroupSelected(group, true);
          }
        }, "Select All"), ' ', "|", ' ', _react.default.createElement("button", {
          className: "link-button",
          onClick: function onClick() {
            return _this2._setGroupSelected(group, false);
          }
        }, "Unselect All")), _react.default.createElement("div", {
          className: "group-name"
        }, group.name)), _react.default.createElement("div", {
          className: "group-icons"
        }, groupModes.map(function (mode) {
          return _react.default.createElement(_modeButton.default, {
            active: _this2._modeIsActive(mode),
            icons: icons,
            key: mode.mode ? "".concat(mode.mode, "-").concat(mode.label) : mode,
            mode: mode,
            label: mode.label || readableModeString(mode),
            onClick: function onClick() {
              return _this2._toggleMode(mode);
            }
          });
        })));
      }));
    }
  }]);

  return ModesPanel;
}(_react.Component); // Make a mode string more readable (e.g. 'BICYCLE_RENT' -> 'Bicycle Rent')


_defineProperty(ModesPanel, "propTypes", {
  icons: _propTypes.default.object,
  modeGroups: _propTypes.default.array,
  queryModes: _propTypes.default.array,
  setQueryParam: _propTypes.default.func
});

function readableModeString(mode) {
  var str = mode.replace('_', ' ');
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
} // connect to redux store


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

var mapDispatchToProps = {
  setQueryParam: _form.setQueryParam
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ModesPanel);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=modes-panel.js
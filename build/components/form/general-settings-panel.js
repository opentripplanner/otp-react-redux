"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.array.find");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _checkboxSelector = _interopRequireDefault(require("./checkbox-selector"));

var _dropdownSelector = _interopRequireDefault(require("./dropdown-selector"));

var _queryParams = _interopRequireDefault(require("../../util/query-params"));

var _query = require("../../util/query");

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

var GeneralSettingsPanel =
/*#__PURE__*/
function (_Component) {
  _inherits(GeneralSettingsPanel, _Component);

  function GeneralSettingsPanel() {
    _classCallCheck(this, GeneralSettingsPanel);

    return _possibleConstructorReturn(this, _getPrototypeOf(GeneralSettingsPanel).apply(this, arguments));
  }

  _createClass(GeneralSettingsPanel, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          paramNames = _this$props.paramNames,
          query = _this$props.query,
          config = _this$props.config;
      return _react.default.createElement("div", {
        className: "general-settings-panel"
      }, paramNames.map(function (param) {
        var paramInfo = _queryParams.default.find(function (qp) {
          return qp.name === param;
        }); // Check that the parameter applies to the specified routingType


        if (!paramInfo.routingTypes.includes(query.routingType)) return; // Check that the applicability test (if provided) is satisfied

        if (typeof paramInfo.applicable === 'function' && !paramInfo.applicable(query, config)) return; // Create the UI component based on the selector type

        switch (paramInfo.selector) {
          case 'DROPDOWN':
            return _react.default.createElement(_dropdownSelector.default, {
              key: paramInfo.name,
              name: paramInfo.name,
              value: query[paramInfo.name],
              label: (0, _query.getQueryParamProperty)(paramInfo, 'label', query),
              options: (0, _query.getQueryParamProperty)(paramInfo, 'options', query)
            });

          case 'CHECKBOX':
            return _react.default.createElement(_checkboxSelector.default, {
              key: paramInfo.label,
              name: paramInfo.name,
              value: query[paramInfo.name],
              label: (0, _query.getQueryParamProperty)(paramInfo, 'label', query)
            });
        }
      }));
    }
  }]);

  return GeneralSettingsPanel;
}(_react.Component); // connect to redux store


_defineProperty(GeneralSettingsPanel, "propTypes", {
  query: _propTypes.default.object,
  paramNames: _propTypes.default.array
});

_defineProperty(GeneralSettingsPanel, "defaultProps", {
  // The universe of properties to include in this form:
  // TODO: allow override in config
  paramNames: _query.defaultParams
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    config: state.otp.config,
    query: state.otp.currentQuery
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
  return {};
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(GeneralSettingsPanel);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=general-settings-panel.js
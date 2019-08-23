"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.function.name");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _container = _interopRequireDefault(require("./container"));

var _navigationBar = _interopRequireDefault(require("./navigation-bar"));

var _locationField = _interopRequireDefault(require("../form/location-field"));

var _ui = require("../../actions/ui");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MobileLocationSearch =
/*#__PURE__*/
function (_Component) {
  _inherits(MobileLocationSearch, _Component);

  function MobileLocationSearch() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, MobileLocationSearch);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(MobileLocationSearch)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "_locationSelected", function () {
      _this.props.setMobileScreen(_ui.MobileScreens.SEARCH_FORM);
    });

    return _this;
  }

  _createClass(MobileLocationSearch, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          backScreen = _this$props.backScreen,
          location = _this$props.location,
          locationType = _this$props.locationType,
          otherLocation = _this$props.otherLocation;
      var suppressNearby = otherLocation && otherLocation.category === 'CURRENT_LOCATION';
      return _react.default.createElement(_container.default, null, _react.default.createElement(_navigationBar.default, {
        headerText: "Set ".concat(locationType === 'to' ? 'Destination' : 'Origin'),
        showBackButton: true,
        backScreen: backScreen
      }), _react.default.createElement("div", {
        className: "location-search mobile-padding"
      }, _react.default.createElement(_locationField.default, {
        type: locationType,
        hideExistingValue: true,
        suppressNearby: suppressNearby,
        label: location ? location.name : 'Enter location',
        static: true,
        onLocationSelected: this._locationSelected
      })));
    }
  }]);

  return MobileLocationSearch;
}(_react.Component); // connect to the redux store


_defineProperty(MobileLocationSearch, "propTypes", {
  backScreen: _propTypes.default.number,
  locationType: _propTypes.default.string
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    location: state.otp.currentQuery[ownProps.locationType],
    otherLocation: ownProps.type === 'from' ? state.otp.currentQuery.to : state.otp.currentQuery.from
  };
};

var mapDispatchToProps = {
  setMobileScreen: _ui.setMobileScreen
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(MobileLocationSearch);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=location-search.js
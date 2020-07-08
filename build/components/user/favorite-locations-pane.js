"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.object.freeze");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.find");

var _lodash = _interopRequireDefault(require("lodash.memoize"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _reactBootstrap = require("react-bootstrap");

var _reactFontawesome = _interopRequireDefault(require("react-fontawesome"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _templateObject3() {
  var data = _taggedTemplateLiteral(["\n  ", "\n  ::placeholder {\n    color: #fff;\n  }\n  &:focus {\n    background-color: unset;\n    color: unset;\n    ::placeholder {\n      color: unset;\n    }\n  }\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = _taggedTemplateLiteral(["\n  ", "\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  min-width: 40px;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

// Styles.
var fancyAddLocationCss = "\n  background-color: #337ab7;\n  color: #fff;\n";
var StyledAddon = (0, _styledComponents.default)(_reactBootstrap.InputGroup.Addon)(_templateObject());
var NewLocationAddon = (0, _styledComponents.default)(StyledAddon)(_templateObject2(), fancyAddLocationCss);
var NewLocationFormControl = (0, _styledComponents.default)(_reactBootstrap.FormControl)(_templateObject3(), fancyAddLocationCss); // Helper filter functions.

var isHome = function isHome(loc) {
  return loc.type === 'home';
};

var isWork = function isWork(loc) {
  return loc.type === 'work';
};

var notHomeOrWork = function notHomeOrWork(loc) {
  return loc.type !== 'home' && loc.type !== 'work';
};
/**
 * User's saved locations editor.
 */


var FavoriteLocationsPane =
/*#__PURE__*/
function (_Component) {
  _inherits(FavoriteLocationsPane, _Component);

  function FavoriteLocationsPane() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, FavoriteLocationsPane);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(FavoriteLocationsPane)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "_handleAddNewLocation", function (e) {
      var value = e.target.value || '';

      if (value.trim().length > 0) {
        var _this$props = _this.props,
            userData = _this$props.userData,
            onUserDataChange = _this$props.onUserDataChange;
        var savedLocations = userData.savedLocations; // Create a new array for savedLocations.

        var newLocations = [].concat(savedLocations);
        newLocations.push({
          address: value.trim(),
          icon: 'map-marker',
          type: 'custom'
        }); // Event onChange will trigger after this and before rerender,
        // so DO empty the input box value so the user can enter their next location.

        e.target.value = null;
        onUserDataChange({
          savedLocations: newLocations
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_handleAddressChange", (0, _lodash.default)(function (location) {
      return function (e) {
        var _this$props2 = _this.props,
            userData = _this$props2.userData,
            onUserDataChange = _this$props2.onUserDataChange;
        var savedLocations = userData.savedLocations;
        var value = e.target.value;
        var isValueEmpty = !value || value === '';
        var nonEmptyLocation = isValueEmpty ? null : location; // Update location address, ohterwise it stalls the input box.

        location.address = value; // Create a new array for savedLocations.

        var newLocations = []; // Add home/work as first entries to the new state only if
        // - user edited home/work to non-empty, or
        // - user edited another location and home/work is in savedLocations.

        var homeLocation = isHome(location) && nonEmptyLocation || savedLocations.find(isHome);
        if (homeLocation) newLocations.push(homeLocation);
        var workLocation = isWork(location) && nonEmptyLocation || savedLocations.find(isWork);
        if (workLocation) newLocations.push(workLocation); // Add the rest if it is not home or work
        // and if the new address of this one is not null or empty.

        newLocations = newLocations.concat(savedLocations.filter(notHomeOrWork).filter(function (loc) {
          return loc !== location || !isValueEmpty;
        }));
        onUserDataChange({
          savedLocations: newLocations
        });
      };
    }));

    return _this;
  }

  _createClass(FavoriteLocationsPane, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      var userData = this.props.userData;
      var savedLocations = userData.savedLocations; // Build an 'effective' list of locations for display,
      // where at least one 'home' and one 'work', are always present even if blank.
      // In theory there could be multiple home or work locations.
      // Just pick the first one.

      var homeLocation = savedLocations.find(isHome) || {
        address: null,
        icon: 'home',
        type: 'home'
      };
      var workLocation = savedLocations.find(isWork) || {
        address: null,
        icon: 'briefcase',
        type: 'work'
      };
      var effectiveLocations = [homeLocation, workLocation].concat(_toConsumableArray(savedLocations.filter(notHomeOrWork)));
      return _react.default.createElement("div", null, _react.default.createElement(_reactBootstrap.ControlLabel, null, "Add the places you frequent often to save time planning trips:"), effectiveLocations.map(function (loc, index) {
        return _react.default.createElement(_reactBootstrap.FormGroup, {
          key: index
        }, _react.default.createElement(_reactBootstrap.InputGroup, null, _react.default.createElement(StyledAddon, {
          title: loc.type
        }, _react.default.createElement(_reactFontawesome.default, {
          name: loc.icon
        })), _react.default.createElement(_reactBootstrap.FormControl, {
          onChange: _this2._handleAddressChange(loc),
          placeholder: "Add ".concat(loc.type),
          type: "text",
          value: loc.address
        })));
      }), _react.default.createElement(_reactBootstrap.FormGroup, null, _react.default.createElement(_reactBootstrap.InputGroup, null, _react.default.createElement(NewLocationAddon, null, _react.default.createElement(_reactFontawesome.default, {
        name: "plus"
      })), _react.default.createElement(NewLocationFormControl, {
        onBlur: this._handleAddNewLocation,
        placeholder: "Add another place",
        type: "text"
      }))));
    }
  }]);

  return FavoriteLocationsPane;
}(_react.Component);

_defineProperty(FavoriteLocationsPane, "propTypes", {
  onUserDataChange: _propTypes.default.func.isRequired,
  userData: _propTypes.default.object.isRequired
});

var _default = FavoriteLocationsPane;
exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=favorite-locations-pane.js
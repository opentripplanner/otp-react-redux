"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.regexp.search");

require("core-js/modules/es6.function.name");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _reactBootstrap = require("react-bootstrap");

var _reactRedux = require("react-redux");

var _throttleDebounce = require("throttle-debounce");

var _locationIcon = _interopRequireDefault(require("../icons/location-icon"));

var _map = require("../../actions/map");

var _location = require("../../actions/location");

var _api = require("../../actions/api");

var _distance = require("../../util/distance");

var _geocoder = _interopRequireDefault(require("../../util/geocoder"));

var _map2 = require("../../util/map");

var _state = require("../../util/state");

var _ui = require("../../util/ui");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

var LocationField =
/*#__PURE__*/
function (_Component) {
  _inherits(LocationField, _Component);

  function LocationField(props) {
    var _this;

    _classCallCheck(this, LocationField);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(LocationField).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "_geocodeAutocomplete", (0, _throttleDebounce.throttle)(1000, function (text) {
      if (!text) {
        console.warn('No text entry provided for geocode autocomplete search.');
        return;
      }

      (0, _geocoder.default)(_this.props.config.geocoder).autocomplete({
        text: text
      }).then(function (result) {
        _this.setState({
          geocodedFeatures: result.features
        });
      }).catch(function (err) {
        console.error(err);
      });
    }));

    _defineProperty(_assertThisInitialized(_this), "_onClearButtonClick", function () {
      var type = _this.props.type;

      _this.props.clearLocation({
        type: type
      });

      _this.setState({
        value: '',
        geocodedFeatures: []
      });

      _reactDom.default.findDOMNode(_this.formControl).focus();

      _this._onTextInputClick();
    });

    _defineProperty(_assertThisInitialized(_this), "_onDropdownToggle", function (v, e) {
      // if clicked on input form control, keep dropdown open; otherwise, toggle
      var targetIsInput = e.target.className.indexOf(_this._getFormControlClassname()) !== -1;
      var menuVisible = targetIsInput ? true : !_this.state.menuVisible;

      _this.setState({
        menuVisible: menuVisible
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_onBlurFormGroup", function (e) {
      // IE does not use relatedTarget, so this check handles cross-browser support.
      // see https://stackoverflow.com/a/49325196/915811
      var target = e.relatedTarget !== null ? e.relatedTarget : document.activeElement;

      if (!_this.props.location && (!target || target.getAttribute('role') !== 'menuitem')) {
        _this.setState({
          menuVisible: false,
          value: '',
          geocodedFeatures: []
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_onTextInputChange", function (evt) {
      _this.setState({
        value: evt.target.value,
        menuVisible: true
      });

      _this._geocodeAutocomplete(evt.target.value);
    });

    _defineProperty(_assertThisInitialized(_this), "_onTextInputClick", function () {
      var _this$props = _this.props,
          config = _this$props.config,
          currentPosition = _this$props.currentPosition,
          nearbyStops = _this$props.nearbyStops,
          onClick = _this$props.onClick;
      if (typeof onClick === 'function') onClick();

      _this.setState({
        menuVisible: true
      });

      if (nearbyStops.length === 0 && currentPosition && currentPosition.coords) {
        _this.props.findNearbyStops({
          lat: currentPosition.coords.latitude,
          lon: currentPosition.coords.longitude,
          max: config.geocoder.maxNearbyStops || 4
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_onKeyDown", function (evt) {
      var _this$state = _this.state,
          activeIndex = _this$state.activeIndex,
          menuVisible = _this$state.menuVisible;

      switch (evt.key) {
        // 'Down' arrow key pressed: move selected menu item down by one position
        case 'ArrowDown':
          // Suppress default 'ArrowDown' behavior which moves cursor to end
          evt.preventDefault();

          if (!menuVisible) {
            // If the menu is not visible, simulate a text input click to show it.
            return _this._onTextInputClick();
          }

          if (activeIndex === _this.menuItemCount - 1) {
            return _this.setState({
              activeIndex: null
            });
          }

          return _this.setState({
            activeIndex: activeIndex === null ? 0 : activeIndex + 1
          });
        // 'Up' arrow key pressed: move selection up by one position

        case 'ArrowUp':
          // Suppress default 'ArrowUp' behavior which moves cursor to beginning
          evt.preventDefault();

          if (activeIndex === 0) {
            return _this.setState({
              activeIndex: null
            });
          }

          return _this.setState({
            activeIndex: activeIndex === null ? _this.menuItemCount - 1 : activeIndex - 1
          });
        // 'Enter' keypress serves two purposes:
        //  - If pressed when typing in search string, switch from 'autocomplete'
        //    to 'search' geocoding
        //  - If pressed when dropdown results menu is active, apply the location
        //    associated with current selected menu item

        case 'Enter':
          if (typeof activeIndex === 'number') {
            // Menu is active
            // Retrieve location selection handler from lookup object and invoke
            var locationSelected = _this.locationSelectedLookup[activeIndex];
            if (locationSelected) locationSelected(); // Clear selection & hide the menu

            _this.setState({
              menuVisible: false,
              activeIndex: null
            });
          } else {
            // Menu not active; get geocode 'search' results
            _this._geocodeSearch(evt.target.value); // Ensure menu is visible.


            _this.setState({
              menuVisible: true
            });
          } // Suppress default 'Enter' behavior which causes page to reload


          evt.preventDefault();
          break;

        case 'Escape':
          // Clear selection & hide the menu
          return _this.setState({
            menuVisible: false,
            activeIndex: null
          });
        // Any other key pressed: clear active selection

        default:
          return _this.setState({
            activeIndex: null
          });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_useCurrentLocation", function () {
      var _this$props2 = _this.props,
          currentPosition = _this$props2.currentPosition,
          getCurrentPosition = _this$props2.getCurrentPosition,
          onLocationSelected = _this$props2.onLocationSelected,
          setLocationToCurrent = _this$props2.setLocationToCurrent,
          type = _this$props2.type;

      if (currentPosition.coords) {
        // We already have geolocation coordinates
        setLocationToCurrent({
          type: type
        });
        onLocationSelected && onLocationSelected();
      } else {
        // Call geolocation.getCurrentPosition and set as from/to type
        _this.setState({
          fetchingLocation: true
        });

        getCurrentPosition(type, onLocationSelected);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_geolocationAlert", function () {
      window.alert("Geolocation either has been disabled for ".concat(window.location.host, " or is not available in your browser.\n\nReason: ").concat(_this.props.currentPosition.error.message || 'Unknown reason'));
    });

    _this.state = {
      value: props.location && !props.hideExistingValue ? props.location.name : '',
      menuVisible: false,
      geocodedFeatures: [],
      activeIndex: null
    };
    return _this;
  }

  _createClass(LocationField, [{
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      // If location is updated externally, replace value and geocoded features
      // in internal state.
      // TODO: This might be considered an anti-pattern. There may be a more
      // effective way to handle this.
      var location = this.props.location;

      if (location !== prevProps.location) {
        this.setState({
          value: location !== null ? location.name : '',
          geocodedFeatures: []
        });
      }
    }
  }, {
    key: "_geocodeSearch",
    value: function _geocodeSearch(text) {
      var _this2 = this;

      if (!text) {
        console.warn('No text entry provided for geocode search.');
        return;
      }

      (0, _geocoder.default)(this.props.config.geocoder).search({
        text: text
      }).then(function (result) {
        if (result.features && result.features.length > 0) {
          // Only replace geocode items if results were found
          _this2.setState({
            geocodedFeatures: result.features
          });
        } else {
          console.warn('No results found for geocode search. Not replacing results.');
        }
      }).catch(function (err) {
        console.error(err);
      });
    }
  }, {
    key: "_getFormControlClassname",
    value: function _getFormControlClassname() {
      return this.props.type + '-form-control';
    }
  }, {
    key: "_setLocation",
    value: function _setLocation(location) {
      var _this$props3 = this.props,
          onLocationSelected = _this$props3.onLocationSelected,
          setLocation = _this$props3.setLocation,
          type = _this$props3.type;
      onLocationSelected && onLocationSelected();
      setLocation({
        type: type,
        location: location
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var _this$props4 = this.props,
          currentPosition = _this$props4.currentPosition,
          label = _this$props4.label,
          location = _this$props4.location,
          user = _this$props4.user,
          showClearButton = _this$props4.showClearButton,
          showUserSettings = _this$props4.showUserSettings,
          isStatic = _this$props4.static,
          suppressNearby = _this$props4.suppressNearby,
          type = _this$props4.type,
          nearbyStops = _this$props4.nearbyStops;
      var locations = [].concat(_toConsumableArray(user.locations), _toConsumableArray(user.recentPlaces));
      var activeIndex = this.state.activeIndex;
      var geocodedFeatures = this.state.geocodedFeatures;
      if (geocodedFeatures.length > 5) geocodedFeatures = geocodedFeatures.slice(0, 5);
      var sessionSearches = this.props.sessionSearches;
      if (sessionSearches.length > 5) sessionSearches = sessionSearches.slice(0, 5); // Assemble menu contents, to be displayed either as dropdown or static panel.
      // Menu items are created in four phases: (1) the current location, (2) any
      // geocoder search results; (3) nearby transit stops; and (4) saved searches

      var menuItems = []; // array of menu items for display (may include non-selectable items e.g. dividers/headings)

      var itemIndex = 0; // the index of the current location-associated menu item (excluding non-selectable items)

      this.locationSelectedLookup = {}; // maps itemIndex to a location selection handler (for use by the _onKeyDown method)

      /* 1) Process geocode search result option(s) */

      if (geocodedFeatures.length > 0) {
        // Add the menu sub-heading (not a selectable item)
        // menuItems.push(<MenuItem header key='sr-header'>Search Results</MenuItem>)
        // Iterate through the geocoder results
        menuItems = menuItems.concat(geocodedFeatures.map(function (feature, i) {
          // Create the selection handler
          var locationSelected = function locationSelected() {
            (0, _geocoder.default)(_this3.props.config.geocoder).getLocationFromGeocodedFeature(feature).then(function (location) {
              // Set the current location
              _this3._setLocation(location); // Add to the location search history


              _this3.props.addLocationSearch({
                location: location
              });
            });
          }; // Add to the selection handler lookup (for use in _onKeyDown)


          _this3.locationSelectedLookup[itemIndex] = locationSelected; // Create and return the option menu item

          var option = createOption('map-pin', feature.properties.label, locationSelected, itemIndex === activeIndex, i === geocodedFeatures.length - 1);
          itemIndex++;
          return option;
        }));
      }
      /* 2) Process nearby transit stop options */


      if (nearbyStops.length > 0 && !suppressNearby) {
        // Add the menu sub-heading (not a selectable item)
        menuItems.push(_react.default.createElement(_reactBootstrap.MenuItem, {
          header: true,
          key: "ns-header"
        }, "Nearby Stops")); // Iterate through the found nearby stops

        menuItems = menuItems.concat(nearbyStops.map(function (stopId, i) {
          // Constuct the location
          var stop = _this3.props.stopsIndex[stopId];
          var location = {
            name: stop.name,
            lat: stop.lat,
            lon: stop.lon // Create the location selected handler

          };

          var locationSelected = function locationSelected() {
            _this3._setLocation(location);
          }; // Add to the selection handler lookup (for use in _onKeyDown)


          _this3.locationSelectedLookup[itemIndex] = locationSelected; // Create and return the option menu item

          var option = createTransitStopOption(stop, locationSelected, itemIndex === activeIndex, i === nearbyStops.length - 1);
          itemIndex++;
          return option;
        }));
      }
      /* 3) Process recent search history options */


      if (sessionSearches.length > 0) {
        // Add the menu sub-heading (not a selectable item)
        menuItems.push(_react.default.createElement(_reactBootstrap.MenuItem, {
          header: true,
          key: "ss-header"
        }, "Recently Searched")); // Iterate through any saved locations

        menuItems = menuItems.concat(sessionSearches.map(function (location, i) {
          // Create the location-selected handler
          var locationSelected = function locationSelected() {
            _this3._setLocation(location);
          }; // Add to the selection handler lookup (for use in _onKeyDown)


          _this3.locationSelectedLookup[itemIndex] = locationSelected; // Create and return the option menu item

          var option = createOption('search', location.name, locationSelected, itemIndex === activeIndex, i === sessionSearches.length - 1);
          itemIndex++;
          return option;
        }));
      }
      /* 3b) Process stored user locations */


      if (locations.length > 0 && showUserSettings) {
        // Add the menu sub-heading (not a selectable item)
        menuItems.push(_react.default.createElement(_reactBootstrap.MenuItem, {
          header: true,
          key: "mp-header"
        }, "My Places")); // Iterate through any saved locations

        menuItems = menuItems.concat(locations.map(function (location, i) {
          // Create the location-selected handler
          var locationSelected = function locationSelected() {
            _this3._setLocation(location);
          }; // Add to the selection handler lookup (for use in _onKeyDown)


          _this3.locationSelectedLookup[itemIndex] = locationSelected; // Create and return the option menu item

          var option = createOption(location.icon, (0, _map2.formatStoredPlaceName)(location), locationSelected, itemIndex === activeIndex, i === locations.length - 1);
          itemIndex++;
          return option;
        }));
      }
      /* 4) Process the current location */


      var locationSelected, optionIcon, optionTitle;

      if (!currentPosition.error) {
        // current position detected successfully
        locationSelected = this._useCurrentLocation;
        optionIcon = 'location-arrow';
        optionTitle = 'Use Current Location';
      } else {
        // error detecting current position
        locationSelected = this._geolocationAlert;
        optionIcon = 'ban';
        optionTitle = 'Current location not available';
      } // Add to the selection handler lookup (for use in _onKeyDown)


      this.locationSelectedLookup[itemIndex] = locationSelected;

      if (!suppressNearby) {
        // Create and add the option item to the menu items array
        var currentLocationOption = createOption(optionIcon, optionTitle, locationSelected, itemIndex === activeIndex);
        menuItems.push(currentLocationOption);
        itemIndex++;
      } // Store the number of location-associated items for reference in the _onKeyDown method


      this.menuItemCount = itemIndex;
      /** the text input element **/

      var placeholder = currentPosition.fetching === type ? 'Fetching location...' : label || type;

      var textControl = _react.default.createElement(_reactBootstrap.FormControl, {
        autoFocus: isStatic // focuses the input when the component mounts if static
        ,
        ref: function ref(ctl) {
          _this3.formControl = ctl;
        },
        className: this._getFormControlClassname(),
        type: "text",
        value: this.state.value,
        placeholder: placeholder,
        onChange: this._onTextInputChange,
        onClick: this._onTextInputClick,
        onKeyDown: this._onKeyDown
      }); // Only include the clear ('X') button add-on if a location is selected
      // or if the input field has text.


      var clearButton = showClearButton && location ? _react.default.createElement(_reactBootstrap.InputGroup.Addon, null, _react.default.createElement(_reactBootstrap.Button, {
        bsStyle: "link",
        className: "clear-button",
        onClick: this._onClearButtonClick
      }, _react.default.createElement("i", {
        className: "fa fa-times"
      }))) : null;

      if (isStatic) {
        // 'static' mode (menu is displayed alongside input, e.g., for mobile view)
        return _react.default.createElement("div", {
          className: "location-field static"
        }, _react.default.createElement("form", null, _react.default.createElement(_reactBootstrap.FormGroup, null, _react.default.createElement(_reactBootstrap.InputGroup, null, _react.default.createElement(_reactBootstrap.InputGroup.Addon, null, _react.default.createElement(_locationIcon.default, {
          type: type
        })), textControl, clearButton))), _react.default.createElement("ul", {
          className: "dropdown-menu",
          style: {
            width: '100%'
          }
        }, menuItems.length > 0 // Show typing prompt to avoid empty screen
        ? menuItems : _react.default.createElement(_reactBootstrap.MenuItem, {
          header: true,
          className: 'text-center'
        }, "Begin typing to search for locations")));
      } else {
        // default display mode with dropdown menu
        return _react.default.createElement("form", null, _react.default.createElement(_reactBootstrap.FormGroup, {
          onBlur: this._onBlurFormGroup,
          className: "location-field"
        }, _react.default.createElement(_reactBootstrap.InputGroup, null, _react.default.createElement(_reactBootstrap.DropdownButton, {
          componentClass: _reactBootstrap.InputGroup.Button,
          open: this.state.menuVisible,
          onToggle: this._onDropdownToggle,
          id: "location-dropdown",
          title: _react.default.createElement(_locationIcon.default, {
            type: type
          }),
          noCaret: true
        }, menuItems), textControl, clearButton)));
      }
    }
  }]);

  return LocationField;
}(_react.Component); // helper functions for dropdown options


_defineProperty(LocationField, "propTypes", {
  config: _propTypes.default.object,
  currentPosition: _propTypes.default.object,
  hideExistingValue: _propTypes.default.bool,
  location: _propTypes.default.object,
  label: _propTypes.default.string,
  nearbyStops: _propTypes.default.array,
  sessionSearches: _propTypes.default.array,
  showClearButton: _propTypes.default.bool,
  static: _propTypes.default.bool,
  // show autocomplete options as fixed/inline element rather than dropdown
  stopsIndex: _propTypes.default.object,
  type: _propTypes.default.string,
  // replace with locationType?
  // callbacks
  onClick: _propTypes.default.func,
  onLocationSelected: _propTypes.default.func,
  // dispatch
  addLocationSearch: _propTypes.default.func,
  clearLocation: _propTypes.default.func,
  setLocation: _propTypes.default.func,
  setLocationToCurrent: _propTypes.default.func
});

_defineProperty(LocationField, "defaultProps", {
  showClearButton: true
});

var itemKey = 0;

function createOption(icon, title, onSelect, isActive, isLast) {
  return _react.default.createElement(_reactBootstrap.MenuItem, {
    className: "location-option".concat(isLast ? ' last-option' : ''),
    onSelect: onSelect // style={{ borderBottom: '1px solid lightgrey' }}
    ,
    key: itemKey++,
    active: isActive
  }, (0, _ui.isIE)() // In internet explorer 11, some really weird stuff is happening where it
  // is not possible to click the text of the title, but if you click just
  // above it, then it works. So, if using IE 11, just return the title text
  // and avoid all the extra fancy stuff.
  // See https://github.com/ibi-group/trimet-mod-otp/issues/237
  ? title : _react.default.createElement("div", {
    style: {
      paddingTop: '5px',
      paddingBottom: '3px'
    }
  }, _react.default.createElement("div", {
    style: {
      float: 'left'
    }
  }, _react.default.createElement("i", {
    className: "fa fa-".concat(icon)
  })), _react.default.createElement("div", {
    style: {
      marginLeft: '30px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, title)));
}

function createTransitStopOption(stop, onSelect, isActive) {
  return _react.default.createElement(_reactBootstrap.MenuItem, {
    className: "location-option",
    onSelect: onSelect,
    key: itemKey++,
    active: isActive
  }, _react.default.createElement("div", null, _react.default.createElement("div", {
    style: {
      float: 'left',
      paddingTop: '3px'
    }
  }, _react.default.createElement("i", {
    className: "fa fa-bus",
    style: {
      fontSize: '20px'
    }
  }), _react.default.createElement("div", {
    style: {
      fontSize: '8px'
    }
  }, (0, _distance.distanceStringImperial)(stop.dist, true))), _react.default.createElement("div", {
    style: {
      marginLeft: '30px'
    }
  }, _react.default.createElement("div", null, stop.name, " (", stop.code, ")"), _react.default.createElement("div", {
    style: {
      fontSize: '9px'
    }
  }, (stop.routes || []).map(function (route, i) {
    var name = route.shortName || route.longName;
    return _react.default.createElement("span", {
      key: "route-".concat(i),
      className: "route"
    }, name);
  }))), _react.default.createElement("div", {
    style: {
      clear: 'both'
    }
  })));
} // connect to redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  var query = activeSearch ? activeSearch.query : state.otp.currentQuery;
  var location = query[ownProps.type];
  var showUserSettings = (0, _state.getShowUserSettings)(state.otp);
  return {
    config: state.otp.config,
    location: location,
    user: state.otp.user,
    currentPosition: state.otp.location.currentPosition,
    sessionSearches: state.otp.location.sessionSearches,
    nearbyStops: state.otp.location.nearbyStops,
    showUserSettings: showUserSettings,
    stopsIndex: state.otp.transitIndex.stops
  };
};

var mapDispatchToProps = {
  addLocationSearch: _location.addLocationSearch,
  findNearbyStops: _api.findNearbyStops,
  getCurrentPosition: _location.getCurrentPosition,
  setLocation: _map.setLocation,
  setLocationToCurrent: _map.setLocationToCurrent,
  clearLocation: _map.clearLocation
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(LocationField);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=location-field.js
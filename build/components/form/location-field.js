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

var _lonlat = require('@conveyal/lonlat');

var _lonlat2 = _interopRequireDefault(_lonlat);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactBootstrap = require('react-bootstrap');

var _reactRedux = require('react-redux');

var _isomorphicMapzenSearch = require('isomorphic-mapzen-search');

var _throttleDebounce = require('throttle-debounce');

var _locationIcon = require('../icons/location-icon');

var _locationIcon2 = _interopRequireDefault(_locationIcon);

var _map = require('../../actions/map');

var _location = require('../../actions/location');

var _api = require('../../actions/api');

var _distance = require('../../util/distance');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LocationField = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(LocationField, _Component);

  function LocationField(props) {
    (0, _classCallCheck3.default)(this, LocationField);

    var _this = (0, _possibleConstructorReturn3.default)(this, (LocationField.__proto__ || (0, _getPrototypeOf2.default)(LocationField)).call(this, props));

    _this._geocodeAutocomplete = (0, _throttleDebounce.throttle)(1000, function (text) {
      var _this$props$config$ge = _this.props.config.geocoder,
          MAPZEN_KEY = _this$props$config$ge.MAPZEN_KEY,
          baseUrl = _this$props$config$ge.baseUrl,
          boundary = _this$props$config$ge.boundary,
          focusPoint = _this$props$config$ge.focusPoint;

      (0, _isomorphicMapzenSearch.autocomplete)({
        apiKey: MAPZEN_KEY,
        boundary: boundary,
        focusPoint: focusPoint,
        sources: null,
        text: text,
        url: baseUrl ? baseUrl + '/autocomplete' : null
      }).then(function (result) {
        _this.setState({ geocodedFeatures: result.features });
      }).catch(function (err) {
        console.error(err);
      });
    });

    _this._onClearButtonClick = function () {
      var type = _this.props.type;

      _this.props.clearLocation({ type: type });
      _this.setState({
        value: '',
        geocodedFeatures: []
      });
      _reactDom2.default.findDOMNode(_this.formControl).focus();
    };

    _this._onDropdownToggle = function (v, e) {
      // if clicked on input form control, keep dropdown open; otherwise, toggle
      var targetIsInput = e.target.className.indexOf(_this._getFormControlClassname()) !== -1;
      var menuVisible = targetIsInput ? true : !_this.state.menuVisible;
      _this.setState({ menuVisible: menuVisible });
    };

    _this._onTextInputChange = function (evt) {
      _this.setState({ value: evt.target.value });
      _this._geocodeAutocomplete(evt.target.value);
    };

    _this._onTextInputClick = function () {
      var _this$props = _this.props,
          config = _this$props.config,
          currentPosition = _this$props.currentPosition,
          onClick = _this$props.onClick;

      if (typeof onClick === 'function') onClick();
      _this.setState({ menuVisible: true });
      if (currentPosition && currentPosition.coords) {
        _this.props.findNearbyStops({
          lat: currentPosition.coords.latitude,
          lon: currentPosition.coords.longitude,
          max: config.geocoder.maxNearbyStops || 4
        });
      }
    };

    _this._onKeyDown = function (evt) {
      var activeIndex = _this.state.activeIndex;


      switch (evt.key) {
        // 'Down' arrow key pressed: move selected menu item down by one position
        case 'ArrowDown':
          if (activeIndex === _this.menuItemCount - 1) {
            _this.setState({ activeIndex: null });
            break;
          }
          _this.setState({
            activeIndex: activeIndex === null ? 0 : activeIndex + 1
          });
          break;

        // 'Up' arrow key pressed: move selection up by one position
        case 'ArrowUp':
          if (activeIndex === 0) {
            _this.setState({ activeIndex: null });
            break;
          }
          _this.setState({
            activeIndex: activeIndex === null ? _this.menuItemCount - 1 : activeIndex - 1
          });
          break;

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
            if (locationSelected) locationSelected();

            // Clear selection & hide the menu
            _this.setState({
              menuVisible: false,
              activeIndex: null
            });
          } else {
            // Menu not active; get geocode 'search' results
            _this._geocodeSearch(evt.target.value);
          }

          // Suppress default 'Enter' behavior which causes page to reload
          evt.preventDefault();
          break;

        // Any other key pressed: clear active selection
        default:
          _this.setState({ activeIndex: null });
      }
    };

    _this._useCurrentLocation = function () {
      var _this$props2 = _this.props,
          currentPosition = _this$props2.currentPosition,
          getCurrentPosition = _this$props2.getCurrentPosition,
          setLocationToCurrent = _this$props2.setLocationToCurrent,
          type = _this$props2.type;

      if (currentPosition.coords) {
        // We already have geolocation coordinates
        setLocationToCurrent({ type: type });
      } else {
        // Call geolocation.getCurrentPosition and set as from/to type
        _this.setState({ fetchingLocation: true });
        getCurrentPosition(type);
      }
    };

    _this._geolocationAlert = function () {
      window.alert('Geolocation either has been disabled for ' + window.location.host + ' or is not available in your browser.\n\nReason: ' + (_this.props.currentPosition.error.message || 'Unknown reason'));
    };

    _this.state = {
      value: props.location !== null && !props.hideExistingValue ? props.location.name : '',
      menuVisible: false,
      geocodedFeatures: [],
      activeIndex: null
    };
    return _this;
  }

  (0, _createClass3.default)(LocationField, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.location !== nextProps.location) {
        this.setState({
          value: nextProps.location !== null ? nextProps.location.name : '',
          geocodedFeatures: []
        });
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.props.static) {
        _reactDom2.default.findDOMNode(this.formControl).focus();
      }
    }
  }, {
    key: '_geocodeSearch',
    value: function _geocodeSearch(text) {
      var _this2 = this;

      var _props$config$geocode = this.props.config.geocoder,
          MAPZEN_KEY = _props$config$geocode.MAPZEN_KEY,
          baseUrl = _props$config$geocode.baseUrl,
          boundary = _props$config$geocode.boundary,
          focusPoint = _props$config$geocode.focusPoint;

      (0, _isomorphicMapzenSearch.search)({
        apiKey: MAPZEN_KEY,
        boundary: boundary,
        focusPoint: focusPoint,
        text: text,
        sources: null,
        url: baseUrl ? baseUrl + '/search' : null,
        format: false // keep as returned GeoJSON
      }).then(function (result) {
        console.log('search results (query=' + text + ')', result);
        if (result.features.length > 0) {
          // Only replace geocode items if results were found
          _this2.setState({ geocodedFeatures: result.features });
        } else {
          console.warn('No results found for geocode search. Not replacing results.');
        }
      }).catch(function (err) {
        console.error(err);
      });
    }
  }, {
    key: '_getFormControlClassname',
    value: function _getFormControlClassname() {
      return this.props.type + '-form-control';
    }
  }, {
    key: '_setLocation',
    value: function _setLocation(location) {
      if (typeof this.props.onLocationSelected === 'function') {
        this.props.onLocationSelected(location);
      }
      this.props.setLocation({
        type: this.props.type,
        location: location
      });
    }

    /**
     * Provide alert to user with reason for geolocation error
     */

  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var _props = this.props,
          currentPosition = _props.currentPosition,
          label = _props.label,
          showClearButton = _props.showClearButton,
          isStatic = _props.static,
          suppressNearby = _props.suppressNearby,
          type = _props.type,
          nearbyStops = _props.nearbyStops;
      var activeIndex = this.state.activeIndex;


      var geocodedFeatures = this.state.geocodedFeatures;
      if (geocodedFeatures.length > 5) geocodedFeatures = geocodedFeatures.slice(0, 5);

      var sessionSearches = this.props.sessionSearches;
      if (sessionSearches.length > 5) sessionSearches = sessionSearches.slice(0, 5);

      // Assemble menu contents, to be displayed either as dropdown or static panel.
      // Menu items are created in four phases: (1) the current location, (2) any
      // geocoder search results; (3) nearby transit stops; and (4) saved searches

      var menuItems = []; // array of menu items for display (may include non-selectable items e.g. dividers/headings)
      var itemIndex = 0; // the index of the current location-associated menu item (excluding non-selectable items)
      this.locationSelectedLookup = {}; // maps itemIndex to a location selection handler (for use by the _onKeyDown method)

      /* 1) Process the current location */
      var locationSelected = void 0,
          optionIcon = void 0,
          optionTitle = void 0;

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
      }

      // Add to the selection handler lookup (for use in _onKeyDown)
      this.locationSelectedLookup[itemIndex] = locationSelected;

      if (!suppressNearby) {
        // Create and add the option item to the menu items array
        var currentLocationOption = createOption(optionIcon, optionTitle, locationSelected, itemIndex === activeIndex);
        menuItems.push(currentLocationOption);
        itemIndex++;
      }

      /* 2) Process geocode search result option(s) */
      if (geocodedFeatures.length > 0) {
        // Add the menu sub-heading (not a selectable item)
        menuItems.push(_react2.default.createElement(
          _reactBootstrap.MenuItem,
          { header: true, key: 'sr-header' },
          'Search Results'
        ));

        // Iterate through the geocoder results
        menuItems = menuItems.concat(geocodedFeatures.map(function (feature) {
          // Create the selection handler
          var locationSelected = function locationSelected() {
            // Construct the location
            var location = _lonlat2.default.fromCoordinates(feature.geometry.coordinates);
            location.name = feature.properties.label;
            // Set the current location
            _this3._setLocation(location);
            // Add to the location search history
            _this3.props.addLocationSearch({ location: location });
          };

          // Add to the selection handler lookup (for use in _onKeyDown)
          _this3.locationSelectedLookup[itemIndex] = locationSelected;

          // Create and return the option menu item
          var option = createOption('map-pin', feature.properties.label, locationSelected, itemIndex === activeIndex);
          itemIndex++;
          return option;
        }));
      }

      /* 3) Process nearby transit stop options */
      if (nearbyStops.length > 0 && !suppressNearby) {
        // Add the menu sub-heading (not a selectable item)
        menuItems.push(_react2.default.createElement(
          _reactBootstrap.MenuItem,
          { header: true, key: 'ns-header' },
          'Nearby Stops'
        ));

        // Iterate through the found nearby stops
        menuItems = menuItems.concat(nearbyStops.map(function (stopId) {
          // Constuct the location
          var stop = _this3.props.stopsIndex[stopId];
          var location = {
            name: stop.name,
            lat: stop.lat,
            lon: stop.lon

            // Create the location selected handler
          };var locationSelected = function locationSelected() {
            _this3._setLocation(location);
          };

          // Add to the selection handler lookup (for use in _onKeyDown)
          _this3.locationSelectedLookup[itemIndex] = locationSelected;

          // Create and return the option menu item
          var option = createTransitStopOption(stop, locationSelected, itemIndex === activeIndex);
          itemIndex++;
          return option;
        }));
      }

      /* 4) Process recent search history options */
      if (sessionSearches.length > 0) {
        // Add the menu sub-heading (not a selectable item)
        menuItems.push(_react2.default.createElement(
          _reactBootstrap.MenuItem,
          { header: true, key: 'ss-header' },
          'Recently Searched'
        ));

        // Iterate through any saved locations
        menuItems = menuItems.concat(sessionSearches.map(function (location) {
          // Create the location-selected handler
          var locationSelected = function locationSelected() {
            _this3._setLocation(location);
          };

          // Add to the selection handler lookup (for use in _onKeyDown)
          _this3.locationSelectedLookup[itemIndex] = locationSelected;

          // Create and return the option menu item
          var option = createOption('search', location.name, locationSelected, itemIndex === activeIndex);
          itemIndex++;
          return option;
        }));
      }

      // Store the number of location-associated items for reference in the _onKeyDown method
      this.menuItemCount = itemIndex;

      /** the text input element **/
      var placeholder = currentPosition.fetching === type ? 'Fetching location...' : label || type;
      var textControl = _react2.default.createElement(_reactBootstrap.FormControl, {
        ref: function ref(ctl) {
          _this3.formControl = ctl;
        },
        className: this._getFormControlClassname(),
        type: 'text',
        value: this.state.value,
        placeholder: placeholder,
        onChange: this._onTextInputChange,
        onClick: this._onTextInputClick,
        onKeyDown: this._onKeyDown
      });

      /** the clear ('X') button add-on */
      var clearButton = _react2.default.createElement(
        _reactBootstrap.InputGroup.Addon,
        { onClick: this._onClearButtonClick },
        _react2.default.createElement('i', { className: 'fa fa-times' })
      );

      if (isStatic) {
        // 'static' mode (menu is displayed alongside input, e.g., for mobile view)
        return _react2.default.createElement(
          'div',
          { className: 'location-field static' },
          _react2.default.createElement(
            'form',
            null,
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              null,
              _react2.default.createElement(
                _reactBootstrap.InputGroup,
                null,
                _react2.default.createElement(
                  _reactBootstrap.InputGroup.Addon,
                  null,
                  _react2.default.createElement(_locationIcon2.default, { type: type })
                ),
                textControl,
                showClearButton && clearButton
              )
            )
          ),
          _react2.default.createElement(
            'ul',
            { className: 'dropdown-menu', style: { width: '100%' } },
            menuItems.length > 0 // Show typing prompt to avoid empty screen
            ? menuItems : _react2.default.createElement(
              _reactBootstrap.MenuItem,
              { header: true, className: 'text-center' },
              'Begin typing to search for locations'
            )
          )
        );
      } else {
        // default display mode with dropdown menu
        return _react2.default.createElement(
          'form',
          null,
          _react2.default.createElement(
            _reactBootstrap.FormGroup,
            { className: 'location-field' },
            _react2.default.createElement(
              _reactBootstrap.InputGroup,
              null,
              _react2.default.createElement(
                _reactBootstrap.DropdownButton,
                {
                  componentClass: _reactBootstrap.InputGroup.Button,
                  open: this.state.menuVisible,
                  onToggle: this._onDropdownToggle,
                  id: 'location-dropdown',
                  title: _react2.default.createElement(_locationIcon2.default, { type: type }),
                  noCaret: true
                },
                menuItems
              ),
              textControl,
              showClearButton && clearButton
            )
          )
        );
      }
    }
  }]);
  return LocationField;
}(_react.Component), _class.propTypes = {
  config: _react.PropTypes.object,
  currentPosition: _react.PropTypes.object,
  hideExistingValue: _react.PropTypes.bool,
  location: _react.PropTypes.object,
  label: _react.PropTypes.string,
  nearbyStops: _react.PropTypes.array,
  sessionSearches: _react.PropTypes.array,
  showClearButton: _react.PropTypes.bool,
  static: _react.PropTypes.bool, // show autocomplete options as fixed/inline element rather than dropdown
  stopsIndex: _react.PropTypes.object,
  type: _react.PropTypes.string, // replace with locationType?

  // callbacks
  onClick: _react.PropTypes.func,
  onLocationSelected: _react.PropTypes.func,

  // dispatch
  addLocationSearch: _react.PropTypes.func,
  clearLocation: _react.PropTypes.func,
  setLocation: _react.PropTypes.func,
  setLocationToCurrent: _react.PropTypes.func
}, _class.defaultProps = {
  showClearButton: true
}, _temp);

// helper functions for dropdown options

var itemKey = 0;

function createOption(icon, title, onSelect, isActive) {
  return _react2.default.createElement(
    _reactBootstrap.MenuItem,
    { className: 'location-option', onSelect: onSelect, key: itemKey++, active: isActive },
    _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'div',
        { style: { float: 'left' } },
        _react2.default.createElement('i', { className: 'fa fa-' + icon })
      ),
      _react2.default.createElement(
        'div',
        { style: { marginLeft: '30px' } },
        title
      )
    )
  );
}

function createTransitStopOption(stop, onSelect, isActive) {
  return _react2.default.createElement(
    _reactBootstrap.MenuItem,
    { className: 'location-option', onSelect: onSelect, key: itemKey++, active: isActive },
    _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'div',
        { style: { float: 'left', paddingTop: '3px' } },
        _react2.default.createElement('i', { className: 'fa fa-bus', style: { fontSize: '20px' } }),
        _react2.default.createElement(
          'div',
          { style: { fontSize: '8px' } },
          (0, _distance.distanceStringImperial)(stop.dist, true)
        )
      ),
      _react2.default.createElement(
        'div',
        { style: { marginLeft: '30px' } },
        _react2.default.createElement(
          'div',
          null,
          stop.name,
          ' (',
          stop.code,
          ')'
        ),
        _react2.default.createElement(
          'div',
          { style: { fontSize: '9px' } },
          (stop.routes || []).map(function (route, i) {
            var name = route.shortName || route.longName;
            return _react2.default.createElement(
              'span',
              { key: 'route-' + i, className: 'route' },
              name
            );
          })
        )
      ),
      _react2.default.createElement('div', { style: { clear: 'both' } })
    )
  );
}

// connect to redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    config: state.otp.config,
    location: state.otp.currentQuery[ownProps.type],
    currentPosition: state.otp.location.currentPosition,
    sessionSearches: state.otp.location.sessionSearches,
    nearbyStops: state.otp.location.nearbyStops,
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

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(LocationField);
module.exports = exports['default'];

//# sourceMappingURL=location-field.js
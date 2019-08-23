"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.function.name");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _lodash = _interopRequireDefault(require("lodash.isequal"));

var _reactLeaflet = require("react-leaflet");

var _map = require("../../actions/map");

var _config = require("../../actions/config");

var _locationIcon = _interopRequireDefault(require("../icons/location-icon"));

var _map2 = require("../../util/map");

var _state = require("../../util/state");

var _itinerary = require("../../util/itinerary");

var _leaflet = _interopRequireDefault(require("leaflet"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

_leaflet.default.Evented.addInitHook(function () {
  if (this) this._singleClickTimeout = null;
  this.on('click', this._scheduleSingleClick, this);
  this.on('dblclick dragstart zoomstart', this._cancelSingleClick, this);
});

_leaflet.default.Evented.include({
  _cancelSingleClick: function _cancelSingleClick() {
    // This timeout is key to workaround an issue where double-click events
    // are fired in this order on some touch browsers: ['click', 'dblclick', 'click']
    // instead of ['click', 'click', 'dblclick']
    setTimeout(this._clearSingleClickTimeout.bind(this), 0);
  },
  _scheduleSingleClick: function _scheduleSingleClick(e) {
    this._clearSingleClickTimeout();

    this._singleClickTimeout = setTimeout(this._fireSingleClick.bind(this, e), this.options.singleClickTimeout || 500);
  },
  _fireSingleClick: function _fireSingleClick(e) {
    if (!e.originalEvent._stopped) {
      this.fire('singleclick', _leaflet.default.Util.extend(e, {
        type: 'singleclick'
      }));
    }
  },
  _clearSingleClickTimeout: function _clearSingleClickTimeout() {
    if (this._singleClickTimeout !== null) {
      clearTimeout(this._singleClickTimeout);
      this._singleClickTimeout = null;
    }
  }
});

var BaseMap =
/*#__PURE__*/
function (_Component) {
  _inherits(BaseMap, _Component);

  function BaseMap(props) {
    var _this;

    _classCallCheck(this, BaseMap);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(BaseMap).call(this, props)); // For controlled overlays, maintain a map of boolean visibility status,
    // indexed by 'name' string

    _defineProperty(_assertThisInitialized(_this), "_setLocationFromPopup", function (type) {
      var _this$props = _this.props,
          setMapPopupLocation = _this$props.setMapPopupLocation,
          setLocation = _this$props.setLocation,
          location = _this$props.popupLocation;
      setMapPopupLocation({
        location: null
      });
      setLocation({
        type: type,
        location: location,
        reverseGeocode: true
      });

      if (typeof _this.props.onSetLocation === 'function') {
        _this.props.onSetLocation({
          type: type,
          location: location
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_onClickTo", function () {
      return _this._setLocationFromPopup('to');
    });

    _defineProperty(_assertThisInitialized(_this), "_onClickFrom", function () {
      return _this._setLocationFromPopup('from');
    });

    _defineProperty(_assertThisInitialized(_this), "_onLeftClick", function (e) {
      _this.props.setMapPopupLocationAndGeocode({
        location: (0, _map2.constructLocation)(e.latlng)
      });

      if (typeof _this.props.onClick === 'function') _this.props.onClick(e);
    });

    _defineProperty(_assertThisInitialized(_this), "_onOverlayAdd", function (evt) {
      var overlayVisibility = _objectSpread({}, _this.state.overlayVisibility);

      overlayVisibility[evt.name] = true;

      _this.setState({
        overlayVisibility: overlayVisibility
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_onOverlayRemove", function (evt) {
      var overlayVisibility = _objectSpread({}, _this.state.overlayVisibility);

      overlayVisibility[evt.name] = false;

      _this.setState({
        overlayVisibility: overlayVisibility
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_mapBoundsChanged", function (e) {
      // if (this.state.zoomToTarget) {
      //   setTimeout(() => { this.setState({zoomToTarget: false}) }, 200)
      //   return false
      // } else {
      // const zoom = e.target.getZoom()
      var bounds = e.target.getBounds(); // if (this.props.mapState.zoom !== zoom) {
      //   this.props.updateMapState({zoom})
      // }

      if (!bounds.equals(_this.props.mapState.bounds)) {
        _this.props.updateMapState({
          bounds: e.target.getBounds()
        });
      } // }

    });

    _defineProperty(_assertThisInitialized(_this), "_onViewportChanged", function (e) {
      _this.props.setMapZoom({
        zoom: e.zoom
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_popupClosed", function () {
      _this.props.setMapPopupLocation({
        location: null
      });
    });

    var _overlayVisibility = {};

    _react.default.Children.toArray(_this.props.children).forEach(function (child) {
      if (child.props.name && child.props.visible) {
        _overlayVisibility[child.props.name] = child.props.visible;
      }
    });

    _this.state = {
      overlayVisibility: _overlayVisibility
    };
    return _this;
  }
  /* Internal Methods */


  _createClass(BaseMap, [{
    key: "_updateBounds",
    value: function _updateBounds(oldProps, newProps) {
      // TODO: maybe setting bounds ought to be handled in map props...
      oldProps = oldProps || {};
      newProps = newProps || {}; // Don't auto-fit if popup us active

      if (oldProps.popupLocation || newProps.popupLocation) return;
      var map = this.refs.map;
      if (!map) return;
      var padding = [30, 30]; // Fit map to to entire itinerary if active itinerary bounds changed

      var oldItinBounds = oldProps.itinerary && (0, _itinerary.getItineraryBounds)(oldProps.itinerary);
      var fromChanged = !(0, _lodash.default)(oldProps.query && oldProps.query.from, newProps.query && newProps.query.from);
      var toChanged = !(0, _lodash.default)(oldProps.query && oldProps.query.to, newProps.query && newProps.query.to);
      var newItinBounds = newProps.itinerary && (0, _itinerary.getItineraryBounds)(newProps.itinerary);

      if (!oldItinBounds && newItinBounds || oldItinBounds && newItinBounds && !oldItinBounds.equals(newItinBounds)) {
        map.leafletElement.fitBounds(newItinBounds, {
          padding: padding
        }); // Pan to to itinerary leg if made active (clicked); newly active leg must be non-null
      } else if (newProps.itinerary && newProps.activeLeg !== oldProps.activeLeg && newProps.activeLeg !== null) {
        map.leafletElement.fitBounds((0, _itinerary.getLegBounds)(newProps.itinerary.legs[newProps.activeLeg]), {
          padding: padding
        }); // If no itinerary update but from/to locations are present, fit to those
      } else if (newProps.query.from && newProps.query.to && (fromChanged || toChanged)) {
        map.leafletElement.fitBounds([[newProps.query.from.lat, newProps.query.from.lon], [newProps.query.to.lat, newProps.query.to.lon]], {
          padding: padding
        }); // If only from or to is set, pan to that
      } else if (newProps.query.from && fromChanged) {
        map.leafletElement.panTo([newProps.query.from.lat, newProps.query.from.lon]);
      } else if (newProps.query.to && toChanged) {
        map.leafletElement.panTo([newProps.query.to.lat, newProps.query.to.lon]); // Pan to to itinerary step if made active (clicked)
      } else if (newProps.itinerary && newProps.activeLeg !== null && newProps.activeStep !== null && newProps.activeStep !== oldProps.activeStep) {
        var leg = newProps.itinerary.legs[newProps.activeLeg];
        var step = leg.steps[newProps.activeStep];
        map.leafletElement.panTo([step.lat, step.lon]);
      }
    }
  }, {
    key: "componentDidMount",

    /* React Lifecycle methods */
    value: function componentDidMount() {
      var _this2 = this;

      this._updateBounds(null, this.props);

      var lmap = this.refs.map.leafletElement;
      lmap.options.singleClickTimeout = 250;
      lmap.on('singleclick', function (e) {
        _this2._onLeftClick(e);
      });
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      this._updateBounds(this.props, nextProps); // Check if any overlays should be toggled due to mode change


      var overlaysConfig = this.props.config.map.overlays;

      if (overlaysConfig && this.props.query.mode) {
        // Determine any added/removed modes
        var oldModes = this.props.query.mode.split(',');
        var newModes = nextProps.query.mode.split(',');
        var removed = oldModes.filter(function (m) {
          return !newModes.includes(m);
        });
        var added = newModes.filter(function (m) {
          return !oldModes.includes(m);
        });

        var overlayVisibility = _objectSpread({}, this.state.overlayVisibility);

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = overlaysConfig[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var oConfig = _step.value;
            if (!oConfig.modes || oConfig.modes.length !== 1) continue; // TODO: support multi-mode overlays

            var overlayMode = oConfig.modes[0];

            if ((overlayMode === 'CAR_RENT' || overlayMode === 'CAR_HAIL' || overlayMode === 'MICROMOBILITY_RENT') && oConfig.companies) {
              // Special handling for company-based mode overlays (e.g. carshare, car-hail)
              var overlayCompany = oConfig.companies[0]; // TODO: handle multi-company overlays

              if (added.includes(overlayMode)) {
                // Company-based mode was just selected; enable overlay iff overlay's company is active
                if (nextProps.query.companies.includes(overlayCompany)) overlayVisibility[oConfig.name] = true;
              } else if (removed.includes(overlayMode)) {
                // Company-based mode was just deselected; disable overlay (regardless of company)
                overlayVisibility[oConfig.name] = false;
              } else if (newModes.includes(overlayMode) && this.props.query.companies !== nextProps.query.companies) {
                // Company-based mode remains selected but companies change
                overlayVisibility[oConfig.name] = nextProps.query.companies.includes(overlayCompany);
              }
            } else {
              // Default handling for other modes
              if (added.includes(overlayMode)) overlayVisibility[oConfig.name] = true;
              if (removed.includes(overlayMode)) overlayVisibility[oConfig.name] = false;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this.setState({
          overlayVisibility: overlayVisibility
        });
      }
    } // remove custom overlays on unmount

  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var lmap = this.refs.map.leafletElement;
      lmap.eachLayer(function (layer) {
        lmap.removeLayer(layer);
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var _this$props2 = this.props,
          config = _this$props2.config,
          children = _this$props2.children,
          diagramLeg = _this$props2.diagramLeg,
          elevationPoint = _this$props2.elevationPoint,
          popupLocation = _this$props2.popupLocation;
      var baseLayers = config.map.baseLayers;
      var showElevationProfile = Boolean(config.elevationProfile);
      var userControlledOverlays = [];
      var fixedOverlays = [];

      _react.default.Children.toArray(children).forEach(function (child) {
        if (child.props.name) {
          // Add the visibility flag to this layer and push to the internal
          // array of user-controlled overlays
          var visible = _this3.state.overlayVisibility[child.props.name];

          var childWithVisibility = _react.default.cloneElement(child, {
            visible: visible
          });

          userControlledOverlays.push(childWithVisibility);
        } else {
          fixedOverlays.push(child);
        }
      });

      var center = config.map && config.map.initLat && config.map.initLon ? [config.map.initLat, config.map.initLon] : null;
      /* TODO: currently mapProps is unused, but may later be used for controlling
       * map location state
       // const position = [+mapState.lat, +mapState.lon]
      // const zoom = +mapState.zoom
      const bounds = null // mapState.bounds
      const mapProps = {
        ref: 'map',
        className: 'map',
        // center: position,
        // bounds: mapState.bounds || null,
        // zoom: config.initZoom,
        // zoom: +mapState.zoom,
        onContextMenu: this._onRightClick
        // onMoveEnd: this._mapBoundsChanged,
        // onZoomEnd: this._mapBoundsChanged,
      }
      if (bounds) {
        mapProps.bounds = bounds
      } else if (position && zoom) {
        mapProps.center = position
        mapProps.zoom = zoom
      } else {
        console.error('no map position/bounds provided!', {position, zoom, bounds})
      } */
      // Compute the elevation point marker, if activeLeg and elevation profile is enabled.

      var elevationPointMarker = null;

      if (showElevationProfile && diagramLeg && elevationPoint) {
        var pos = (0, _itinerary.legLocationAtDistance)(diagramLeg, elevationPoint);

        if (pos) {
          elevationPointMarker = _react.default.createElement(_reactLeaflet.CircleMarker, {
            center: pos,
            fillColor: "#084c8d",
            weight: 6,
            color: "#555",
            opacity: 0.4,
            radius: 5,
            fill: true,
            fillOpacity: 1
          });
        }
      }

      return _react.default.createElement(_reactLeaflet.Map, {
        ref: "map",
        className: "map",
        center: center // onClick={this._onLeftClick}
        ,
        zoom: config.map.initZoom || 13,
        onOverlayAdd: this._onOverlayAdd,
        onOverlayRemove: this._onOverlayRemove,
        onViewportChanged: this._onViewportChanged
        /* Note: Map-click is handled via single-click plugin, set up in componentDidMount() */

      }, _react.default.createElement(_reactLeaflet.LayersControl, {
        position: "topright"
      },
      /* base layers */
      baseLayers && baseLayers.map(function (l, i) {
        return _react.default.createElement(_reactLeaflet.LayersControl.BaseLayer, {
          name: l.name,
          checked: i === 0,
          key: i
        }, _react.default.createElement(_reactLeaflet.TileLayer, {
          url: l.url,
          attribution: l.attribution,
          maxZoom: l.maxZoom,
          detectRetina: true
        }));
      }),
      /* user-controlled overlay layers */
      userControlledOverlays.map(function (child, i) {
        return _react.default.createElement(_reactLeaflet.LayersControl.Overlay, {
          key: i,
          name: child.props.name,
          checked: child.props.visible
        }, child);
      })), fixedOverlays, popupLocation && _react.default.createElement(_reactLeaflet.Popup, {
        ref: "clickPopup",
        position: [popupLocation.lat, popupLocation.lon],
        onClose: this._popupClosed
      }, _react.default.createElement("div", {
        style: {
          width: 240
        }
      }, _react.default.createElement("div", {
        style: {
          fontSize: 14,
          marginBottom: 6
        }
      }, popupLocation.name.split(',').length > 3 ? popupLocation.name.split(',').splice(0, 3).join(',') : popupLocation.name), _react.default.createElement("div", null, "Plan a trip:", _react.default.createElement("span", {
        style: {
          margin: '0px 5px'
        }
      }, _react.default.createElement(_locationIcon.default, {
        type: "from"
      })), _react.default.createElement("button", {
        className: "link-button",
        onClick: this._onClickFrom
      }, "From here"), ' ', "|", ' ', _react.default.createElement("span", {
        style: {
          margin: '0px 5px'
        }
      }, _react.default.createElement(_locationIcon.default, {
        type: "to"
      })), _react.default.createElement("button", {
        className: "link-button",
        onClick: this._onClickTo
      }, "To here")))), elevationPointMarker);
    }
  }]);

  return BaseMap;
}(_react.Component); // connect to the redux store


_defineProperty(BaseMap, "propTypes", {
  config: _propTypes.default.object,
  mapClick: _propTypes.default.func,
  setLocation: _propTypes.default.func,
  // TODO: rename from action name to avoid namespace conflict?
  toggleName: _propTypes.default.element
  /* Constructor */

});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  return {
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    config: state.otp.config,
    diagramLeg: state.otp.ui.diagramLeg,
    elevationPoint: state.otp.ui.elevationPoint,
    mapState: state.otp.mapState,
    isFromSet: state.otp.currentQuery.from && state.otp.currentQuery.from.lat !== null && state.otp.currentQuery.from.lon !== null,
    isToSet: state.otp.currentQuery.to && state.otp.currentQuery.to.lat !== null && state.otp.currentQuery.to.lon !== null,
    itinerary: (0, _state.getActiveItinerary)(state.otp),
    popupLocation: state.otp.ui.mapPopupLocation,
    query: state.otp.currentQuery
  };
};

var mapDispatchToProps = {
  setLocation: _map.setLocation,
  setMapPopupLocation: _map.setMapPopupLocation,
  setMapPopupLocationAndGeocode: _map.setMapPopupLocationAndGeocode,
  setMapZoom: _config.setMapZoom
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(BaseMap);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=base-map.js
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInitialState = getInitialState;
exports.default = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.array.find");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.array.find-index");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.object.assign");

var _clone = _interopRequireDefault(require("clone"));

var _immutabilityHelper = _interopRequireDefault(require("immutability-helper"));

var _lodash = _interopRequireDefault(require("lodash.isequal"));

var _objectPath = _interopRequireDefault(require("object-path"));

var _coreUtils = _interopRequireDefault(require("@opentripplanner/core-utils"));

var _ui = require("../actions/ui");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var _coreUtils$itinerary = _coreUtils.default.itinerary,
    isTransit = _coreUtils$itinerary.isTransit,
    getTransitModes = _coreUtils$itinerary.getTransitModes;
var matchLatLon = _coreUtils.default.map.matchLatLon;
var filterProfileOptions = _coreUtils.default.profile.filterProfileOptions;
var _coreUtils$query = _coreUtils.default.query,
    ensureSingleAccessMode = _coreUtils$query.ensureSingleAccessMode,
    getDefaultQuery = _coreUtils$query.getDefaultQuery,
    getTripOptionsFromQuery = _coreUtils$query.getTripOptionsFromQuery;
var _coreUtils$storage = _coreUtils.default.storage,
    getItem = _coreUtils$storage.getItem,
    removeItem = _coreUtils$storage.removeItem,
    storeItem = _coreUtils$storage.storeItem;
var getUserTimezone = _coreUtils.default.time.getUserTimezone;
var MAX_RECENT_STORAGE = 5; // TODO: fire planTrip action if default query is complete/error-free

/**
 * Validates the initial state of the store. This is intended to mainly catch
 * configuration issues since a manually edited config file is loaded into the
 * initial state.
 * TODO: mabye it's a better idea to move all of this to a script that can do
 *  JSON Schema validation and other stuff.
 */

function validateInitalState(initialState) {
  var config = initialState.config;
  var errors = []; // validate that the ArcGIS geocoder isn't used with a persistence strategy of
  // `localStorage`. ArcGIS requires the use of a paid account to store geocode
  // results.
  // See https://developers.arcgis.com/rest/geocode/api-reference/geocoding-free-vs-paid.htm

  if (_objectPath.default.get(config, 'persistence.enabled') && _objectPath.default.get(config, 'persistence.strategy') === 'localStorage' && _objectPath.default.get(config, 'geocoder.type') === 'ARCGIS') {
    errors.push(new Error('Local Storage persistence and ARCGIS geocoder cannot be enabled at the same time!'));
  }

  if (errors.length > 0) {
    throw new Error(errors.reduce(function (message, error) {
      return "".concat(message, "\n- ").concat(error.message);
    }, 'Encountered the following configuration errors:'));
  }
}
/**
 * Create the initial state of otp-react-redux using user-provided config, any
 * items in localStorage and a few defaults.
 */


function getInitialState(userDefinedConfig, initialQuery) {
  var defaultConfig = {
    autoPlan: false,
    debouncePlanTimeMs: 0,
    language: {},
    transitOperators: [],
    realtimeEffectsDisplayThreshold: 120,
    routingTypes: [],
    stopViewer: {
      numberOfDepartures: 3,
      // per pattern
      // This is set to 345600 (four days) so that, for example, if it is Friday and
      // a route does not begin service again until Monday, we are showing its next
      // departure and it is not entirely excluded from display.
      timeRange: 345600 // four days in seconds

    }
  };
  var config = Object.assign(defaultConfig, userDefinedConfig);

  if (!config.homeTimezone) {
    config.homeTimezone = getUserTimezone();
    console.warn("Config value 'homeTimezone' not configured for this webapp!\n\n      This value is recommended in order to properly display stop times for\n      users that are not in the timezone that the transit system is in. The\n      detected user timezone of '".concat(config.homeTimezone, "' will be used. Hopefully\n      that is the right one..."));
  } // Load user settings from local storage.
  // TODO: Make this work with settings fetched from alternative storage system
  //  (e.g., OTP backend middleware containing user profile system).
  // User overrides determine user's default mode/query parameters.


  var userOverrides = getItem('defaultQuery', {}); // Combine user overrides with default query to get default search settings.

  var defaults = Object.assign(getDefaultQuery(config), userOverrides); // Whether to auto-refresh stop arrival times in the Stop Viewer.

  var autoRefreshStopTimes = getItem('autoRefreshStopTimes', true); // User's home and work locations

  var home = getItem('home');
  var work = getItem('work'); // Whether recent searches and places should be tracked in local storage.

  var trackRecent = getItem('trackRecent', false); // Recent places used in trip plan searches.

  var recentPlaces = getItem('recent', []); // List of user's favorite stops.

  var favoriteStops = getItem('favoriteStops', []); // Recent trip plan searches (excluding time/date parameters to avoid complexity).

  var recentSearches = getItem('recentSearches', []); // Filter valid locations found into locations list.

  var locations = [home, work].filter(function (p) {
    return p;
  }); // TODO: parse and merge URL query params w/ default query
  // populate query by merging any provided query params w/ the default params

  var currentQuery = Object.assign(defaults, initialQuery); // Add configurable locations to home and work locations

  if (config.locations) {
    locations.push.apply(locations, _toConsumableArray(config.locations.map(function (l) {
      return _objectSpread({}, l, {
        type: 'suggested'
      });
    })));
  } // Check for alternative routerId in session storage. This is generally used
  // for testing single GTFS feed OTP graphs that are deployed to feed-specific
  // routers (e.g., https://otp.server.com/otp/routers/non_default_router).
  // This routerId session value is initially set by visiting otp-rr
  // with the path /start/:latLonZoomRouter, which dispatches the SET_ROUTER_ID
  // action and stores the value in sessionStorage.
  // Note: this mechanism assumes that the OTP API path is otp/routers/default.


  var routerId = window.sessionStorage.getItem('routerId'); // If routerId is found, update the config.api.path (keep the original config
  // value at originalPath in case it needs to be reverted.)

  if (routerId) {
    config.api.originalPath = userDefinedConfig.api.path;
    config.api.path = "/otp/routers/".concat(routerId);
  }

  var queryModes = currentQuery.mode.split(','); // If 'TRANSIT' is included in the mode list, replace it with individual modes

  if (queryModes.includes('TRANSIT')) {
    // Isolate the non-transit modes in queryModes
    queryModes = queryModes.filter(function (m) {
      return !isTransit(m);
    }); // Add all possible transit modes

    queryModes = queryModes.concat(getTransitModes(config)); // Stringify and set as OTP 'mode' query param

    currentQuery.mode = queryModes.join(',');
  } // If we are in 'ITINERARY' mode, ensure that one and only one access mode is selected


  if (currentQuery.routingType === 'ITINERARY') {
    queryModes = ensureSingleAccessMode(queryModes);
  }

  return {
    config: config,
    currentQuery: currentQuery,
    location: {
      currentPosition: {
        error: null,
        coords: null,
        fetching: false
      },
      sessionSearches: [],
      nearbyStops: []
    },
    user: {
      autoRefreshStopTimes: autoRefreshStopTimes,
      // Do not store from/to or date/time in defaults
      defaults: getTripOptionsFromQuery(defaults),
      favoriteStops: favoriteStops,
      trackRecent: trackRecent,
      locations: locations,
      recentPlaces: recentPlaces,
      recentSearches: recentSearches
    },
    searches: {},
    transitIndex: {
      stops: {},
      trips: {}
    },
    useRealtime: true,
    activeSearchId: 0,
    overlay: {
      bikeRental: {
        stations: []
      },
      carRental: {
        stations: []
      },
      parkAndRide: {
        // null default value indicates no request for P&R list has been made
        locations: null
      },
      transit: {
        stops: []
      },
      transitive: null,
      vehicleRental: {
        stations: []
      },
      zipcar: {
        locations: []
      }
    },
    tnc: {
      etaEstimates: {},
      rideEstimates: {}
    },
    ui: {
      mobileScreen: _ui.MobileScreens.WELCOME_SCREEN,
      printView: window.location.href.indexOf('/print/') !== -1,
      diagramLeg: null
    }
  };
}

function createOtpReducer(config, initialQuery) {
  var initialState = getInitialState(config, initialQuery); // validate the inital state

  validateInitalState(initialState);
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments.length > 1 ? arguments[1] : undefined;
    var searchId = action.payload && action.payload.searchId;

    switch (action.type) {
      case 'ROUTING_REQUEST':
        var activeItinerary = action.payload.activeItinerary;
        return (0, _immutabilityHelper.default)(state, {
          searches: _defineProperty({}, searchId, {
            $set: {
              activeItinerary: activeItinerary,
              activeLeg: null,
              activeStep: null,
              pending: true,
              query: (0, _clone.default)(state.currentQuery),
              response: null
            }
          }),
          activeSearchId: {
            $set: searchId
          }
        });

      case 'ROUTING_ERROR':
        return (0, _immutabilityHelper.default)(state, {
          searches: _defineProperty({}, searchId, {
            response: {
              $set: {
                error: action.payload.error
              }
            },
            pending: {
              $set: false
            }
          })
        });

      case 'ROUTING_RESPONSE':
        var response = state.currentQuery.routingType === 'PROFILE' ? filterProfileOptions(action.payload.response) : action.payload.response;
        return (0, _immutabilityHelper.default)(state, {
          searches: _defineProperty({}, searchId, {
            response: {
              $set: response
            },
            pending: {
              $set: false
            }
          }),
          ui: {
            diagramLeg: {
              $set: null
            }
          }
        });

      case 'NON_REALTIME_ROUTING_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          searches: _defineProperty({}, searchId, {
            nonRealtimeResponse: {
              $set: action.payload.response
            }
          })
        });

      case 'BIKE_RENTAL_REQUEST':
        return (0, _immutabilityHelper.default)(state, {
          overlay: {
            bikeRental: {
              pending: {
                $set: true
              },
              error: {
                $set: null
              }
            }
          }
        });

      case 'BIKE_RENTAL_ERROR':
        return (0, _immutabilityHelper.default)(state, {
          overlay: {
            bikeRental: {
              pending: {
                $set: false
              },
              error: {
                $set: action.payload
              }
            }
          }
        });

      case 'BIKE_RENTAL_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          overlay: {
            bikeRental: {
              stations: {
                $set: action.payload.stations
              },
              pending: {
                $set: false
              }
            }
          }
        });

      case 'CAR_RENTAL_ERROR':
        return (0, _immutabilityHelper.default)(state, {
          overlay: {
            carRental: {
              pending: {
                $set: false
              },
              error: {
                $set: action.payload
              }
            }
          }
        });

      case 'CAR_RENTAL_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          overlay: {
            carRental: {
              stations: {
                $set: action.payload.stations
              },
              pending: {
                $set: false
              }
            }
          }
        });

      case 'VEHICLE_RENTAL_ERROR':
        return (0, _immutabilityHelper.default)(state, {
          overlay: {
            vehicleRental: {
              pending: {
                $set: false
              },
              error: {
                $set: action.payload
              }
            }
          }
        });

      case 'VEHICLE_RENTAL_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          overlay: {
            vehicleRental: {
              stations: {
                $set: action.payload.stations
              },
              pending: {
                $set: false
              }
            }
          }
        });

      case 'SET_USE_REALTIME_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          useRealtime: {
            $set: action.payload.useRealtime
          }
        });

      case 'SET_ACTIVE_ITINERARY':
        if (state.activeSearchId !== null) {
          return (0, _immutabilityHelper.default)(state, {
            searches: _defineProperty({}, state.activeSearchId, {
              activeItinerary: {
                $set: action.payload.index
              },
              activeLeg: {
                $set: null
              },
              activeStep: {
                $set: null
              }
            })
          });
        }

        return state;

      case 'SET_ACTIVE_LEG':
        if (state.activeSearchId !== null) {
          return (0, _immutabilityHelper.default)(state, {
            searches: _defineProperty({}, state.activeSearchId, {
              activeLeg: {
                $set: action.payload.index
              },
              activeStep: {
                $set: null
              }
            })
          });
        }

        return state;

      case 'SET_ACTIVE_STEP':
        if (state.activeSearchId !== null) {
          return (0, _immutabilityHelper.default)(state, {
            searches: _defineProperty({}, state.activeSearchId, {
              activeStep: {
                $set: action.payload.index
              }
            })
          });
        }

        return state;

      case 'SET_LOCATION':
        return (0, _immutabilityHelper.default)(state, {
          currentQuery: _defineProperty({}, action.payload.locationType, {
            $set: action.payload.location
          })
        });

      case 'CLEAR_LOCATION':
        return (0, _immutabilityHelper.default)(state, {
          currentQuery: _defineProperty({}, action.payload.locationType, {
            $set: null
          })
        });

      case 'SET_QUERY_PARAM':
        return (0, _immutabilityHelper.default)(state, {
          currentQuery: {
            $merge: action.payload
          }
        });

      case 'CLEAR_ACTIVE_SEARCH':
        return (0, _immutabilityHelper.default)(state, {
          activeSearchId: {
            $set: null
          }
        });

      case 'SET_ACTIVE_SEARCH':
        return (0, _immutabilityHelper.default)(state, {
          activeSearchId: {
            $set: action.payload
          }
        });

      case 'CLEAR_DEFAULT_SETTINGS':
        removeItem('defaultQuery');
        return (0, _immutabilityHelper.default)(state, {
          user: {
            defaults: {
              $set: null
            }
          }
        });

      case 'STORE_DEFAULT_SETTINGS':
        storeItem('defaultQuery', action.payload);
        return (0, _immutabilityHelper.default)(state, {
          user: {
            defaults: {
              $set: action.payload
            }
          }
        });

      case 'FORGET_PLACE':
        {
          // Payload is the place ID.
          // Recent place IDs contain the string literal 'recent'.
          if (action.payload.indexOf('recent') !== -1) {
            var recentPlaces = (0, _clone.default)(state.user.recentPlaces); // Remove recent from list of recent places

            var removeIndex = recentPlaces.findIndex(function (l) {
              return l.id === action.payload;
            });
            recentPlaces.splice(removeIndex, 1);
            storeItem('recent', recentPlaces);
            return removeIndex !== -1 ? (0, _immutabilityHelper.default)(state, {
              user: {
                recentPlaces: {
                  $splice: [[removeIndex, 1]]
                }
              }
            }) : state;
          } else {
            var locations = (0, _clone.default)(state.user.locations);

            var _removeIndex = locations.findIndex(function (l) {
              return l.id === action.payload;
            });

            removeItem(action.payload);
            return _removeIndex !== -1 ? (0, _immutabilityHelper.default)(state, {
              user: {
                locations: {
                  $splice: [[_removeIndex, 1]]
                }
              }
            }) : state;
          }
        }

      case 'REMEMBER_PLACE':
        {
          var _action$payload = action.payload,
              location = _action$payload.location,
              type = _action$payload.type;

          switch (type) {
            case 'recent':
              {
                var _recentPlaces = (0, _clone.default)(state.user.recentPlaces);

                var index = _recentPlaces.findIndex(function (l) {
                  return matchLatLon(l, location);
                }); // Replace recent place if duplicate found or add to list.


                if (index !== -1) _recentPlaces.splice(index, 1, location);else _recentPlaces.push(location);

                var sortedPlaces = _recentPlaces.sort(function (a, b) {
                  return b.timestamp - a.timestamp;
                }); // Only keep up to 5 recent locations
                // FIXME: Check for duplicates


                if (_recentPlaces.length >= MAX_RECENT_STORAGE) {
                  sortedPlaces.splice(MAX_RECENT_STORAGE);
                }

                storeItem('recent', _recentPlaces);
                return (0, _immutabilityHelper.default)(state, {
                  user: {
                    recentPlaces: {
                      $set: sortedPlaces
                    }
                  }
                });
              }

            default:
              {
                var _locations = (0, _clone.default)(state.user.locations); // Determine if location type (e.g., home or work) already exists in list


                var _index = _locations.findIndex(function (l) {
                  return l.type === type;
                });

                if (_index !== -1) _locations.splice(_index, 1, location);else _locations.push(location);
                storeItem(type, location);
                return (0, _immutabilityHelper.default)(state, {
                  user: {
                    locations: {
                      $set: _locations
                    }
                  }
                });
              }
          }
        }

      case 'FORGET_STOP':
        {
          // Payload is the stop ID.
          var favoriteStops = (0, _clone.default)(state.user.favoriteStops); // Remove stop from favorites

          var _removeIndex2 = favoriteStops.findIndex(function (l) {
            return l.id === action.payload;
          });

          favoriteStops.splice(_removeIndex2, 1);
          storeItem('favoriteStops', favoriteStops);
          return _removeIndex2 !== -1 ? (0, _immutabilityHelper.default)(state, {
            user: {
              favoriteStops: {
                $splice: [[_removeIndex2, 1]]
              }
            }
          }) : state;
        }

      case 'REMEMBER_STOP':
        {
          // Payload is stop data. We want to avoid saving other attributes that
          // might be contained there (like lists of patterns).
          var _action$payload2 = action.payload,
              id = _action$payload2.id,
              name = _action$payload2.name,
              lat = _action$payload2.lat,
              lon = _action$payload2.lon;
          var stop = {
            type: 'stop',
            icon: 'bus',
            id: id,
            name: name,
            lat: lat,
            lon: lon
          };

          var _favoriteStops = (0, _clone.default)(state.user.favoriteStops);

          if (_favoriteStops.length >= MAX_RECENT_STORAGE) {
            window.alert("Cannot save more than ".concat(MAX_RECENT_STORAGE, " stops. Remove one before adding more."));
            return state;
          }

          var _index2 = _favoriteStops.findIndex(function (s) {
            return s.id === stop.id;
          }); // Do nothing if duplicate stop found.


          if (_index2 !== -1) {
            console.warn("Stop with id ".concat(stop.id, " already exists in favorites."));
            return state;
          } else {
            _favoriteStops.unshift(stop);
          }

          storeItem('favoriteStops', _favoriteStops);
          return (0, _immutabilityHelper.default)(state, {
            user: {
              favoriteStops: {
                $set: _favoriteStops
              }
            }
          });
        }

      case 'TOGGLE_TRACKING':
        {
          storeItem('trackRecent', action.payload);

          var _recentPlaces2 = (0, _clone.default)(state.user.recentPlaces);

          var recentSearches = (0, _clone.default)(state.user.recentSearches);

          if (!action.payload) {
            // If user disables tracking, remove recent searches and locations.
            _recentPlaces2 = [];
            recentSearches = [];
            removeItem('recent');
            removeItem('recentSearches');
          }

          return (0, _immutabilityHelper.default)(state, {
            user: {
              trackRecent: {
                $set: action.payload
              },
              recentPlaces: {
                $set: _recentPlaces2
              },
              recentSearches: {
                $set: recentSearches
              }
            }
          });
        }

      case 'REMEMBER_SEARCH':
        var searches = (0, _clone.default)(state.user.recentSearches);
        var duplicateIndex = searches.findIndex(function (s) {
          return (0, _lodash.default)(s.query, action.payload.query);
        }); // Overwrite duplicate search (so that new timestamp is stored).

        if (duplicateIndex !== -1) searches[duplicateIndex] = action.payload;else searches.unshift(action.payload);
        var sortedSearches = searches.sort(function (a, b) {
          return b.timestamp - a.timestamp;
        }); // Ensure recent searches do not extend beyong MAX_RECENT_STORAGE

        if (sortedSearches.length >= MAX_RECENT_STORAGE) {
          sortedSearches.splice(MAX_RECENT_STORAGE);
        }

        storeItem('recentSearches', sortedSearches);
        return (0, _immutabilityHelper.default)(state, {
          user: {
            searches: {
              $set: sortedSearches
            }
          }
        });

      case 'FORGET_SEARCH':
        {
          var _recentSearches = (0, _clone.default)(state.user.recentSearches);

          var _index3 = _recentSearches.findIndex(function (l) {
            return l.id === action.payload;
          }); // Remove item from list of recent searches


          _recentSearches.splice(_index3, 1);

          storeItem('recentSearches', _recentSearches);
          return _index3 !== -1 ? (0, _immutabilityHelper.default)(state, {
            user: {
              recentSearches: {
                $splice: [[_index3, 1]]
              }
            }
          }) : state;
        }

      case 'SET_AUTOPLAN':
        return (0, _immutabilityHelper.default)(state, {
          config: {
            autoPlan: {
              $set: action.payload.autoPlan
            }
          }
        });

      case 'SET_MAP_CENTER':
        return (0, _immutabilityHelper.default)(state, {
          config: {
            map: {
              initLat: {
                $set: action.payload.lat
              },
              initLon: {
                $set: action.payload.lon
              }
            }
          }
        });

      case 'SET_MAP_ZOOM':
        return (0, _immutabilityHelper.default)(state, {
          config: {
            map: {
              initZoom: {
                $set: action.payload.zoom
              }
            }
          }
        });

      case 'SET_ROUTER_ID':
        var routerId = action.payload; // Store original path value in originalPath variable.

        var originalPath = config.api.originalPath || config.api.path || '/otp/routers/default';
        var path = routerId ? "/otp/routers/".concat(routerId) // If routerId is null, revert to the original config's API path (or
        // the standard path if that is not found).
        : originalPath; // Store routerId in session storage (persists through page reloads but
        // not when a new tab/window is opened).

        if (routerId) window.sessionStorage.setItem('routerId', routerId);else window.sessionStorage.removeItem('routerId');
        return (0, _immutabilityHelper.default)(state, {
          config: {
            api: {
              path: {
                $set: path
              },
              originalPath: {
                $set: originalPath
              }
            }
          }
        });

      case 'SHOW_LEG_DIAGRAM':
        return (0, _immutabilityHelper.default)(state, {
          ui: {
            diagramLeg: {
              $set: action.payload
            }
          }
        });

      case 'SET_ELEVATION_POINT':
        return (0, _immutabilityHelper.default)(state, {
          ui: {
            elevationPoint: {
              $set: action.payload
            }
          }
        });

      case 'SET_MAP_POPUP_LOCATION':
        return (0, _immutabilityHelper.default)(state, {
          ui: {
            mapPopupLocation: {
              $set: action.payload.location
            }
          }
        });

      case 'POSITION_FETCHING':
        return (0, _immutabilityHelper.default)(state, {
          location: {
            currentPosition: {
              $merge: {
                fetching: action.payload.type
              }
            }
          }
        });

      case 'POSITION_ERROR':
        return (0, _immutabilityHelper.default)(state, {
          location: {
            currentPosition: {
              $set: action.payload
            }
          }
        });

      case 'POSITION_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          location: {
            currentPosition: {
              $set: action.payload.position
            }
          }
        });

      case 'ADD_LOCATION_SEARCH':
        return (0, _immutabilityHelper.default)(state, {
          location: {
            sessionSearches: {
              $unshift: [action.payload.location]
            }
          }
        });

      case 'NEARBY_STOPS_RESPONSE':
        var stopLookup = {};
        action.payload.stops.forEach(function (s) {
          stopLookup[s.id] = s;
        });
        return (0, _immutabilityHelper.default)(state, {
          location: {
            nearbyStops: {
              $set: action.payload.stops.map(function (s) {
                return s.id;
              })
            }
          },
          transitIndex: {
            stops: {
              $merge: stopLookup
            }
          }
        });

      case 'STOPS_WITHIN_BBOX_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          overlay: {
            transit: {
              stops: {
                $set: action.payload.stops
              },
              pending: {
                $set: false
              }
            }
          }
        });

      case 'CLEAR_STOPS_OVERLAY':
        return (0, _immutabilityHelper.default)(state, {
          overlay: {
            transit: {
              stops: {
                $set: []
              },
              pending: {
                $set: false
              }
            }
          }
        });

      case 'ROUTES_AT_STOP_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          transitIndex: {
            stops: _defineProperty({}, action.payload.stopId, {
              routes: {
                $set: action.payload.routes
              }
            })
          }
        });

      case 'SET_MOBILE_SCREEN':
        return (0, _immutabilityHelper.default)(state, {
          ui: {
            mobileScreen: {
              $set: action.payload
            }
          }
        });

      case 'SET_MAIN_PANEL_CONTENT':
        return (0, _immutabilityHelper.default)(state, {
          ui: {
            mainPanelContent: {
              $set: action.payload
            }
          }
        });

      case 'SET_VIEWED_STOP':
        if (action.payload) {
          // If setting to a stop (not null), also set main panel.
          return (0, _immutabilityHelper.default)(state, {
            ui: {
              mainPanelContent: {
                $set: _ui.MainPanelContent.STOP_VIEWER
              },
              viewedStop: {
                $set: action.payload
              }
            }
          });
        } else {
          // Otherwise, just replace viewed stop with null
          return (0, _immutabilityHelper.default)(state, {
            ui: {
              viewedStop: {
                $set: action.payload
              }
            }
          });
        }

      case 'CLEAR_VIEWED_STOP':
        return (0, _immutabilityHelper.default)(state, {
          ui: {
            viewedStop: {
              $set: null
            }
          }
        });

      case 'SET_VIEWED_TRIP':
        return (0, _immutabilityHelper.default)(state, {
          ui: {
            viewedTrip: {
              $set: action.payload
            }
          }
        });

      case 'CLEAR_VIEWED_TRIP':
        return (0, _immutabilityHelper.default)(state, {
          ui: {
            viewedTrip: {
              $set: null
            }
          }
        });

      case 'SET_VIEWED_ROUTE':
        if (action.payload) {
          // If setting to a route (not null), also set main panel.
          return (0, _immutabilityHelper.default)(state, {
            ui: {
              mainPanelContent: {
                $set: _ui.MainPanelContent.ROUTE_VIEWER
              },
              viewedRoute: {
                $set: action.payload
              }
            }
          });
        } else {
          // Otherwise, just replace viewed route with null
          return (0, _immutabilityHelper.default)(state, {
            ui: {
              viewedRoute: {
                $set: action.payload
              }
            }
          });
        }

      case 'FIND_STOP_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          transitIndex: {
            stops: _defineProperty({}, action.payload.id, {
              $set: action.payload
            })
          }
        });

      case 'FIND_TRIP_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          transitIndex: {
            trips: _defineProperty({}, action.payload.id, {
              $set: action.payload
            })
          }
        });

      case 'FIND_STOPS_FOR_TRIP_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          transitIndex: {
            trips: _defineProperty({}, action.payload.tripId, {
              stops: {
                $set: action.payload.stops
              }
            })
          }
        });

      case 'FIND_STOP_TIMES_FOR_TRIP_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          transitIndex: {
            trips: _defineProperty({}, action.payload.tripId, {
              stopTimes: {
                $set: action.payload.stopTimes
              }
            })
          }
        });

      case 'FIND_GEOMETRY_FOR_TRIP_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          transitIndex: {
            trips: _defineProperty({}, action.payload.tripId, {
              geometry: {
                $set: action.payload.geometry
              }
            })
          }
        });

      case 'FIND_STOP_TIMES_FOR_STOP_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          transitIndex: {
            stops: _defineProperty({}, action.payload.stopId, {
              stopTimes: {
                $set: action.payload.stopTimes
              },
              stopTimesLastUpdated: {
                $set: new Date().getTime()
              }
            })
          }
        });

      case 'TOGGLE_AUTO_REFRESH':
        storeItem('autoRefreshStopTimes', action.payload);
        return (0, _immutabilityHelper.default)(state, {
          user: {
            autoRefreshStopTimes: {
              $set: action.payload
            }
          }
        });

      case 'FIND_ROUTES_RESPONSE':
        // If routes is undefined, initialize it w/ the full payload
        if (!state.transitIndex.routes) {
          return (0, _immutabilityHelper.default)(state, {
            transitIndex: {
              routes: {
                $set: action.payload
              }
            }
          });
        } // Otherwise, merge in only the routes not already defined


        var currentRouteIds = Object.keys(state.transitIndex.routes);
        var newRoutes = Object.keys(action.payload).filter(function (key) {
          return !currentRouteIds.includes(key);
        }).reduce(function (res, key) {
          return Object.assign(res, _defineProperty({}, key, action.payload[key]));
        }, {});
        return (0, _immutabilityHelper.default)(state, {
          transitIndex: {
            routes: {
              $merge: newRoutes
            }
          }
        });

      case 'FIND_ROUTE_RESPONSE':
        // If routes is undefined, initialize it w/ this route only
        if (!state.transitIndex.routes) {
          return (0, _immutabilityHelper.default)(state, {
            transitIndex: {
              routes: {
                $set: _defineProperty({}, action.payload.id, action.payload)
              }
            }
          });
        } // Otherwise, overwrite only this route


        return (0, _immutabilityHelper.default)(state, {
          transitIndex: {
            routes: _defineProperty({}, action.payload.id, {
              $set: action.payload
            })
          }
        });

      case 'FIND_PATTERNS_FOR_ROUTE_RESPONSE':
        var _action$payload3 = action.payload,
            patterns = _action$payload3.patterns,
            routeId = _action$payload3.routeId; // If routes is undefined, initialize it w/ this route only

        if (!state.transitIndex.routes) {
          return (0, _immutabilityHelper.default)(state, {
            transitIndex: {
              routes: {
                $set: _defineProperty({}, routeId, {
                  patterns: patterns
                })
              }
            }
          });
        } // Otherwise, overwrite only this route


        return (0, _immutabilityHelper.default)(state, {
          transitIndex: {
            routes: _defineProperty({}, routeId, {
              patterns: {
                $set: patterns
              }
            })
          }
        });

      case 'FIND_GEOMETRY_FOR_PATTERN_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          transitIndex: {
            routes: _defineProperty({}, action.payload.routeId, {
              patterns: _defineProperty({}, action.payload.patternId, {
                geometry: {
                  $set: action.payload.geometry
                }
              })
            })
          }
        });

      case 'TNC_ETA_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          tnc: {
            etaEstimates: _defineProperty({}, action.payload.from, function (fromData) {
              fromData = Object.assign({}, fromData);
              var estimates = action.payload.estimates || [];
              estimates.forEach(function (estimate) {
                if (!fromData[estimate.company]) {
                  fromData[estimate.company] = {};
                }

                fromData[estimate.company][estimate.productId] = Object.assign({
                  estimateTimestamp: new Date()
                }, estimate);
              });
              return fromData;
            })
          }
        });

      case 'TNC_RIDE_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          tnc: {
            rideEstimates: _defineProperty({}, action.payload.from, function (fromData) {
              fromData = Object.assign({}, fromData);
              var _action$payload4 = action.payload,
                  company = _action$payload4.company,
                  rideEstimate = _action$payload4.rideEstimate,
                  to = _action$payload4.to;

              if (!rideEstimate) {
                return fromData;
              }

              if (!fromData[to]) {
                fromData[to] = {};
              }

              if (!fromData[to][company]) {
                fromData[to][company] = {};
              }

              fromData[to][company][rideEstimate.rideType] = Object.assign({
                estimateTimestamp: new Date()
              }, rideEstimate);
              return fromData;
            })
          }
        });

      case 'PARK_AND_RIDE_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          overlay: {
            parkAndRide: {
              locations: {
                $set: action.payload
              },
              pending: {
                $set: false
              }
            }
          }
        });
      // TODO: can this be broken out into a separate module?

      case 'ZIPCAR_LOCATIONS_RESPONSE':
        return (0, _immutabilityHelper.default)(state, {
          overlay: {
            zipcar: {
              locations: {
                $set: action.payload.locations
              },
              pending: {
                $set: false
              }
            }
          }
        });

      case 'UPDATE_OVERLAY_VISIBILITY':
        var mapOverlays = (0, _clone.default)(state.config.map.overlays);

        var _loop = function _loop(key) {
          var overlay = mapOverlays.find(function (o) {
            return o.name === key;
          });
          overlay.visible = action.payload[key];
        };

        for (var key in action.payload) {
          _loop(key);
        }

        return (0, _immutabilityHelper.default)(state, {
          config: {
            map: {
              overlays: {
                $set: mapOverlays
              }
            }
          }
        });

      default:
        return state;
    }
  };
}

var _default = createOtpReducer;
exports.default = _default;

//# sourceMappingURL=create-otp-reducer.js
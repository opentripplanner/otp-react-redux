'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _query = require('../util/query');

var _itinerary = require('../util/itinerary');

var _profile = require('../util/profile');

var _ui = require('../actions/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultConfig = {
  autoPlan: false,
  debouncePlanTimeMs: 0,
  realtimeEffectsDisplayThreshold: 120,
  operators: []

  // Load user override settings from local storage.
  // TODO: Make this work with settings fetched from user profile API service.
};var options = (0, _query.getJSONFromStorage)('otp.defaultQuery');
var defaultQuery = (0, _assign2.default)((0, _query.getDefaultQuery)(), options);
var home = (0, _query.getJSONFromStorage)('otp.home', true);
var work = (0, _query.getJSONFromStorage)('otp.work', true);
var trackRecent = (0, _query.getJSONFromStorage)('otp.trackRecent', true) || false;
var recentPlaces = (0, _query.getJSONFromStorage)('otp.recent', true) || [];
var recentSearches = (0, _query.getJSONFromStorage)('otp.recentSearches', true) || [];
var locations = [home, work].concat((0, _toConsumableArray3.default)(recentPlaces)).filter(function (p) {
  return p;
});
// TODO: parse and merge URL query params w/ default query

// TODO: fire planTrip action if default query is complete/error-free

function createOtpReducer(config, initialQuery) {
  // populate query by merging any provided query params w/ the default params
  var currentQuery = (0, _assign2.default)(defaultQuery, initialQuery);
  if (config.locations) {
    locations.push.apply(locations, (0, _toConsumableArray3.default)(config.locations.map(function (l) {
      return (0, _extends3.default)({}, l, { type: 'suggested' });
    })));
  }
  var queryModes = currentQuery.mode.split(',');

  // If 'TRANSIT' is included in the mode list, replace it with individual modes
  if (queryModes.includes('TRANSIT')) {
    // Isolate the non-transit modes in queryModes
    queryModes = queryModes.filter(function (m) {
      return !(0, _itinerary.isTransit)(m);
    });
    // Add all possible transit modes
    queryModes = queryModes.concat((0, _itinerary.getTransitModes)(config));
    // Stringify and set as OTP 'mode' query param
    currentQuery.mode = queryModes.join(',');
  }

  // If we are in 'ITINERARY' mode, ensure that one and only one access mode is selected
  if (currentQuery.routingType === 'ITINERARY') {
    queryModes = (0, _query.ensureSingleAccessMode)(queryModes);
  }

  var initialState = {
    config: (0, _assign2.default)(defaultConfig, config),
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
      trackRecent: trackRecent,
      locations: locations,
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

  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    var searchId = action.payload && action.payload.searchId;
    switch (action.type) {
      case 'ROUTING_REQUEST':
        // Compute the initial activeItinerary. If this is the first search of
        // session (i.e. searches lookup is empty/null) AND an activeItinerary ID
        // is specified in URL parameters, use that ID. Otherwise, use null/0
        var activeItinerary = state.currentQuery.routingType === 'ITINERARY' ? 0 : null;
        // We cannot use window.history.state here to check for the active
        // itinerary param because it is unreliable in some states (e.g.,
        // when the print layout component first loads).
        var urlParams = (0, _query.getUrlParams)();
        if ((!state.searches || (0, _keys2.default)(state.searches).length === 0) && urlParams.ui_activeItinerary) {
          activeItinerary = +urlParams.ui_activeItinerary;
        }

        return (0, _immutabilityHelper2.default)(state, {
          searches: (0, _defineProperty3.default)({}, searchId, {
            $set: {
              activeItinerary: activeItinerary,
              activeLeg: null,
              activeStep: null,
              pending: true,
              query: (0, _clone2.default)(state.currentQuery),
              response: null
            }
          }),
          activeSearchId: { $set: searchId }
        });
      case 'ROUTING_ERROR':
        return (0, _immutabilityHelper2.default)(state, {
          searches: (0, _defineProperty3.default)({}, searchId, {
            response: {
              $set: {
                error: action.payload.error
              }
            },
            pending: { $set: false }
          })
        });
      case 'ROUTING_RESPONSE':
        var response = state.currentQuery.routingType === 'PROFILE' ? (0, _profile.filterProfileOptions)(action.payload.response) : action.payload.response;

        return (0, _immutabilityHelper2.default)(state, {
          searches: (0, _defineProperty3.default)({}, searchId, {
            response: { $set: response },
            pending: { $set: false }
          }),
          ui: {
            diagramLeg: { $set: false }
          }
        });
      case 'NON_REALTIME_ROUTING_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          searches: (0, _defineProperty3.default)({}, searchId, {
            nonRealtimeResponse: { $set: action.payload.response }
          })
        });
      case 'BIKE_RENTAL_REQUEST':
        return (0, _immutabilityHelper2.default)(state, {
          overlay: {
            bikeRental: {
              pending: { $set: true },
              error: { $set: null }
            }
          }
        });
      case 'BIKE_RENTAL_ERROR':
        return (0, _immutabilityHelper2.default)(state, {
          overlay: {
            bikeRental: {
              pending: { $set: false },
              error: { $set: action.payload }
            }
          }
        });
      case 'BIKE_RENTAL_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          overlay: {
            bikeRental: {
              stations: { $set: action.payload.stations },
              pending: { $set: false }
            }
          }
        });
      case 'CAR_RENTAL_ERROR':
        return (0, _immutabilityHelper2.default)(state, {
          overlay: {
            carRental: {
              pending: { $set: false },
              error: { $set: action.payload }
            }
          }
        });
      case 'CAR_RENTAL_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          overlay: {
            carRental: {
              stations: { $set: action.payload.stations },
              pending: { $set: false }
            }
          }
        });
      case 'VEHICLE_RENTAL_ERROR':
        return (0, _immutabilityHelper2.default)(state, {
          overlay: {
            vehicleRental: {
              pending: { $set: false },
              error: { $set: action.payload }
            }
          }
        });
      case 'VEHICLE_RENTAL_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          overlay: {
            vehicleRental: {
              stations: { $set: action.payload.stations },
              pending: { $set: false }
            }
          }
        });
      case 'SET_USE_REALTIME_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          useRealtime: { $set: action.payload.useRealtime }
        });
      case 'SET_ACTIVE_ITINERARY':
        if (state.activeSearchId !== null) {
          return (0, _immutabilityHelper2.default)(state, {
            searches: (0, _defineProperty3.default)({}, state.activeSearchId, {
              activeItinerary: { $set: action.payload.index },
              activeLeg: { $set: null },
              activeStep: { $set: null }
            })
          });
        }
        return state;
      case 'SET_ACTIVE_LEG':
        if (state.activeSearchId !== null) {
          return (0, _immutabilityHelper2.default)(state, {
            searches: (0, _defineProperty3.default)({}, state.activeSearchId, {
              activeLeg: { $set: action.payload.index },
              activeStep: { $set: null }
            })
          });
        }
        return state;
      case 'SET_ACTIVE_STEP':
        if (state.activeSearchId !== null) {
          return (0, _immutabilityHelper2.default)(state, {
            searches: (0, _defineProperty3.default)({}, state.activeSearchId, {
              activeStep: { $set: action.payload.index }
            })
          });
        }
        return state;
      case 'SET_LOCATION':
        return (0, _immutabilityHelper2.default)(state, {
          currentQuery: (0, _defineProperty3.default)({}, action.payload.type, { $set: action.payload.location })
        });
      case 'CLEAR_LOCATION':
        return (0, _immutabilityHelper2.default)(state, {
          currentQuery: (0, _defineProperty3.default)({}, action.payload.type, { $set: null })
        });

      case 'SET_QUERY_PARAM':
        console.log('merging QPs', action.payload);
        return (0, _immutabilityHelper2.default)(state, { currentQuery: { $merge: action.payload } });

      case 'CLEAR_ACTIVE_SEARCH':
        return (0, _immutabilityHelper2.default)(state, { activeSearchId: { $set: null } });
      case 'CLEAR_DEFAULT_SETTINGS':
        window.localStorage.removeItem('otp.defaultQuery');
        return (0, _immutabilityHelper2.default)(state, { defaults: { $set: null } });
      case 'STORE_DEFAULT_SETTINGS':
        window.localStorage.setItem('otp.defaultQuery', (0, _stringify2.default)(action.payload));
        return (0, _immutabilityHelper2.default)(state, { defaults: { $set: action.payload } });
      case 'FORGET_PLACE':
        {
          var _locations = (0, _clone2.default)(state.user.locations);
          var locationIndex = _locations.findIndex(function (l) {
            return l.id === action.payload;
          });
          if (action.payload.indexOf('recent') !== -1) {
            // Remove recent from list of recent places
            var _recentPlaces = _locations.filter(function (l) {
              return l.type === 'recent';
            });
            var removeIndex = _recentPlaces.findIndex(function (l) {
              return l.id === action.payload;
            });
            _recentPlaces.splice(removeIndex, 1);
            window.localStorage.setItem('otp.recent', (0, _stringify2.default)(_recentPlaces));
          } else {
            window.localStorage.removeItem('otp.' + action.payload);
          }
          return locationIndex !== -1 ? (0, _immutabilityHelper2.default)(state, { user: { locations: { $splice: [[locationIndex, 1]] } } }) : state;
        }
      case 'TOGGLE_TRACKING':
        {
          window.localStorage.setItem('otp.trackRecent', (0, _stringify2.default)(action.payload));
          var _locations2 = (0, _clone2.default)(state.user.locations);
          if (!action.payload) {
            // If user disables tracking, remove recent searches and locations.
            _locations2 = _locations2.filter(function (l) {
              return l.type !== 'recent';
            });
            window.localStorage.removeItem('otp.recent');
            window.localStorage.removeItem('otp.recentSearches');
          }
          return (0, _immutabilityHelper2.default)(state, { user: {
              trackRecent: { $set: action.payload },
              locations: { $set: _locations2 },
              recentSearches: { $set: [] }
            } });
        }
      case 'REMEMBER_PLACE':
        {
          var _action$payload = action.payload,
              location = _action$payload.location,
              type = _action$payload.type;

          var _locations3 = (0, _clone2.default)(state.user.locations);
          var _duplicateIndex = _locations3.findIndex(function (l) {
            return l.lat === location.lat && l.lon === location.lon;
          });
          var locationsUpdate = void 0;
          if (location.type === 'recent') {
            var firstIndex = -1;
            var lastIndex = -1;
            _locations3.forEach(function (l, i) {
              if (l.type === 'recent') {
                if (firstIndex === -1) firstIndex = i;else lastIndex = i;
              }
            });
            var _recentPlaces2 = _locations3.filter(function (l) {
              return l.type === 'recent';
            });
            if (_duplicateIndex !== -1) {
              // If duplicate index found for a recent place, do not store recent
              // place (no state change)
              return state;
            }
            // Only keep up to 5 recent locations
            // FIXME: Check for duplicates
            if (_recentPlaces2.length >= 5) {
              _recentPlaces2.splice(lastIndex, 1, location);
              locationsUpdate = { $splice: [[lastIndex, 1, location]] };
            } else {
              _recentPlaces2.push(location);
              locationsUpdate = { $push: [location] };
            }
            window.localStorage.setItem('otp.recent', (0, _stringify2.default)(_recentPlaces2));
          } else {
            if (_duplicateIndex !== -1) {}
            // If a duplicate place was found for a home/work location, that's
            // not a problem

            // Determine if location type already exists in list
            var index = _locations3.findIndex(function (l) {
              return l.type === type;
            });
            if (index !== -1) {
              locationsUpdate = { $splice: [[index, 1, location]] };
            } else {
              locationsUpdate = { $push: [location] };
            }
            window.localStorage.setItem('otp.' + type, (0, _stringify2.default)(location));
          }
          return (0, _immutabilityHelper2.default)(state, { user: { locations: locationsUpdate } });
        }
      case 'REMEMBER_SEARCH':
        var searches = (0, _clone2.default)(state.user.recentSearches);
        var duplicateIndex = searches.findIndex(function (s) {
          return (0, _lodash2.default)(s.query, action.payload.query);
        });
        // Do not store a duplicate search
        if (duplicateIndex !== -1) {
          return state;
        }
        searches.push(action.payload);
        window.localStorage.setItem('otp.recentSearches', (0, _stringify2.default)(searches));
        return (0, _immutabilityHelper2.default)(state, { user: { searches: { $set: searches } } });
      case 'FORGET_SEARCH':
        {
          var _recentSearches = (0, _clone2.default)(state.user.recentSearches);
          var _index = _recentSearches.findIndex(function (l) {
            return l.id === action.payload;
          });
          // Remove item from list of recent searches
          _recentSearches.splice(_index, 1);
          window.localStorage.setItem('otp.recentSearches', (0, _stringify2.default)(_recentSearches));
          return _index !== -1 ? (0, _immutabilityHelper2.default)(state, { user: { recentSearches: { $splice: [[_index, 1]] } } }) : state;
        }
      case 'SET_AUTOPLAN':
        return (0, _immutabilityHelper2.default)(state, {
          config: { autoPlan: { $set: action.payload.autoPlan } }
        });
      case 'SET_MAP_CENTER':
        return (0, _immutabilityHelper2.default)(state, {
          config: {
            map: {
              initLat: { $set: action.payload.lat },
              initLon: { $set: action.payload.lon }
            }
          }
        });
      case 'SET_MAP_ZOOM':
        return (0, _immutabilityHelper2.default)(state, {
          config: {
            map: {
              initZoom: { $set: action.payload.zoom }
            }
          }
        });
      case 'SHOW_LEG_DIAGRAM':
        return (0, _immutabilityHelper2.default)(state, {
          ui: {
            diagramLeg: { $set: action.payload }
          }
        });
      case 'SET_ELEVATION_POINT':
        return (0, _immutabilityHelper2.default)(state, {
          ui: {
            elevationPoint: { $set: action.payload }
          }
        });
      case 'SET_MAP_POPUP_LOCATION':
        return (0, _immutabilityHelper2.default)(state, {
          ui: {
            mapPopupLocation: { $set: action.payload.location }
          }
        });
      case 'POSITION_FETCHING':
        return (0, _immutabilityHelper2.default)(state, {
          location: {
            currentPosition: { $merge: { fetching: action.payload.type } }
          }
        });
      case 'POSITION_ERROR':
        return (0, _immutabilityHelper2.default)(state, {
          location: { currentPosition: { $set: action.payload } }
        });
      case 'POSITION_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          location: { currentPosition: { $set: action.payload.position } }
        });
      case 'ADD_LOCATION_SEARCH':
        return (0, _immutabilityHelper2.default)(state, {
          location: { sessionSearches: { $unshift: [action.payload.location] } }
        });

      case 'NEARBY_STOPS_RESPONSE':
        var stopLookup = {};
        action.payload.stops.forEach(function (s) {
          stopLookup[s.id] = s;
        });
        return (0, _immutabilityHelper2.default)(state, {
          location: {
            nearbyStops: { $set: action.payload.stops.map(function (s) {
                return s.id;
              }) }
          },
          transitIndex: { stops: { $merge: stopLookup } }
        });
      case 'STOPS_WITHIN_BBOX_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          overlay: {
            transit: {
              stops: { $set: action.payload.stops },
              pending: { $set: false }
            }
          }
        });
      case 'CLEAR_STOPS_OVERLAY':
        return (0, _immutabilityHelper2.default)(state, {
          overlay: {
            transit: {
              stops: { $set: [] },
              pending: { $set: false }
            }
          }
        });
      case 'ROUTES_AT_STOP_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          transitIndex: {
            stops: (0, _defineProperty3.default)({}, action.payload.stopId, {
              routes: { $set: action.payload.routes }
            })
          }
        });
      case 'SET_MOBILE_SCREEN':
        return (0, _immutabilityHelper2.default)(state, { ui: { mobileScreen: { $set: action.payload } } });
      case 'SET_MAIN_PANEL_CONTENT':
        return (0, _immutabilityHelper2.default)(state, {
          ui: { mainPanelContent: { $set: action.payload } }
        });
      case 'SET_VIEWED_STOP':
        return (0, _immutabilityHelper2.default)(state, { ui: { viewedStop: { $set: action.payload } } });
      case 'CLEAR_VIEWED_STOP':
        return (0, _immutabilityHelper2.default)(state, { ui: { viewedStop: { $set: null } } });

      case 'SET_VIEWED_TRIP':
        return (0, _immutabilityHelper2.default)(state, { ui: { viewedTrip: { $set: action.payload } } });
      case 'CLEAR_VIEWED_TRIP':
        return (0, _immutabilityHelper2.default)(state, { ui: { viewedTrip: { $set: null } } });

      case 'SET_VIEWED_ROUTE':
        return (0, _immutabilityHelper2.default)(state, { ui: { viewedRoute: { $set: action.payload } } });

      case 'FIND_STOP_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          transitIndex: {
            stops: (0, _defineProperty3.default)({}, action.payload.id, { $set: action.payload })
          }
        });
      case 'FIND_TRIP_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          transitIndex: {
            trips: (0, _defineProperty3.default)({}, action.payload.id, { $set: action.payload })
          }
        });
      case 'FIND_STOPS_FOR_TRIP_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          transitIndex: {
            trips: (0, _defineProperty3.default)({}, action.payload.tripId, { stops: { $set: action.payload.stops } })
          }
        });
      case 'FIND_STOP_TIMES_FOR_TRIP_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          transitIndex: {
            trips: (0, _defineProperty3.default)({}, action.payload.tripId, {
              stopTimes: { $set: action.payload.stopTimes }
            })
          }
        });
      case 'FIND_GEOMETRY_FOR_TRIP_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          transitIndex: {
            trips: (0, _defineProperty3.default)({}, action.payload.tripId, {
              geometry: { $set: action.payload.geometry }
            })
          }
        });
      case 'FIND_STOP_TIMES_FOR_STOP_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          transitIndex: {
            stops: (0, _defineProperty3.default)({}, action.payload.stopId, {
              stopTimes: { $set: action.payload.stopTimes }
            })
          }
        });

      case 'FIND_ROUTES_RESPONSE':
        // If routes is undefined, initialize it w/ the full payload
        if (!state.transitIndex.routes) {
          return (0, _immutabilityHelper2.default)(state, {
            transitIndex: { routes: { $set: action.payload } }
          });
        }
        // Otherwise, merge in only the routes not already defined
        var currentRouteIds = (0, _keys2.default)(state.transitIndex.routes);
        var newRoutes = (0, _keys2.default)(action.payload).filter(function (key) {
          return !currentRouteIds.includes(key);
        }).reduce(function (res, key) {
          return (0, _assign2.default)(res, (0, _defineProperty3.default)({}, key, action.payload[key]));
        }, {});
        return (0, _immutabilityHelper2.default)(state, {
          transitIndex: { routes: { $merge: newRoutes } }
        });

      case 'FIND_ROUTE_RESPONSE':
        // If routes is undefined, initialize it w/ this route only
        if (!state.transitIndex.routes) {
          return (0, _immutabilityHelper2.default)(state, {
            transitIndex: { routes: { $set: (0, _defineProperty3.default)({}, action.payload.id, action.payload) } }
          });
        }
        // Otherwise, overwrite only this route
        return (0, _immutabilityHelper2.default)(state, {
          transitIndex: {
            routes: (0, _defineProperty3.default)({}, action.payload.id, { $set: action.payload })
          }
        });

      case 'FIND_PATTERNS_FOR_ROUTE_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          transitIndex: {
            routes: (0, _defineProperty3.default)({}, action.payload.routeId, {
              patterns: { $set: action.payload.patterns }
            })
          }
        });
      case 'FIND_GEOMETRY_FOR_PATTERN_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          transitIndex: {
            routes: (0, _defineProperty3.default)({}, action.payload.routeId, {
              patterns: (0, _defineProperty3.default)({}, action.payload.patternId, {
                geometry: { $set: action.payload.geometry }
              })
            })
          }
        });
      case 'TNC_ETA_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          tnc: {
            etaEstimates: (0, _defineProperty3.default)({}, action.payload.from, function (fromData) {
              fromData = (0, _assign2.default)({}, fromData);
              var estimates = action.payload.estimates || [];
              estimates.forEach(function (estimate) {
                if (!fromData[estimate.company]) {
                  fromData[estimate.company] = {};
                }
                fromData[estimate.company][estimate.productId] = (0, _assign2.default)({
                  estimateTimestamp: new Date()
                }, estimate);
              });
              return fromData;
            })
          }
        });
      case 'TNC_RIDE_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          tnc: {
            rideEstimates: (0, _defineProperty3.default)({}, action.payload.from, function (fromData) {
              fromData = (0, _assign2.default)({}, fromData);
              var _action$payload2 = action.payload,
                  company = _action$payload2.company,
                  rideEstimate = _action$payload2.rideEstimate,
                  to = _action$payload2.to;

              if (!rideEstimate) {
                return fromData;
              }
              if (!fromData[to]) {
                fromData[to] = {};
              }
              if (!fromData[to][company]) {
                fromData[to][company] = {};
              }
              fromData[to][company][rideEstimate.rideType] = (0, _assign2.default)({
                estimateTimestamp: new Date()
              }, rideEstimate);
              return fromData;
            })
          }
        });

      case 'PARK_AND_RIDE_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          overlay: {
            parkAndRide: {
              locations: { $set: action.payload },
              pending: { $set: false }
            }
          }
        });

      // TODO: can this be broken out into a separate module?
      case 'ZIPCAR_LOCATIONS_RESPONSE':
        return (0, _immutabilityHelper2.default)(state, {
          overlay: {
            zipcar: {
              locations: { $set: action.payload.locations },
              pending: { $set: false }
            }
          }
        });
      // case 'INITIALIZE_TRANSITIVE':
      //   const transitive = new Transitive({
      //     data: action.payload.transitiveData,
      //     initialBounds: action.payload.bounds,
      //     zoomEnabled: false,
      //     autoResize: false,
      //     styles: require('./transitive-styles'),
      //     zoomFactors,
      //     display: 'canvas',
      //     canvas
      //   })
      //   return update(state, {
      //     overlay: {
      //       transitive: { $set: }
      //     }
      //   })
      default:
        return state;
    }
  };
}

exports.default = createOtpReducer;
module.exports = exports['default'];

//# sourceMappingURL=create-otp-reducer.js
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _query = require('./query');

var _time = require('./time');

var _itinerary = require('./itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * name: the default name of the parameter used for internal reference and API calls
 *
 * routingTypes: array of routing type(s) (ITINERARY, PROFILE, or both) this param applies to
 *
 * applicable: an optional function (accepting the current full query as a
 *   parameter) indicating whether this query parameter is applicable to the query.
 *   (Applicability is assumed if this function is not provided.)
 *
 * default: the default value for this parameter
 *
 * itineraryRewrite: an optional function for translating the key and/or value
 *   for ITINERARY mode only (e.g. 'to' is rewritten as 'toPlace'). Accepts the
 *   intial internal value as a function parameter.
 *
 * profileRewrite: an optional function for translating the value for PROFILE mode
 *
 * label: a text label for for onscreen display. May either be a text string or a
 *   function (accepting the current full query as a parameter) returning a string
 *
 * selector: the default type of UI selector to use in the form. Can be one of:
 *   - DROPDOWN: a standard drop-down menu selector
 *
 * options: an array of text/value pairs used with a dropdown selector
 *
 * TODO: validation system for rewrite functions and/or better user documentation
 * TODO: alphabetize below list
 */

// FIXME: Use for parsing URL values?
// const stringToLocation = string => {
//   const split = string.split(',')
//   return split.length === 2
//     ? {lat: split[0], lon: split[1]}
//     : {lat: null, lon: null}
// }

var formatPlace = function formatPlace(location, alternateName) {
  if (!location) return null;
  var name = location.name || (alternateName || 'Place') + ' (' + location.lat + ',' + location.lon + ')';
  return name + '::' + location.lat + ',' + location.lon;
};

// Load stored default query settings from local storage
var storedSettings = (0, _query.getJSONFromStorage)('otp.defaultQuery');

var queryParams = [{ /* from - the trip origin. stored internally as a location (lat/lon/name) object  */
  name: 'from',
  routingTypes: ['ITINERARY', 'PROFILE'],
  default: null,
  itineraryRewrite: function itineraryRewrite(value) {
    return { fromPlace: formatPlace(value, 'Origin') };
  },
  profileRewrite: function profileRewrite(value) {
    return { from: { lat: value.lat, lon: value.lon } };
  }
  // FIXME: Use for parsing URL values?
  // fromURL: stringToLocation
}, { /* to - the trip destination. stored internally as a location (lat/lon/name) object  */
  name: 'to',
  routingTypes: ['ITINERARY', 'PROFILE'],
  default: null,
  itineraryRewrite: function itineraryRewrite(value) {
    return { toPlace: formatPlace(value, 'Destination') };
  },
  profileRewrite: function profileRewrite(value) {
    return { to: { lat: value.lat, lon: value.lon } };
  }
  // FIXME: Use for parsing URL values?
  // fromURL: stringToLocation
}, { /* date - the date of travel, in MM-DD-YYYY format */
  name: 'date',
  routingTypes: ['ITINERARY', 'PROFILE'],
  default: (0, _time.getCurrentDate)()
}, { /* time - the arrival/departure time for an itinerary trip, in HH:MM format */
  name: 'time',
  routingTypes: ['ITINERARY'],
  default: (0, _time.getCurrentTime)()
}, { /* departArrive - whether this is a depart-at, arrive-by, or leave-now trip */
  name: 'departArrive',
  routingTypes: ['ITINERARY'],
  default: 'NOW',
  itineraryRewrite: function itineraryRewrite(value) {
    return { arriveBy: value === 'ARRIVE' };
  }
}, { /* startTime - the start time for a profile trip, in HH:MM format */
  name: 'startTime',
  routingTypes: ['PROFILE'],
  default: '07:00'
}, { /* endTime - the end time for a profile trip, in HH:MM format */
  name: 'endTime',
  routingTypes: ['PROFILE'],
  default: '09:00'
}, { /* mode - the allowed modes for a trip, as a comma-separated list */
  name: 'mode',
  routingTypes: ['ITINERARY', 'PROFILE'],
  default: 'WALK,TRANSIT', // TODO: make this dependent on routingType?
  profileRewrite: function profileRewrite(value) {
    var accessModes = [];
    var directModes = [];
    var transitModes = [];

    if (value && value.length > 0) {
      value.split(',').forEach(function (m) {
        if ((0, _itinerary.isTransit)(m)) transitModes.push(m);
        if ((0, _itinerary.isAccessMode)(m)) {
          accessModes.push(m);
          // TODO: make configurable whether direct-driving is considered
          if (!(0, _itinerary.isCar)(m)) directModes.push(m);
        }
      });
    }

    return { accessModes: accessModes, directModes: directModes, transitModes: transitModes };
  }
}, { /* showIntermediateStops - whether response should include intermediate stops for transit legs */
  name: 'showIntermediateStops',
  routingTypes: ['ITINERARY'],
  default: true
}, { /* maxWalkDistance - the maximum distance in meters the user will walk to transit. */
  name: 'maxWalkDistance',
  routingTypes: ['ITINERARY'],
  applicable: function applicable(query) {
    return query.mode && (0, _itinerary.hasTransit)(query.mode) && query.mode.indexOf('WALK') !== -1;
  },
  default: 1207, // 3/4 mi.
  selector: 'DROPDOWN',
  label: 'Maximum Walk',
  options: [{
    text: '1/10 mile',
    value: 160.9
  }, {
    text: '1/4 mile',
    value: 402.3
  }, {
    text: '1/2 mile',
    value: 804.7
  }, {
    text: '3/4 mile',
    value: 1207
  }, {
    text: '1 mile',
    value: 1609
  }, {
    text: '2 miles',
    value: 3219
  }, {
    text: '5 miles',
    value: 8047
  }]
}, { /* maxBikeDistance - the maximum distance in meters the user will bike. Not
      * actually an OTP parameter (maxWalkDistance doubles for biking) but we
      * store it separately internally in order to allow different default values,
      * options, etc.  Translated to 'maxWalkDistance' via the rewrite function.
      */
  name: 'maxBikeDistance',
  routingTypes: ['ITINERARY'],
  applicable: function applicable(query) {
    return query.mode && (0, _itinerary.hasTransit)(query.mode) && query.mode.indexOf('BICYCLE') !== -1;
  },
  default: 4828, // 3 mi.
  selector: 'DROPDOWN',
  label: 'Maximum Bike',
  options: [{
    text: '1/4 mile',
    value: 402.3
  }, {
    text: '1/2 mile',
    value: 804.7
  }, {
    text: '3/4 mile',
    value: 1207
  }, {
    text: '1 mile',
    value: 1609
  }, {
    text: '2 miles',
    value: 3219
  }, {
    text: '3 miles',
    value: 4828
  }, {
    text: '5 miles',
    value: 8047
  }, {
    text: '10 miles',
    value: 16093
  }, {
    text: '20 miles',
    value: 32187
  }, {
    text: '30 miles',
    value: 48280
  }],
  itineraryRewrite: function itineraryRewrite(value) {
    return {
      maxWalkDistance: value,
      // ensures that the value is repopulated when loaded from URL params
      maxBikeDistance: value
    };
  }
}, { /* optimize -- how to optimize a trip (non-bike trips) */
  name: 'optimize',
  applicable: function applicable(query) {
    return (0, _itinerary.hasTransit)(query.mode) && !(0, _itinerary.hasBike)(query.mode);
  },
  routingTypes: ['ITINERARY'],
  default: 'QUICK',
  selector: 'DROPDOWN',
  label: 'Optimize for',
  options: [{
    text: 'Speed',
    value: 'QUICK'
  }, {
    text: 'Fewest Transfers',
    value: 'TRANSFERS'
  }]
}, { /* optimizeBike -- how to optimize an bike-based trip */
  name: 'optimizeBike',
  applicable: function applicable(query) {
    return (0, _itinerary.hasBike)(query.mode);
  },
  routingTypes: ['ITINERARY'],
  default: 'SAFE',
  selector: 'DROPDOWN',
  label: 'Optimize for',
  options: function options(query) {
    var opts = [{
      text: 'Speed',
      value: 'QUICK'
    }, {
      text: 'Bike-Friendly Trip',
      value: 'SAFE'
    }, {
      text: 'Flat Trip',
      value: 'FLAT'
    }];

    // Include transit-specific option, if applicable
    if ((0, _itinerary.hasTransit)(query.mode)) {
      opts.splice(1, 0, {
        text: 'Fewest Transfers',
        value: 'TRANSFERS'
      });
    }

    return opts;
  },
  itineraryRewrite: function itineraryRewrite(value) {
    return { optimize: value };
  }
}, { /* maxWalkTime -- the maximum time the user will spend walking in minutes */
  name: 'maxWalkTime',
  routingTypes: ['PROFILE'],
  default: 15,
  selector: 'DROPDOWN',
  label: 'Max Walk Time',
  applicable: function applicable(query) {
    return query.mode && (0, _itinerary.hasTransit)(query.mode) && query.mode.indexOf('WALK') !== -1;
  },
  options: [{
    text: '5 minutes',
    value: 5
  }, {
    text: '10 minutes',
    value: 10
  }, {
    text: '15 minutes',
    value: 15
  }, {
    text: '20 minutes',
    value: 20
  }, {
    text: '30 minutes',
    value: 30
  }, {
    text: '45 minutes',
    value: 45
  }, {
    text: '1 hour',
    value: 60
  }]
}, { /* walkSpeed -- the user's walking speed in m/s */
  name: 'walkSpeed',
  routingTypes: ['ITINERARY', 'PROFILE'],
  default: 1.34,
  selector: 'DROPDOWN',
  label: 'Walk Speed',
  applicable: function applicable(query) {
    return query.mode && query.mode.indexOf('WALK') !== -1;
  },
  options: [{
    text: '2 MPH',
    value: 0.89
  }, {
    text: '3 MPH',
    value: 1.34
  }, {
    text: '4 MPH',
    value: 1.79
  }]
}, { /* maxBikeTime -- the maximum time the user will spend biking in minutes */
  name: 'maxBikeTime',
  routingTypes: ['PROFILE'],
  default: 20,
  selector: 'DROPDOWN',
  label: 'Max Bike Time',
  applicable: function applicable(query) {
    return query.mode && (0, _itinerary.hasTransit)(query.mode) && query.mode.indexOf('BICYCLE') !== -1;
  },
  options: [{
    text: '5 minutes',
    value: 5
  }, {
    text: '10 minutes',
    value: 10
  }, {
    text: '15 minutes',
    value: 15
  }, {
    text: '20 minutes',
    value: 20
  }, {
    text: '30 minutes',
    value: 30
  }, {
    text: '45 minutes',
    value: 45
  }, {
    text: '1 hour',
    value: 60
  }]
}, { /* bikeSpeed -- the user's bikeSpeed speed in m/s */
  name: 'bikeSpeed',
  routingTypes: ['ITINERARY', 'PROFILE'],
  default: 3.58,
  selector: 'DROPDOWN',
  label: 'Bicycle Speed',
  applicable: function applicable(query) {
    return query.mode && query.mode.indexOf('BICYCLE') !== -1;
  },
  options: [{
    text: '6 MPH',
    value: 2.68
  }, {
    text: '8 MPH',
    value: 3.58
  }, {
    text: '10 MPH',
    value: 4.47
  }, {
    text: '12 MPH',
    value: 5.36
  }]
}, { /* ignoreRealtimeUpdates -- if true, do not use realtime updates in routing */
  name: 'ignoreRealtimeUpdates',
  routingTypes: ['ITINERARY'],
  default: false
}, { /* companies -- tnc companies to query */
  name: 'companies',
  routingTypes: ['ITINERARY'],
  default: null
}, { /* wheelchair -- whether the user requires a wheelchair-accessible trip */
  name: 'wheelchair',
  routingTypes: ['ITINERARY'],
  default: false,
  selector: 'CHECKBOX',
  label: 'Wheelchair Accessible',
  applicable: function applicable(query, config) {
    if (!query.mode || !config.modes) return false;
    var configModes = (config.modes.accessModes || []).concat(config.modes.transitModes || []);

    var _loop = function _loop(mode) {
      var configMode = configModes.find(function (m) {
        return m.mode === mode;
      });
      if (!configMode || !configMode.showWheelchairSetting) return 'continue';
      if (configMode.company && (!query.companies || !query.companies.split(',').includes(configMode.company))) return 'continue';
      return {
        v: true
      };
    };

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (0, _getIterator3.default)(query.mode.split(',')), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var mode = _step.value;

        var _ret = _loop(mode);

        switch (_ret) {
          case 'continue':
            continue;

          default:
            if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
        }
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
  }
}];
// Iterate over stored settings and update query param defaults.
// FIXME: this does not get updated if the user defaults are cleared
queryParams.forEach(function (param) {
  if (param.name in storedSettings) {
    param.default = storedSettings[param.name];
    param.userDefaultOverride = true;
  }
});

exports.default = queryParams;
module.exports = exports['default'];

//# sourceMappingURL=query-params.js
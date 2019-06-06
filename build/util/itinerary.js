'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transitModes = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

exports.getTransitModes = getTransitModes;
exports.isTransit = isTransit;
exports.hasTransit = hasTransit;
exports.hasCar = hasCar;
exports.hasBike = hasBike;
exports.isWalk = isWalk;
exports.isBicycle = isBicycle;
exports.isBicycleRent = isBicycleRent;
exports.isCar = isCar;
exports.isAccessMode = isAccessMode;
exports.getMapColor = getMapColor;
exports.getStepDirection = getStepDirection;
exports.getStepStreetName = getStepStreetName;
exports.getLegModeString = getLegModeString;
exports.getModeIcon = getModeIcon;
exports.getItineraryBounds = getItineraryBounds;
exports.getLegBounds = getLegBounds;
exports.routeComparator = routeComparator;
exports.legLocationAtDistance = legLocationAtDistance;
exports.legElevationAtDistance = legElevationAtDistance;
exports.getElevationProfile = getElevationProfile;
exports.getTextWidth = getTextWidth;
exports.toSentenceCase = toSentenceCase;
exports.getLegMode = getLegMode;
exports.getPlaceName = getPlaceName;
exports.getTNCLocation = getTNCLocation;
exports.calculatePhysicalActivity = calculatePhysicalActivity;
exports.calculateFares = calculateFares;
exports.getTimeZoneOffset = getTimeZoneOffset;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _leaflet = require('leaflet');

var _polyline = require('@mapbox/polyline');

var _polyline2 = _interopRequireDefault(_polyline);

var _turfAlong = require('turf-along');

var _turfAlong2 = _interopRequireDefault(_turfAlong);

var _modeIcon = require('../components/icons/mode-icon');

var _modeIcon2 = _interopRequireDefault(_modeIcon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// All OTP transit modes
var transitModes = exports.transitModes = ['TRAM', 'BUS', 'SUBWAY', 'FERRY', 'RAIL', 'GONDOLA'];

/**
 * @param  {config} config OTP-RR configuration object
 * @return {Array}  List of all transit modes defined in config; otherwise default mode list
 */

function getTransitModes(config) {
  if (!config || !config.modes || !config.modes.transitModes) return transitModes;
  return config.modes.transitModes.map(function (tm) {
    return tm.mode;
  });
}

function isTransit(mode) {
  return transitModes.includes(mode) || mode === 'TRANSIT';
}

/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes are transit modes
 */
function hasTransit(modesStr) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(modesStr.split(',')), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var mode = _step.value;

      if (isTransit(mode)) return true;
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

  return false;
}

/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes are car-based modes
 */
function hasCar(modesStr) {
  if (modesStr) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = (0, _getIterator3.default)(modesStr.split(',')), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var mode = _step2.value;

        if (isCar(mode)) return true;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }
  return false;
}

/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes are car-based modes
 */
function hasBike(modesStr) {
  if (modesStr) {
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = (0, _getIterator3.default)(modesStr.split(',')), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var mode = _step3.value;

        if (isBicycle(mode) || isBicycleRent(mode)) return true;
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  }
  return false;
}

function isWalk(mode) {
  if (!mode) return false;

  return mode === 'WALK';
}

function isBicycle(mode) {
  if (!mode) return false;

  return mode === 'BICYCLE';
}

function isBicycleRent(mode) {
  if (!mode) return false;

  return mode === 'BICYCLE_RENT';
}

function isCar(mode) {
  if (!mode) return false;
  return mode.startsWith('CAR');
}

function isAccessMode(mode) {
  return isWalk(mode) || isBicycle(mode) || isBicycleRent(mode) || isCar(mode);
}

function getMapColor(mode) {
  mode = mode || this.get('mode');
  if (mode === 'WALK') return '#444';
  if (mode === 'BICYCLE') return '#0073e5';
  if (mode === 'SUBWAY') return '#f00';
  if (mode === 'RAIL') return '#b00';
  if (mode === 'BUS') return '#080';
  if (mode === 'TRAM') return '#800';
  if (mode === 'FERRY') return '#008';
  if (mode === 'CAR') return '#444';
  return '#aaa';
}

// TODO: temporary code; handle via migrated OTP i18n language table
function getStepDirection(step) {
  switch (step.relativeDirection) {
    case 'DEPART':
      return 'Head ' + step.absoluteDirection.toLowerCase();
    case 'LEFT':
      return 'Left';
    case 'HARD_LEFT':
      return 'Hard left';
    case 'SLIGHTLY_LEFT':
      return 'Slight left';
    case 'CONTINUE':
      return 'Continue';
    case 'SLIGHTLY_RIGHT':
      return 'Slight right';
    case 'RIGHT':
      return 'Right';
    case 'HARD_RIGHT':
      return 'Hard right';
    case 'CIRCLE_CLOCKWISE':
      return 'Follow circle clockwise';
    case 'CIRCLE_COUNTERCLOCKWISE':
      return 'Follow circle counterclockwise';
    case 'ELEVATOR':
      return 'Take elevator';
    case 'UTURN_LEFT':
      return 'Left U-turn';
    case 'UTURN_RIGHT':
      return 'Right U-turn';
  }
  return step.relativeDirection;
}

function getStepStreetName(step) {
  if (step.streetName === 'road') return 'Unnamed Road';
  if (step.streetName === 'path') return 'Unnamed Path';
  return step.streetName;
}

function getLegModeString(leg) {
  switch (leg.mode) {
    case 'BICYCLE_RENT':
      return 'Biketown';
    case 'CAR':
      return leg.hailedCar ? 'Ride' : 'Drive';
    case 'GONDOLA':
      return 'Aerial Tram';
    case 'TRAM':
      if (leg.routeLongName.toLowerCase().indexOf('streetcar') !== -1) return 'Streetcar';
      return 'Light Rail';
  }
  return toSentenceCase(leg.mode);
}

function getModeIcon(mode, customIcons) {
  var modeStr = mode.mode || mode;

  // Special handling for company-specific icons
  if (mode.company) {
    modeStr = modeStr + '_' + mode.company.toUpperCase();
  }

  // Check if there is a custom icon for this mode
  if (customIcons && modeStr in customIcons) {
    return customIcons[modeStr];
  }

  // Use default car icon for any car-based modes that didn't have custom icon
  if (modeStr.startsWith('CAR')) modeStr = 'CAR';

  // Otherwise, return the default icon
  return _react2.default.createElement(_modeIcon2.default, { mode: modeStr });
}

function getItineraryBounds(itinerary) {
  var coords = [];
  itinerary.legs.forEach(function (leg) {
    var legCoords = _polyline2.default.toGeoJSON(leg.legGeometry.points).coordinates.map(function (c) {
      return [c[1], c[0]];
    });
    coords = [].concat((0, _toConsumableArray3.default)(coords), (0, _toConsumableArray3.default)(legCoords));
  });
  return (0, _leaflet.latLngBounds)(coords);
}

function getLegBounds(leg) {
  return (0, _leaflet.latLngBounds)(_polyline2.default.toGeoJSON(leg.legGeometry.points).coordinates.map(function (c) {
    return [c[1], c[0]];
  }));
}

function routeComparator(a, b) {
  var aComp = void 0,
      bComp = void 0;
  if (a.sortOrder !== null && b.sortOrder !== null) {
    aComp = a.sortOrder;
    bComp = b.sortOrder;
  } else if (!isNaN(parseInt(a.shortName)) && !isNaN(parseInt(b.shortName))) {
    aComp = parseInt(a.shortName);
    bComp = parseInt(b.shortName);
  } else {
    aComp = a.shortName || a.longName;
    bComp = b.shortName || b.longName;
  }
  if (aComp < bComp) return -1;
  if (aComp > bComp) return 1;
  return 0;
}

/* Returns an interpolated lat-lon at a specified distance along a leg */

function legLocationAtDistance(leg, distance) {
  if (!leg.legGeometry) return null;

  try {
    var line = _polyline2.default.toGeoJSON(leg.legGeometry.points);
    var pt = (0, _turfAlong2.default)(line, distance, 'meters');
    if (pt && pt.geometry && pt.geometry.coordinates) {
      return [pt.geometry.coordinates[1], pt.geometry.coordinates[0]];
    }
  } catch (e) {}

  return null;
}

/* Returns an interpolated elevation at a specified distance along a leg */

function legElevationAtDistance(points, distance) {
  // Iterate through the combined elevation profile
  var traversed = 0;
  // If first point distance is not zero, insert starting point at zero with
  // null elevation. Encountering this value should trigger the warning below.
  if (points[0][0] > 0) {
    points.unshift([0, null]);
  }
  for (var i = 1; i < points.length; i++) {
    var start = points[i - 1];
    var elevDistanceSpan = points[i][0] - start[0];
    if (distance >= traversed && distance <= traversed + elevDistanceSpan) {
      // Distance falls within this point and the previous one;
      // compute & return iterpolated elevation value
      if (start[1] === null) {
        console.warn('Elevation value does not exist for distance.', distance, traversed);
        return null;
      }
      var pct = (distance - traversed) / elevDistanceSpan;
      var elevSpan = points[i][1] - start[1];
      return start[1] + elevSpan * pct;
    }
    traversed += elevDistanceSpan;
  }
  console.warn('Elevation value does not exist for distance.', distance, traversed);
  return null;
}

// Iterate through the steps, building the array of elevation points and
// keeping track of the minimum and maximum elevations reached
function getElevationProfile(steps) {
  var unitConversion = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  var minElev = 100000;
  var maxElev = -100000;
  var traversed = 0;
  var gain = 0;
  var loss = 0;
  var previous = null;
  var points = [];
  steps.forEach(function (step, stepIndex) {
    if (!step.elevation || step.elevation.length === 0) {
      traversed += step.distance;
      return;
    }
    for (var i = 0; i < step.elevation.length; i++) {
      var elev = step.elevation[i];
      if (previous) {
        var diff = (elev.second - previous.second) * unitConversion;
        if (diff > 0) gain += diff;else loss += diff;
      }
      if (i === 0 && elev.first !== 0) {
        // console.warn(`No elevation data available for step ${stepIndex}-${i} at beginning of segment`, elev)
      }
      var convertedElevation = elev.second * unitConversion;
      if (convertedElevation < minElev) minElev = convertedElevation;
      if (convertedElevation > maxElev) maxElev = convertedElevation;
      points.push([traversed + elev.first, elev.second]);
      // Insert "filler" point if the last point in elevation profile does not
      // reach the full distance of the step.
      if (i === step.elevation.length - 1 && elev.first !== step.distance) {
        // points.push([traversed + step.distance, elev.second])
      }
      previous = elev;
    }
    traversed += step.distance;
  });
  return { maxElev: maxElev, minElev: minElev, points: points, traversed: traversed, gain: gain, loss: loss };
}

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {string} text The text to be rendered.
 * @param {string} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
function getTextWidth(text) {
  var font = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '22px Arial';

  // re-use canvas object for better performance
  var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
  var context = canvas.getContext('2d');
  context.font = font;
  var metrics = context.measureText(text);
  return metrics.width;
}

function toSentenceCase(str) {
  if (str == null) {
    return '';
  }
  str = String(str);
  return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
}

// Temporary hack for getting TNC details
// TODO: do we still need this?
function getLegMode(companies, leg) {
  var legMode = leg.mode;
  var isTNC = false;
  if (legMode === 'CAR' && leg.rentedCar) {
    legMode = {
      company: companies,
      mode: 'CAR_RENT'
    };
  } else if (legMode === 'CAR' && companies) {
    legMode = {
      company: companies,
      mode: 'CAR_HAIL'
    };
    isTNC = true;
  } else if (legMode === 'BICYCLE' && leg.rentedBike) {
    legMode = {
      mode: 'BICYCLE_RENT'
    };
  }

  return {
    legMode: legMode,
    isTNC: isTNC
  };
}

function getPlaceName(place) {
  // If address is provided (i.e. for carshare station, use it)
  return place.address ? place.address.split(',')[0] : place.name;
}

function getTNCLocation(leg, type) {
  var location = leg[type];
  return location.lat.toFixed(5) + ',' + location.lon.toFixed(5);
}

function calculatePhysicalActivity(itinerary) {
  var walkDuration = 0;
  var bikeDuration = 0;
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = (0, _getIterator3.default)(itinerary.legs), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var leg = _step4.value;

      if (leg.mode.startsWith('WALK')) walkDuration += leg.duration;
      if (leg.mode.startsWith('BICYCLE')) bikeDuration += leg.duration;
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  var caloriesBurned = walkDuration / 3600 * 280 + bikeDuration / 3600 * 290;
  return {
    bikeDuration: bikeDuration,
    caloriesBurned: caloriesBurned,
    walkDuration: walkDuration
  };
}

function calculateFares(itinerary) {
  var transitFare = 0;
  var symbol = '$'; // default to USD
  var dollarsToString = function dollarsToString(dollars) {
    return '' + symbol + dollars.toFixed(2);
  };
  var centsToString = function centsToString(cents) {
    return '' + symbol + (cents / Math.pow(10, 2)).toFixed(2);
  };
  if (itinerary.fare && itinerary.fare.fare && itinerary.fare.fare.regular) {
    var reg = itinerary.fare.fare.regular;
    symbol = reg.currency.symbol;
    transitFare = reg.cents;
    centsToString = function centsToString(cents) {
      return '' + symbol + (cents / Math.pow(10, reg.currency.defaultFractionDigits)).toFixed(reg.currency.defaultFractionDigits);
    };
    dollarsToString = function dollarsToString(dollars) {
      return '' + symbol + dollars.toFixed(2);
    };
  }

  // Process any TNC fares
  var minTNCFare = 0;
  var maxTNCFare = 0;
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = (0, _getIterator3.default)(itinerary.legs), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var leg = _step5.value;

      if (leg.mode === 'CAR' && leg.hailedCar && leg.tncData) {
        var _leg$tncData = leg.tncData,
            maxCost = _leg$tncData.maxCost,
            minCost = _leg$tncData.minCost;
        // TODO: Support non-USD

        minTNCFare += minCost;
        maxTNCFare += maxCost;
      }
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }

  return {
    centsToString: centsToString,
    dollarsToString: dollarsToString,
    maxTNCFare: maxTNCFare,
    minTNCFare: minTNCFare,
    transitFare: transitFare
  };
}

function getTimeZoneOffset(itinerary) {
  if (!itinerary.legs || !itinerary.legs.length) return 0;

  // Determine if there is a DST offset between now and the itinerary start date
  var dstOffset = new Date(itinerary.startTime).getTimezoneOffset() - new Date().getTimezoneOffset();

  return itinerary.legs[0].agencyTimeZoneOffset + (new Date().getTimezoneOffset() + dstOffset) * 60000;
}

//# sourceMappingURL=itinerary.js
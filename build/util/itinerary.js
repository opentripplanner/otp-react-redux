"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTransitModes = getTransitModes;
exports.isTransit = isTransit;
exports.hasTransit = hasTransit;
exports.hasCar = hasCar;
exports.hasBike = hasBike;
exports.hasMicromobility = hasMicromobility;
exports.hasHail = hasHail;
exports.hasRental = hasRental;
exports.isWalk = isWalk;
exports.isBicycle = isBicycle;
exports.isBicycleRent = isBicycleRent;
exports.isCar = isCar;
exports.isMicromobility = isMicromobility;
exports.isAccessMode = isAccessMode;
exports.getMapColor = getMapColor;
exports.getStepDirection = getStepDirection;
exports.getStepInstructions = getStepInstructions;
exports.getStepStreetName = getStepStreetName;
exports.getLegModeLabel = getLegModeLabel;
exports.getIcon = getIcon;
exports.getItineraryBounds = getItineraryBounds;
exports.getLegBounds = getLegBounds;
exports.routeComparator = routeComparator;
exports.legLocationAtDistance = legLocationAtDistance;
exports.legElevationAtDistance = legElevationAtDistance;
exports.getElevationProfile = getElevationProfile;
exports.getTextWidth = getTextWidth;
exports.toSentenceCase = toSentenceCase;
exports.getLegIcon = getLegIcon;
exports.getCompaniesLabelFromNetworks = getCompaniesLabelFromNetworks;
exports.getModeForPlace = getModeForPlace;
exports.getPlaceName = getPlaceName;
exports.getTNCLocation = getTNCLocation;
exports.calculatePhysicalActivity = calculatePhysicalActivity;
exports.calculateFares = calculateFares;
exports.getTimeZoneOffset = getTimeZoneOffset;
exports.transitModes = void 0;

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.array.find");

require("core-js/modules/es6.string.starts-with");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es7.array.includes");

var _react = _interopRequireDefault(require("react"));

var _leaflet = require("leaflet");

var _polyline = _interopRequireDefault(require("@mapbox/polyline"));

var _turfAlong = _interopRequireDefault(require("turf-along"));

var _modeIcon = _interopRequireDefault(require("../components/icons/mode-icon"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

// All OTP transit modes
var transitModes = ['TRAM', 'BUS', 'SUBWAY', 'FERRY', 'RAIL', 'GONDOLA'];
/**
 * @param  {config} config OTP-RR configuration object
 * @return {Array}  List of all transit modes defined in config; otherwise default mode list
 */

exports.transitModes = transitModes;

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
    for (var _iterator = modesStr.split(',')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var mode = _step.value;
      if (isTransit(mode)) return true;
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
      for (var _iterator2 = modesStr.split(',')[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var mode = _step2.value;
        if (isCar(mode)) return true;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
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
 * @return {boolean} whether any of the modes are bicycle-based modes
 */


function hasBike(modesStr) {
  if (modesStr) {
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = modesStr.split(',')[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var mode = _step3.value;
        if (isBicycle(mode) || isBicycleRent(mode)) return true;
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
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
/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes are micromobility-based modes
 */


function hasMicromobility(modesStr) {
  if (modesStr) {
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = modesStr.split(',')[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var mode = _step4.value;
        if (isMicromobility(mode)) return true;
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  }

  return false;
}
/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes is a hailing mode
 */


function hasHail(modesStr) {
  if (modesStr) {
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = modesStr.split(',')[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var mode = _step5.value;
        if (mode.indexOf('_HAIL') > -1) return true;
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
          _iterator5.return();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }
  }

  return false;
}
/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes is a rental mode
 */


function hasRental(modesStr) {
  if (modesStr) {
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = modesStr.split(',')[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var mode = _step6.value;
        if (mode.indexOf('_RENT') > -1) return true;
      }
    } catch (err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
          _iterator6.return();
        }
      } finally {
        if (_didIteratorError6) {
          throw _iteratorError6;
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

function isMicromobility(mode) {
  if (!mode) return false;
  return mode.startsWith('MICROMOBILITY');
}

function isAccessMode(mode) {
  return isWalk(mode) || isBicycle(mode) || isBicycleRent(mode) || isCar(mode) || isMicromobility(mode);
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
  if (mode === 'MICROMOBILITY') return '#f5a729';
  return '#aaa';
} // TODO: temporary code; handle via migrated OTP i18n language table


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

function getStepInstructions(step) {
  var conjunction = step.relativeDirection === 'ELEVATOR' ? 'to' : 'on';
  return "".concat(getStepDirection(step), " ").concat(conjunction, " ").concat(step.streetName);
}

function getStepStreetName(step) {
  if (step.streetName === 'road') return 'Unnamed Road';
  if (step.streetName === 'path') return 'Unnamed Path';
  return step.streetName;
}

function getLegModeLabel(leg) {
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

    case 'MICROMOBILITY':
      return 'Ride';
  }

  return toSentenceCase(leg.mode);
}
/**
 * Returns a react element of the desired icon. If customIcons are defined, then
 * the icon will be attempted to be used from that lookup of icons. Otherwise,
 * a ModeIcon element will be returned.
 *
 * @param  {string} iconId  A string with the desired icon ID. This icon can
 * include modes or companies or anything that is defined in the customIcons.
 * @param  {[Map<string, React.Element>]} customIcons A customized lookup of
 * icons. These are defined as part of the implementing webapp. If this lookup
 * is not defined, then the ModeIcon class will be used instead.
 * @return {React.Element}
 */


function getIcon(iconId, customIcons) {
  // Check if there is a custom icon
  if (customIcons && iconId in customIcons) {
    return customIcons[iconId];
  } // Custom icon not available for the given iconId. Use the ModeIcon component
  // to show the icon based on the iconId, but always use the default car icon
  // for any car-based modes that didn't have custom icon


  if (iconId && iconId.startsWith('CAR')) iconId = 'CAR';
  return _react.default.createElement(_modeIcon.default, {
    mode: iconId
  });
}

function getItineraryBounds(itinerary) {
  var coords = [];
  itinerary.legs.forEach(function (leg) {
    var legCoords = _polyline.default.toGeoJSON(leg.legGeometry.points).coordinates.map(function (c) {
      return [c[1], c[0]];
    });

    coords = [].concat(_toConsumableArray(coords), _toConsumableArray(legCoords));
  });
  return (0, _leaflet.latLngBounds)(coords);
}

function getLegBounds(leg) {
  return (0, _leaflet.latLngBounds)(_polyline.default.toGeoJSON(leg.legGeometry.points).coordinates.map(function (c) {
    return [c[1], c[0]];
  }));
}

function routeComparator(a, b) {
  var aComp, bComp;

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
    var line = _polyline.default.toGeoJSON(leg.legGeometry.points);

    var pt = (0, _turfAlong.default)(line, distance, 'meters');

    if (pt && pt.geometry && pt.geometry.coordinates) {
      return [pt.geometry.coordinates[1], pt.geometry.coordinates[0]];
    }
  } catch (e) {}

  return null;
}
/* Returns an interpolated elevation at a specified distance along a leg */


function legElevationAtDistance(points, distance) {
  // Iterate through the combined elevation profile
  var traversed = 0; // If first point distance is not zero, insert starting point at zero with
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
} // Iterate through the steps, building the array of elevation points and
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

      if (i === 0 && elev.first !== 0) {// console.warn(`No elevation data available for step ${stepIndex}-${i} at beginning of segment`, elev)
      }

      var convertedElevation = elev.second * unitConversion;
      if (convertedElevation < minElev) minElev = convertedElevation;
      if (convertedElevation > maxElev) maxElev = convertedElevation;
      points.push([traversed + elev.first, elev.second]); // Insert "filler" point if the last point in elevation profile does not
      // reach the full distance of the step.

      if (i === step.elevation.length - 1 && elev.first !== step.distance) {// points.push([traversed + step.distance, elev.second])
      }

      previous = elev;
    }

    traversed += step.distance;
  });
  return {
    maxElev: maxElev,
    minElev: minElev,
    points: points,
    traversed: traversed,
    gain: gain,
    loss: loss
  };
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
/**
 * Return an icon depending on the leg info
 *
 * @param  {Object} leg  The leg data of an itinerary in an OTP trip plan result
 * @param  {[Object]} customIcons If defined for this webapp, the custom icons
 * consist of a lookup table of icons to return for a specific icon ID. These
 * icons typically show either companies or transport modes, but they could show
 * other icons too. See this file in trimet-mod-otp for an example setup:
 * https://github.com/ibi-group/trimet-mod-otp/blob/6a32e2142655c4f4d09a3f349b971b7505e2866a/lib/icons/index.js#L24-L55
 */


function getLegIcon(leg, customIcons) {
  // check if a custom function exists for determining the icon for a leg
  if (customIcons && typeof customIcons.customIconForLeg === 'function') {
    // function exits, get the icon string lookup. It's possible for there to be
    // a custom function that only returns a string for when a leg meets the
    // criteria of the custom function
    var customIconStr = customIcons.customIconForLeg(leg); // the customIconStr could be undefined for this leg, but if it is not, then
    // immediately return this custom icon for the leg

    if (customIconStr) return getIcon(customIconStr, customIcons);
  }

  var iconStr = leg.mode;

  if (iconStr === 'CAR' && leg.rentedCar) {
    iconStr = leg.from.networks[0];
  } else if (iconStr === 'CAR' && leg.tncData) {
    iconStr = leg.tncData.company;
  } else if (iconStr === 'BICYCLE' && leg.rentedBike && leg.from.networks) {
    iconStr = leg.from.networks[0];
  } else if (iconStr === 'MICROMOBILITY' && leg.rentedVehicle && leg.from.networks) {
    iconStr = leg.from.networks[0];
  }

  return getIcon(iconStr, customIcons);
}
/**
 * Get the configured company object for the given network string if the company
 * has been defined in the provided companies array config.
 */


function getCompanyForNetwork(networkString) {
  var companies = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var company = companies.find(function (co) {
    return co.id === networkString;
  });

  if (!company) {
    console.warn("No company found in config.yml that matches rented vehicle network: ".concat(networkString), companies);
  }

  return company;
}
/**
 * Get a string label to display from a list of vehicle rental networks.
 *
 * @param  {Array<string>} networks  A list of network ids.
 * @param  {Array<object>}  [companies=[]] An optional list of the companies config.
 * @return {string}  A label for use in presentation on a website.
 */


function getCompaniesLabelFromNetworks(networks) {
  var companies = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return networks.map(function (network) {
    return getCompanyForNetwork(network, companies);
  }).map(function (co) {
    return co.label;
  }).join('/');
}
/**
 * Returns mode name by checking the vertex type (VertexType class in OTP) for
 * the provided place. NOTE: this is currently only intended for vehicles at
 * the moment (not transit or walking).
 *
 * TODO: I18N
 * @param  {string} place place from itinerary leg
 */


function getModeForPlace(place) {
  switch (place.vertexType) {
    case 'CARSHARE':
      return 'car';

    case 'VEHICLERENTAL':
      return 'eScooter';
    // TODO: Should the type change depending on bike vertex type?

    case 'BIKESHARE':
    case 'BIKEPARK':
      return 'bike';
    // If company offers more than one mode, default to `vehicle` string.

    default:
      return 'vehicle';
  }
}

function getPlaceName(place, companies) {
  // If address is provided (i.e. for carshare station, use it)
  if (place.address) return place.address.split(',')[0];

  if (place.networks && place.vertexType === 'VEHICLERENTAL') {
    // For vehicle rental pick up, do not use the place name. Rather, use
    // company name + vehicle type (e.g., SPIN eScooter). Place name is often just
    // a UUID that has no relevance to the actual vehicle. For bikeshare, however,
    // there are often hubs or bikes that have relevant names to the user.
    var company = getCompanyForNetwork(place.networks[0], companies);

    if (company) {
      return "".concat(company.label, " ").concat(getModeForPlace(place));
    }
  } // Default to place name


  return place.name;
}

function getTNCLocation(leg, type) {
  var location = leg[type];
  return "".concat(location.lat.toFixed(5), ",").concat(location.lon.toFixed(5));
}

function calculatePhysicalActivity(itinerary) {
  var walkDuration = 0;
  var bikeDuration = 0;
  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = itinerary.legs[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var leg = _step7.value;
      if (leg.mode.startsWith('WALK')) walkDuration += leg.duration;
      if (leg.mode.startsWith('BICYCLE')) bikeDuration += leg.duration;
    }
  } catch (err) {
    _didIteratorError7 = true;
    _iteratorError7 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
        _iterator7.return();
      }
    } finally {
      if (_didIteratorError7) {
        throw _iteratorError7;
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
    return "".concat(symbol).concat(dollars.toFixed(2));
  };

  var centsToString = function centsToString(cents) {
    return "".concat(symbol).concat((cents / Math.pow(10, 2)).toFixed(2));
  };

  if (itinerary.fare && itinerary.fare.fare && itinerary.fare.fare.regular) {
    var reg = itinerary.fare.fare.regular;
    symbol = reg.currency.symbol;
    transitFare = reg.cents;

    centsToString = function centsToString(cents) {
      return "".concat(symbol).concat((cents / Math.pow(10, reg.currency.defaultFractionDigits)).toFixed(reg.currency.defaultFractionDigits));
    };

    dollarsToString = function dollarsToString(dollars) {
      return "".concat(symbol).concat(dollars.toFixed(2));
    };
  } // Process any TNC fares


  var minTNCFare = 0;
  var maxTNCFare = 0;
  var _iteratorNormalCompletion8 = true;
  var _didIteratorError8 = false;
  var _iteratorError8 = undefined;

  try {
    for (var _iterator8 = itinerary.legs[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
      var leg = _step8.value;

      if (leg.mode === 'CAR' && leg.hailedCar && leg.tncData) {
        var _leg$tncData = leg.tncData,
            maxCost = _leg$tncData.maxCost,
            minCost = _leg$tncData.minCost; // TODO: Support non-USD

        minTNCFare += minCost;
        maxTNCFare += maxCost;
      }
    }
  } catch (err) {
    _didIteratorError8 = true;
    _iteratorError8 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
        _iterator8.return();
      }
    } finally {
      if (_didIteratorError8) {
        throw _iteratorError8;
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
  if (!itinerary.legs || !itinerary.legs.length) return 0; // Determine if there is a DST offset between now and the itinerary start date

  var dstOffset = new Date(itinerary.startTime).getTimezoneOffset() - new Date().getTimezoneOffset();
  return itinerary.legs[0].agencyTimeZoneOffset + (new Date().getTimezoneOffset() + dstOffset) * 60000;
}

//# sourceMappingURL=itinerary.js
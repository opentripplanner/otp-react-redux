"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.distanceStringImperial = distanceStringImperial;
exports.distanceStringMetric = distanceStringMetric;
exports.distanceString = distanceString;

function distanceStringImperial(meters, abbreviate) {
  var feet = meters * 3.28084;
  if (feet < 528) return Math.round(feet) + (abbreviate === true ? ' ft' : ' feet');
  return Math.round(feet / 528) / 10 + (abbreviate === true ? ' mi' : ' miles');
}

function distanceStringMetric(meters) {
  var km = meters / 1000;

  if (km > 100) {
    // 100 km => 999999999 km
    km = km.toFixed(0);
    return km + ' km';
  } else if (km > 1) {
    // 1.1 km => 99.9 km
    km = km.toFixed(1);
    return km + ' km';
  } else {
    // 1m => 999m
    meters = meters.toFixed(0);
    return meters + ' m';
  }
}

function distanceString(meters) {
  var outputMetricUntis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return outputMetricUntis === true ? distanceStringMetric(meters) : distanceStringImperial(meters);
}

//# sourceMappingURL=distance.js
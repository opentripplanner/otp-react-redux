export function distanceStringImperial (meters) {
  const feet = meters * 3.28084
  if (feet < 528) return Math.round(feet) + ' feet'
  return (Math.round(feet / 528) / 10) + ' miles'
}

export function distanceStringMetric (meters) {
  let km = meters / 1000
  if (km > 100) {
    // 100 km => 999999999 km
    km = km.toFixed(0)
    return km + ' km'
  } else if (km > 1) {
    // 1.1 km => 99.9 km
    km = km.toFixed(1)
    return km + ' km'
  } else {
    // 1m => 999m
    meters = meters.toFixed(0)
    return meters + ' m'
  }
}

export function distanceString (meters, outputMetricUntis = false) {
  return (outputMetricUntis === true) ? distanceStringMetric(meters) : distanceStringImperial(meters)
}

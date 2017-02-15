export function distanceStringImperial (m) {
  let ft = m * 3.28084
  if (ft < 528) return Math.round(ft) + ' feet'
  return Math.round(ft / 528) / 10 + ' miles'
}

export function distanceStringMetric (m) {
  let km = m / 1000
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
    m = m.toFixed(0)
    return m + ' m'
  }
}

export function distanceString (m, metric = false) {
  return (metric === true) ? distanceStringMetric(m) : distanceStringImperial(m)
}

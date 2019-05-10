import * as pelias from './geocoders/pelias'

function getGeocoder (gcConfig) {
  return pelias
}

export function reverse (point, gcConfig) {
  return getGeocoder(gcConfig).reverse(point, gcConfig)
}

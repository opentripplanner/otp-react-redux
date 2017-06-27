export function latlngToString (latlng) {
  return latlng && `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`
}

export function coordsToString (coords) {
  return coords.length && coords.map(c => (+c).toFixed(5)).join(', ')
}

export function constructLocation (latlng) {
  return {
    name: latlngToString(latlng),
    lat: latlng.lat,
    lon: latlng.lng
  }
}

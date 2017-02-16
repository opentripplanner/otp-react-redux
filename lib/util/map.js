import {latLngBounds} from 'leaflet'
import polyline from '@mapbox/polyline'

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

export function getItineraryBounds (itinerary) {
  if (!itinerary) {
    return null
  }
  let coords = []
  itinerary.legs.forEach(leg => {
    const legCoords = polyline.toGeoJSON(leg.legGeometry.points).coordinates.map(c => [c[1], c[0]])
    coords = [
      ...coords,
      ...legCoords
    ]
  })
  return latLngBounds(coords)
  // this.refs.map && this.refs.map.leafletElement.fitBounds(latLngBounds(coords), {padding: [3, 3]})
}

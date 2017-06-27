// TODO: add reverse geocode for map click
// export async function reversePelias (point) {
//   const location = {lon: point.lng, lat: point.lat}
//   const apiKey = getConfigProperty('MAPZEN_TURN_BY_TURN_KEY')
//   const params = {
//     api_key: apiKey,
//     ...location
//   }
//   const url = `https://search.mapzen.com/v1/reverse?${qs.stringify(params)}`
//   const response = await fetch(url)
//   return await response.json()
// }

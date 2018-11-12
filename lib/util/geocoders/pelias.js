import { reverse as peliasReverse } from 'isomorphic-mapzen-search'

export function reverse (point, gcConfig) {
  const {MAPZEN_KEY, baseUrl} = gcConfig

  return new Promise((resolve, reject) => {
    peliasReverse({
      apiKey: MAPZEN_KEY,
      point,
      format: true,
      url: baseUrl ? `${baseUrl}/reverse` : null
    }).then((json) => {
      resolve({
        lat: point.lat,
        lon: point.lon,
        name: json[0].address
      })
    }).catch((err) => {
      reject(err)
    })
  })
}

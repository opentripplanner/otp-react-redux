/* eslint-disable complexity */
// Process each step in this leg
export function compressStreetName(name: string): string {
  return name
    .split(' ')
    .map((str) => {
      if (str === 'Northwest') return 'NW'
      if (str === 'Northeast') return 'NE'
      if (str === 'Southwest') return 'SW'
      if (str === 'Southeast') return 'SE'
      if (str === 'North') return 'N'
      if (str === 'East') return 'E'
      if (str === 'South') return 'S'
      if (str === 'West') return 'W'
      if (str === 'Street') return 'St'
      if (str === 'Avenue') return 'Ave'
      if (str === 'Road') return 'Rd'
      if (str === 'Drive') return 'Dr'
      if (str === 'Boulevard') return 'Blvd'
      return str
    })
    .join(' ')
}

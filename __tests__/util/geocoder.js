import nock from 'nock'

import getGeocoder from '../../lib/util/geocoder'

function mockResponsePath (geocoder, file) {
  return `__tests__/test-utils/fixtures/geocoding/${geocoder}/${file}`
}

describe('geocoder', () => {
  const geocoders = [
    {
      apiKey: 'dummy-mapzen-key',
      baseUrl: 'https://ws-st.trimet.org/pelias/v1',
      type: 'PELIAS'
    }, {
      type: 'ARCGIS'
    }
  ]

  // nocks for ARCGIS
  const baseArcGisPath = '/arcgis/rest/services/World/GeocodeServer/'
  nock('https://geocode.arcgis.com')
    // autocomplete
    .get(`${baseArcGisPath}suggest`)
    .query(true)
    .replyWithFile(200, mockResponsePath('arcgis', 'suggest-response.json'))
    // reverse
    .get(`${baseArcGisPath}reverseGeocode`)
    .query(true)
    .replyWithFile(200, mockResponsePath('arcgis', 'reverseGeocode-response.json'))
    // search
    .get(`${baseArcGisPath}findAddressCandidates`)
    .query(true)
    .replyWithFile(200, mockResponsePath('arcgis', 'findAddressCandidates-response.json'))
    // a 2nd search for purposes of resolving getLocationFromGeocodedFeature test
    .get(`${baseArcGisPath}findAddressCandidates`)
    .query(true)
    .replyWithFile(200, mockResponsePath('arcgis', 'findAddressCandidates-response.json'))

  // nocks for PELIAS
  const basePeliasPath = '/pelias/v1/'
  nock('https://ws-st.trimet.org')
    // autocomplete
    .get(`${basePeliasPath}autocomplete`)
    .query(true)
    .replyWithFile(200, mockResponsePath('pelias', 'autocomplete-response.json'))
    // reverse
    .get(`${basePeliasPath}search`)
    .query(true)
    .replyWithFile(200, mockResponsePath('pelias', 'search-response.json'))
    // search
    .get(`${basePeliasPath}reverse`)
    .query(true)
    .replyWithFile(200, mockResponsePath('pelias', 'reverse-response.json'))

  geocoders.forEach(geocoder => {
    // the describe is in quotes to bypass a lint rule
    describe(`${geocoder.type}`, () => {
      it('should make autocomplete query', async () => {
        const result = await getGeocoder(geocoder).autocomplete({ text: 'Mill Ends' })
        expect(result).toMatchSnapshot()
      })

      it('should make search query', async () => {
        const result = await getGeocoder(geocoder).search({ text: 'Mill Ends' })
        expect(result).toMatchSnapshot()
      })

      it('should make reverse query', async () => {
        const result = await getGeocoder(geocoder)
          .reverse({ point: { lat: 45.516198, lon: -122.673240 } })
        expect(result).toMatchSnapshot()
      })

      it('should get location from geocode feature', async () => {
        let mockFeature
        switch (geocoder.type) {
          case 'ARCGIS':
            mockFeature = {
              magicKey: 'abcd',
              properties: {
                label: 'Mill Ends City Park, Portland, OR, USA'
              },
              text: 'Mill Ends City Park, Portland, OR, USA'
            }
            break
          case 'PELIAS':
            mockFeature = {
              geometry: {
                coordinates: [-122.673240, 45.516198],
                type: 'Point'
              },
              properties: {
                label: 'Mill Ends Park, Portland, OR, USA'
              }
            }
            break
          default:
            throw new Error(`no mock feature defined for geocoder type: ${geocoder.type}`)
        }
        const result = await getGeocoder(geocoder).getLocationFromGeocodedFeature(mockFeature)
        expect(result).toMatchSnapshot()
      })
    })
  })
})

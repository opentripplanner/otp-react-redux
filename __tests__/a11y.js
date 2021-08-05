import path from 'path'

import puppeteer from 'puppeteer'

test('checks the test page with Axe', async () => {
  jest.setTimeout(600000)
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(`file://${path.resolve(__dirname, '../index-for-puppeteer.html')}#/?ui_activeSearch=0qoydlnut&ui_activeItinerary=0&fromPlace=1900%20Main%20Street%2C%20Houston%2C%20TX%2C%20USA%3A%3A29.750144%2C-95.370998&toPlace=800%20Congress%2C%20Houston%2C%20TX%2C%20USA%3A%3A29.76263%2C-95.362178&date=2021-08-04&time=08%3A14&arriveBy=false&mode=WALK%2CBUS%2CTRAM&showIntermediateStops=true&maxWalkDistance=1207&optimize=QUICK&walkSpeed=1.34&ignoreRealtimeUpdates=true&numItineraries=3&otherThanPreferredRoutesPenalty=900`)

  // These rules aren't relevant to this project
  await expect(page).toPassAxeTests({
    disabledRules: [
      'region', // Leaflet does not comply
      'meta-viewport', // Leaflet does not comply
      'page-has-heading-one' // Heading is provided by logo
    ]
  })
})

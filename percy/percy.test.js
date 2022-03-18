/* eslint-disable jest/expect-expect */
/* We use a method to generate our assertions */

import execa from 'execa'
import puppeteer from 'puppeteer'

const percySnapshot = require('@percy/puppeteer')

const OTP_RR_TEST_CONFIG_PATH = '../percy/har-mock-config.yml'
const OTP_RR_TEST_JS_CONFIG_PATH = './percy/har-mock-config.js'

const MOCK_SERVER_PORT = 5000

// Puppeteer can take a long time to load, espeically in some ci environments
jest.setTimeout(600000)

// How long to wait for each page to fully render before taking a screenshot
const PERCY_EXTRA_WAIT = 5000
const percySnapshotWithWait = async (page, name, enableJavaScript) => {
  await page.waitForTimeout(PERCY_EXTRA_WAIT)

  const namePrefix = process.env.PERCY_OTP_CONFIG_OVERRIDE || 'Mock OTP1 Server'
  await percySnapshot(page, `${namePrefix} - ${name}`, { enableJavaScript })
}

let browser
const serveAbortController = new AbortController()
const harAbortController = new AbortController()

/**
 * Loads a path
 */
async function loadPath(otpPath) {
  const page = await browser.newPage()
  const filePath = `http://localhost:${MOCK_SERVER_PORT}/#${otpPath}`
  await Promise.all([
    page.goto(filePath),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ])

  return page
}

beforeAll(async () => {
  try {
    // Build OTP-RR main.js using new config file
    await execa('env', [
      `YAML_CONFIG=${
        process.env.PERCY_OTP_CONFIG_OVERRIDE || OTP_RR_TEST_CONFIG_PATH
      }`,
      `JS_CONFIG=${OTP_RR_TEST_JS_CONFIG_PATH}`,
      'yarn',
      'build'
    ])

    // grab ATL har file to tmp
    if (process.env.HAR_URL) {
      await execa('curl', [process.env.HAR_URL, '-s', '--output', 'mock.har'])
    }
  } catch (error) {
    console.log(error)
  }
  console.log('Built OTP-RR and downloaded HAR data')

  try {
    execa('yarn', ['percy-serve', 'dist', '-p', MOCK_SERVER_PORT], {
      signal: serveAbortController.signal
    }).stdout.pipe(process.stdout)

    // Launch mock OTP server
    if (process.env.HAR_URL) {
      execa('yarn', ['percy-har-express', '-p', '9999', 'mock.har'], {
        signal: harAbortController.signal
      }).stdout.pipe(process.stdout)
    }

    // Web security is disabled to allow requests to the mock OTP server
    browser = await puppeteer.launch({
      args: ['--disable-web-security']
      // headless: false
    })

    // Fix time
    browser.on('targetchanged', async (target) => {
      const targetPage = await target.page()
      const client = await targetPage.target().createCDPSession()
      await client.send('Runtime.evaluate', {
        expression:
          'Date.now = function() { return 1646835742000; };Date.getTime = function() { return 1646835742000; }'
      })
    })
  } catch (error) {
    console.log(error)
  }

  // Give servers time to start up
  await execa('sleep', ['5'])
})

afterAll(async () => {
  try {
    serveAbortController.abort()
    harAbortController.abort()
    await browser.close()
  } catch (error) {
    console.log(error)
  }
  console.log('Closed mock server and headless browser')
})

// Puppeteer can take a long time to load, espeically in some ci environments
jest.setTimeout(600000)

/* These fixed routes allow us to test features that the static html screenshots
 * don't allow us to test. Unfortuantley, they don't currently work
 *
 * TODO
 */
// eslint-disable-next-line jest/no-commented-out-tests
/*
test('OTP-RR Fixed Routes', async () => {
  const transitive = await loadPath(
    '/?ui_activeSearch=5rzujqghc&ui_activeItinerary=0&fromPlace=Opus Music Store%2C Decatur%2C GA%3A%3A33.77505%2C-84.300178&toPlace=Five Points Station (MARTA Stop ID 908981)%3A%3A33.753837%2C-84.391397&date=2022-03-09&time=09%3A58&arriveBy=false&mode=WALK%2CBUS%2CSUBWAY%2CTRAM%2CFLEX_EGRESS%2CFLEX_ACCESS%2CFLEX_DIRECT&showIntermediateStops=true&maxWalkDistance=1207&optimize=QUICK&walkSpeed=1.34&ignoreRealtimeUpdates=true&wheelchair=false&numItineraries=3&otherThanPreferredRoutesPenalty=900'
  )
  await percySnapshotWithWait(transitive, 'Itinerary (with transitive)', true)

  const routes = await loadPath('/route')
  await percySnapshotWithWait(routes, 'Route Viewer (with transitive)', true)
})
*/

test('OTP-RR', async () => {
  const page = await loadPath('/')
  await page.setViewport({
    height: 1080,
    width: 1920
  })

  await percySnapshotWithWait(page, 'Main Page (without styling)')

  // Plan a trip
  await page.goto(
    `http://localhost:${MOCK_SERVER_PORT}/#/?ui_activeSearch=5rzujqghc&ui_activeItinerary=0&fromPlace=Opus Music Store%2C Decatur%2C GA%3A%3A33.77505%2C-84.300178&toPlace=Five Points Station (MARTA Stop ID 908981)%3A%3A33.753837%2C-84.391397&date=2022-03-09&time=09%3A58&arriveBy=false&mode=WALK%2CBUS%2CSUBWAY%2CTRAM%2CFLEX_EGRESS%2CFLEX_ACCESS%2CFLEX_DIRECT&showIntermediateStops=true&maxWalkDistance=1207&optimize=QUICK&walkSpeed=1.34&ignoreRealtimeUpdates=true&wheelchair=false&numItineraries=3&otherThanPreferredRoutesPenalty=900`
  )
  await page.waitForNavigation({ waitUntil: 'networkidle2' })
  await page.waitForSelector('.title')

  await percySnapshotWithWait(page, 'Batch Itinerary')

  // Select a trip
  await page.waitForSelector('.title:nth-of-type(1)')
  await page.click('.title:nth-of-type(1)')

  await percySnapshotWithWait(page, 'Batch Itinerary Selected')

  // Open Trip Viewer
  await page.waitForTimeout(2000)
  const [tripViewerButton] = await page.$x(
    "//button[contains(., 'Trip Viewer')]"
  )
  await tripViewerButton.click()
  await page.waitForSelector('div.trip-viewer-body')
  await page.waitForTimeout(1000)
  await percySnapshotWithWait(page, 'Trip Viewer')

  // Open stop viewer from trip viewer
  await page.click(
    'div.trip-viewer-body > div:nth-child(3) > div.stop-button-container > button'
  )
  await page.waitForSelector('.stop-viewer')

  await percySnapshotWithWait(page, 'Stop Viewer')

  // Open schedule view
  await page.waitForSelector('button.link-button.pull-right')
  await page.click('button.link-button.pull-right')
  await page.waitForTimeout(3000) // Slow animation
  await percySnapshotWithWait(page, 'Schedule Viewer')

  // Open route viewer
  const [routeViewerButton] = await page.$x(
    "//button[contains(., 'View Routes')]"
  )
  await routeViewerButton.click()
  await page.waitForSelector('.route-viewer')
  await page.waitForTimeout(5000)

  await percySnapshotWithWait(page, 'Route Viewer')

  // Open Specific Route`
  const [busRouteButton] = await page.$x(
    "//span[contains(., 'Sugarloaf Mills - Lindbergh Center')]"
  )
  await busRouteButton.click()
  await page.waitForSelector('#headsign-selector')

  await percySnapshotWithWait(page, 'Route Viewer Showing Route 410')

  // View multiple patterns
  // Click second option
  const sugarloafOption = await page.$$eval(
    'option',
    (options) => options.find((o) => o.innerText.includes('Sugarloaf'))?.value
  )
  await page.select('select#headsign-selector', sugarloafOption)

  await page.waitForSelector('#headsign-selector-label')
  await page.waitForTimeout(1000)

  // Click first option
  const lindberghOption = await page.$$eval(
    'option',
    (options) => options.find((o) => o.innerText.includes('Lindbergh'))?.value
  )
  await page.select('select#headsign-selector', lindberghOption)
  await page.waitForTimeout(1000)

  await percySnapshotWithWait(page, 'Pattern Viewer Showing Route 410')

  // Stop viewer from pattern viewer
  const [patternStopButton] = await page.$x(
    "//a[contains(., 'Sugarloaf Mills GCT Park and Ride')]"
  )
  await patternStopButton.click()
  await page.waitForSelector('.stop-viewer')

  // Activate all layers
  await page.$$eval('.leaflet-control-layers-selector', (checks) =>
    checks.forEach((c) => c.click())
  )
  await page.waitForTimeout(1000)

  // Go back to trip planner
  const [tripPlannerButton] = await page.$x(
    "//button[contains(., 'Plan Trip')]"
  )
  await tripPlannerButton.click()
  await page.waitForSelector('.batch-routing-panel')
  await page.waitForTimeout(3000)
  const [viewAllOptionsButton] = await page.$x(
    "//button[contains(., 'View all options')]"
  )
  await viewAllOptionsButton.click()
  await page.waitForTimeout(1000)

  await percySnapshotWithWait(page, 'Batch Itinerary Showing Bikes')
})

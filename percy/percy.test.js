// Percy screenshot is not an assertion, but that's ok
/* eslint-disable jest/expect-expect */
import execa from 'execa'
import puppeteer from 'puppeteer'

const percySnapshot = require('@percy/puppeteer')

const OTP_RR_TEST_CONFIG_PATH = '../percy/har-mock-config.yml'
const { OTP_RR_PERCY_CALL_TAKER, OTP_RR_PERCY_MOBILE } = process.env
const OTP_RR_TEST_JS_CONFIG_PATH = OTP_RR_PERCY_CALL_TAKER
  ? './percy/har-mock-config-call-taker.js'
  : './percy/har-mock-config.js'

const MOCK_SERVER_PORT = 5000

// Puppeteer can take a long time to load, especially in some ci environments
jest.setTimeout(600000)

// How long to wait for each page to fully render before taking a screenshot
const PERCY_EXTRA_WAIT = 5000
const percySnapshotWithWait = async (page, name, enableJavaScript) => {
  await page.waitForTimeout(PERCY_EXTRA_WAIT)

  const namePrefix = process.env.PERCY_OTP_CONFIG_OVERRIDE || 'Mock OTP1 Server'
  await percySnapshot(
    page,
    `${OTP_RR_PERCY_CALL_TAKER ? 'Call Taker - ' : ''}${namePrefix} - ${name}`,
    { enableJavaScript }
  )
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
    console.log('Built OTP-RR')

    // grab ATL har file to tmp
    if (process.env.HAR_URL) {
      await execa('curl', [process.env.HAR_URL, '-s', '--output', 'mock.har'])
      console.log('Downloaded HAR data')
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
      // ,headless: false
    })

    // Fix time to Monday, March 14, 2022 14:22:22 GMT (10:22:22 AM EDT).
    browser.on('targetchanged', async (target) => {
      const targetPage = await target.page()
      const client = await targetPage.target().createCDPSession()
      await client.send('Runtime.evaluate', {
        expression:
          'Date.now = function() { return 1647267742000; }; Date.getTime = function() { return 1647267742000; }'
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
 * don't allow us to test. This is disabled, as percy doesn't support transitive.js
 * out of the box, even with javascript enabled.
 *
 * TODO: make transitive.js work with Percy, then complete this test suite
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

if (OTP_RR_PERCY_MOBILE) {
  test('OTP-RR Mobile', async () => {
    const page = await loadPath('/')
    await page.setUserAgent('android')
    await page.setViewport({
      height: 1134,
      width: 750
    })
    // Need to reload to load mobile view properly
    await page.reload()

    await percySnapshotWithWait(page, 'Mobile Main Page')

    await page.click('.app-menu-icon')
    // Wait for animation
    await page.waitForTimeout(200)
    await percySnapshotWithWait(page, 'Mobile Sidebar')

    await page.click('.app-menu-route-viewer-link')
    await page.waitForSelector('.route-viewer')
    await page.waitForTimeout(5000)

    // Open Specific Route`
    try {
      await page.$x("//span[contains(., 'Green')]")
    } catch {
      await page.reload({ waitUntil: 'networkidle0' })
    }
    const [subwayRouteButton] = await page.$x("//span[contains(., 'Green')]")
    await subwayRouteButton.click()
    await page.waitForSelector('#headsign-selector')
    const secondPatternOption = await page.$$eval(
      'option',
      (options) => options.find((o) => o.innerText.includes('Vine City'))?.value
    )
    await page.select('select#headsign-selector', secondPatternOption)

    await page.waitForSelector('#headsign-selector-label')
    await page.waitForTimeout(1000)

    await percySnapshotWithWait(page, 'Mobile Route Viewer Showing Green Line')

    // Open stop viewer
    const [patternStopButton] = await page.$x(
      "//a[contains(., 'Ashby Station')]"
    )
    await patternStopButton.click()
    await page.waitForSelector('.stop-viewer')
    // Screenshot here?

    // Return to main page
    await page.click('.mobile-back')
    await page.waitForSelector('.welcome-location')
    await page.click('.welcome-location div span input')
    await page.waitForSelector('.to-form-control')

    await page.focus('.to-form-control')
    await page.keyboard.type('ashby')
    await page.waitForTimeout(2000)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(200)
    await page.keyboard.press('Enter')

    // Wait for page to load
    await page.waitForTimeout(300)

    await page.click('.from-form-control')
    // Wait for page to load
    await page.waitForTimeout(300)

    await page.focus('.from-form-control')
    await page.keyboard.type('amazon ATL5')
    await page.waitForTimeout(2000)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(200)
    await page.keyboard.press('Enter')

    await page.waitForTimeout(300)
    await page.click('.switch-button')

    await page.waitForSelector('.route-block-wrapper')
    await percySnapshotWithWait(page, 'Mobile Itinerary Results')

    await page.click('.route-block-wrapper')
    await percySnapshotWithWait(page, 'Mobile Itinerary Selected')

    await page.click('.button-container:nth-of-type(2)')
    await page.waitForTimeout(500)
    await percySnapshotWithWait(page, 'Mobile Printable Itinerary')
  })
}

test('OTP-RR', async () => {
  const page = await loadPath('/')
  await page.setViewport({
    height: 1080,
    width: 1920
  })

  await percySnapshotWithWait(page, 'Main Page (without styling)')

  // Plan a trip
  await page.goto(
    `http://localhost:${MOCK_SERVER_PORT}/#/?ui_activeSearch=5rzujqghc&ui_activeItinerary=0&fromPlace=Opus Music Store%2C Decatur%2C GA%3A%3A33.77505%2C-84.300178&toPlace=Five Points Station (MARTA Stop ID 908981)%3A%3A33.753837%2C-84.391397&date=2022-12-12&time=09%3A58&arriveBy=false&mode=WALK%2CBUS%2CSUBWAY%2CTRAM%2CFLEX_EGRESS%2CFLEX_ACCESS%2CFLEX_DIRECT&showIntermediateStops=true&maxWalkDistance=1207&optimize=QUICK&walkSpeed=1.34&ignoreRealtimeUpdates=true&wheelchair=true&numItineraries=3&otherThanPreferredRoutesPenalty=900`
  )
  await page.waitForNavigation({ waitUntil: 'networkidle2' })
  await page.waitForSelector('.option.metro-itin')

  if (!OTP_RR_PERCY_CALL_TAKER) {
    // Change the modes
    await page.click('.visible-lg.straight-corners:first-of-type')
    await page.click('#plan-trip')

    await percySnapshotWithWait(page, 'Metro Itinerary No Transit')
    // Restore transit
    await page.click('.visible-lg.straight-corners:first-of-type')

    // Change the time
    await page.click('.summary')
    await page.focus('input[type="time"]')
    await page.keyboard.type('10')
    await page.waitForTimeout(200)
    await page.click('#plan-trip')
  } else {
    // take initial screenshot
    await percySnapshotWithWait(page, 'Call Taker')

    // add intermedaite stop
    await page.click(
      '#main > div > div > div > div.sidebar.col-md-4.col-sm-6 > main > div > div.form > button'
    )
    await page.waitForSelector('.intermediate-place-0-form-control')
    await page.focus('.intermediate-place-0-form-control')
    await page.keyboard.type('arts center')
    await page.waitForTimeout(2000)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(200)
    await page.keyboard.press('Enter')

    await page.click('.search-plan-button-container button')
    await page.waitForTimeout(2000)

    // take screenshot
    await percySnapshotWithWait(page, 'Call Taker With Settings Adjusted')
  }

  // Select a trip
  await page.waitForSelector('.option.metro-itin:nth-of-type(1)')
  await page.click('.option.metro-itin:nth-of-type(1)')

  await percySnapshotWithWait(page, 'Metro Itinerary Selected')

  // Open Trip Viewer
  await page.waitForTimeout(2000)
  const [tripViewerButton] = await page.$x(
    "//button[contains(., 'Trip Viewer')]"
  )

  // If the trip viewer button didn't appear, perhaps we need to click the itinerary again
  if (!tripViewerButton) {
    await page.click('.option.metro-itin:nth-of-type(1)')
    await page.waitForTimeout(2000)
  }

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
  // TODO: is the schedule date wrong?

  // Open route viewer
  const [routeViewerButton] = await page.$x(
    "//button[contains(., 'View Routes')]"
  )
  await routeViewerButton.click()
  await page.waitForSelector('.route-viewer')
  await page.waitForTimeout(5000)

  await percySnapshotWithWait(page, 'Route Viewer')

  // Open Specific Route`
  try {
    await page.$x("//span[contains(., 'Sugarloaf Mills - Lindbergh Center')]")
  } catch {
    await page.reload({ waitUntil: 'networkidle0' })
  }
  const [busRouteButton] = await page.$x(
    "//span[contains(., 'Sugarloaf Mills - Lindbergh Center')]"
  )
  await busRouteButton.click()
  await page.waitForSelector('#headsign-selector')

  await percySnapshotWithWait(page, 'Route Viewer Showing Route 410')

  // View multiple patterns
  // Click second option
  const secondPatternOption = await page.$$eval(
    'option',
    (options) => options.find((o) => o.innerText.includes('Sugarloaf'))?.value
  )
  await page.select('select#headsign-selector', secondPatternOption)

  await page.waitForSelector('#headsign-selector-label')
  await page.waitForTimeout(1000)

  // Click first option
  const firstPatternOption = await page.$$eval(
    'option',
    (options) => options.find((o) => o.innerText.includes('Lindbergh'))?.value
  )
  await page.select('select#headsign-selector', firstPatternOption)
  await page.waitForTimeout(1000)

  await percySnapshotWithWait(page, 'Pattern Viewer Showing Route 410')

  // Stop viewer from pattern viewer
  try {
    await page.$x("//a[contains(., 'Sugarloaf Mills GCT Park and Ride')]")
  } catch {
    await page.reload({ waitUntil: 'networkidle0' })
  }
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
  await page.waitForSelector('.option')
  await page.waitForTimeout(3000)
  const [viewAllOptionsButton] = await page.$x(
    "//button[contains(., 'View all options')]"
  )
  await viewAllOptionsButton.click()
  await page.waitForTimeout(1000)

  // Need to explicitly select the first itinerary to reset map position
  await page.goto(`${page.url()}&ui_activeItinerary=1`)
  await page.waitForTimeout(2000)

  await percySnapshotWithWait(
    page,
    'Batch Itinerary With Transit Showing Bikes'
  )
})

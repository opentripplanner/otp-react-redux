// Percy screenshot is not an assertion, but that's ok
/* eslint-disable jest/expect-expect */
import execa from 'execa'
import puppeteer from 'puppeteer'

const percySnapshot = require('@percy/puppeteer')

const OTP_RR_UI_MODE = process.env.OTP_RR_UI_MODE || 'normal'

const MOCK_SERVER_PORT = 5486

// Puppeteer can take a long time to load, especially in some ci environments
jest.setTimeout(600000)

// How long to wait for each page to fully render before taking a screenshot
const PERCY_EXTRA_WAIT = 5000
const percySnapshotWithWait = async (page, name, enableJavaScript) => {
  await page.waitForTimeout(PERCY_EXTRA_WAIT)
  await percySnapshot(
    page,
    `${name} [${OTP_RR_UI_MODE}${page.isMobile ? '/mobile' : ''}]`,
    { enableJavaScript }
  )
}

let browser
const serveAbortController = new AbortController()
const harAbortController = new AbortController()
const geocoderAbortController = new AbortController()

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
    // Launch OTP-RR web server
    execa('yarn', ['percy-serve', 'dist', '-p', MOCK_SERVER_PORT], {
      signal: serveAbortController.signal
    }).stdout.pipe(process.stdout)

    // Launch mock OTP server
    execa('yarn', ['percy-combined-mock-server'], {
      env: { HAR: './percy/mock.har', PORT: '9999' },
      signal: harAbortController.signal
    }).stdout.pipe(process.stdout)

    // Launch mock geocoder server
    execa(
      'yarn',
      [
        'percy-har-express',
        `percy/geocoder-mock-${OTP_RR_UI_MODE}.har`,
        '-p',
        '9977'
      ],
      {
        signal: geocoderAbortController.signal
      }
    ).stdout.pipe(process.stdout)

    // Web security is disabled to allow requests to the mock OTP server
    browser = await puppeteer.launch({
      args: ['--disable-web-security']
      //, headless: false
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
    geocoderAbortController.abort()
    await browser.close()
  } catch (error) {
    console.log(error)
  }
  console.log('Closed mock server and headless browser')
})

// Puppeteer can take a long time to load, especially in some ci environments
jest.setTimeout(600000)

async function executeTest(page, isMobile, isCallTaker) {
  // Make sure that the main UI (incl. map controls) has loaded.
  await page.waitForSelector('.maplibregl-ctrl-zoom-in')

  // Load itinerary from URL
  // Triggers mock.har graphql query #1 and #2 (bike-only query, twice).
  // FIXME: Opening a url with non-default mode params triggers the plan query twice.
  await page.goto(
    `http://localhost:${MOCK_SERVER_PORT}/#/?ui_activeSearch=fg33svlbf&ui_activeItinerary=-1&fromPlace=South%20Prado%20Northeast%2C%20Atlanta%2C%20GA%2C%20USA%3A%3A33.78946214120528%2C-84.37663414886111&toPlace=1%20Copenhill%20Avenue%20NE%2C%20Atlanta%2C%20GA%2C%20USA%3A%3A33.767060728439574%2C-84.35749390533111&date=2023-08-09&time=17%3A56&arriveBy=false&mode=BICYCLE&showIntermediateStops=true&walkSpeed=1.34&ignoreRealtimeUpdates=true&numItineraries=3&otherThanPreferredRoutesPenalty=900&modeButtons=walk_bike`
  )
  // FIXME: Network idle condition seems never met after navigating to above link.
  // await page.waitForNavigation({ waitUntil: 'networkidle2' })
  await page.waitForTimeout(4000)
  await page.waitForSelector('.option.metro-itin')

  if (!isCallTaker) {
    // Edit trip params [mobile-specific]
    if (isMobile) {
      await page.click('button.edit-search-button')
    }

    // Change the modes: Activate Transit and remove Bike.
    await page.click('label[title="Transit"]')
    await page.waitForTimeout(200)

    await page.click('label[title="Bike"]')
    await page.waitForTimeout(200)
    // Change the date
    await page.hover('#date-time-button')
    await page.waitForTimeout(200)
    await page.focus('input[type="date"]')
    // FIXME: Puppeteer only: On Wednesday 08/09/2023, Monday 08/07/2023 was shown as "Last Sunday"!...
    await page.keyboard.type('08072023') // MMDDYYYY format.
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // Check submode selector (this will have no effect on mock query)
    await page.hover('label[title="Transit"]')
    await page.waitForTimeout(500)
    await page.click('#id-query-param-tram')

    // Enable accessible routing (this will have no effect on mock query)
    await page.hover('label[title="Transit"]')
    await page.waitForTimeout(500)
    await page.click('#id-query-param-wheelchair')

    // Delete both origin and destination

    await page.click('.from-form-control')
    await page.waitForTimeout(300)
    // Click the clear button next to it
    await page.click('.from-form-control + button')
    if (isMobile) {
      await page.click('.mobile-back')
    }

    await page.click('.to-form-control')
    await page.waitForTimeout(300)
    // Click the clear button next to it
    await page.click('.to-form-control + button')
    if (isMobile) {
      await page.click('.mobile-back')
    }

    // Fill in new origin
    await page.hover('.from-form-control')
    await page.focus('.from-form-control')
    // FIXME: Characters are typed very fast, but each stroke still triggers a geocoder call.
    await page.keyboard.type('Opus Music', { delay: 100 })
    await page.waitForTimeout(2000)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(200)
    await page.keyboard.press('Enter')

    // Fill in new destination
    await page.focus('.to-form-control')
    // FIXME: Characters are typed very fast, but each stroke still triggers a geocoder call.
    await page.keyboard.type('908981', { delay: 100 })
    await page.waitForTimeout(2000)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(200)
    await page.keyboard.press('Enter')

    // On desktop, the last action will trigger a replan.
    // On mobile, we need to click explicitly.
    // Triggers mock.har graphql query #3 and #4 (transit and walk-alone queries).
    if (isMobile) {
      await page.click('#plan-trip')
    }
    await page.waitForTimeout(1000) // wait extra time for all results to load

    if (!isMobile) {
      await page.hover('label[title="Transit"]')
      await page.waitForTimeout(200)
      await percySnapshotWithWait(
        page,
        'Metro Transit-Walk Itinerary Desktop with Mode Selector Expanded'
      )
      // Hover something else to unhover the mode selector.
      await page.hover('#plan-trip')
    } else {
      await percySnapshotWithWait(page, 'Metro Transit-Walk Itinerary Mobile')
    }
  } else {
    await page.waitForTimeout(1000) // wait extra time for all results to load

    // add intermediate stop
    await page.click(
      '#main > div > div > div > div.sidebar.col-md-4.col-sm-6 > main > div > div.form > button'
    )
    await page.waitForSelector('.intermediate-place-0-form-control')
    await page.focus('.intermediate-place-0-form-control')
    // FIXME: Characters are typed very fast, but each stroke still triggers a geocoder call.
    await page.keyboard.type('arts center', { delay: 100 })
    await page.waitForTimeout(2000)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(200)
    await page.keyboard.press('Enter')

    await page.click('.search-plan-button-container button')
    await page.waitForTimeout(2000)

    // take screenshot
    await percySnapshotWithWait(page, 'Call Taker With Settings Adjusted')

    // Other steps are identical to desktop, so we end here to not waste screenshots.
    return
  }

  // Select a trip
  await page.waitForSelector('.option.metro-itin:nth-of-type(1)')
  await page.click('.option.metro-itin:nth-of-type(1)')

  await percySnapshotWithWait(page, 'Metro Itinerary Selected')

  // Open Trip Viewer
  // Triggers mock.har graphql query #5 (trip).
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

  // Open nearby viewer from trip viewer
  // Triggers mock.har graphql query #6, #7, and #8 (stop details, nearest places, nearest stops).
  await page.click(
    'div.trip-viewer-body > ol > li:nth-child(3) > div.stop-button-container > button'
  )
  await page.waitForSelector('.nearby-view')

  await percySnapshotWithWait(page, 'Nearby View')

  // Open schedule view
  await page.waitForTimeout(2000)
  await page.waitForSelector('a.pull-right')
  await page.click('a.pull-right')
  await page.waitForTimeout(500)
  // Request a schedule for a specific valid date in the past,
  // so it is different than today and triggers a full render of the schedule.
  await page.focus('input[type="date"]')
  await page.keyboard.type('08072023') // MMDDYYYY format.
  await page.waitForTimeout(2000)
  await percySnapshotWithWait(page, 'Schedule Viewer')

  // Open route viewer
  // Triggers mock.har graphql query #9.
  // FIXME: This action also results in a probably unneeded query to index/stops returning a large dataset.
  if (isMobile) {
    await page.click('.app-menu-icon')
    // Wait for animation
    await page.waitForTimeout(200)
    // Take screenshot of the sidebar while we are at it.
    await percySnapshotWithWait(page, 'Mobile Sidebar')
  }

  const [routeViewerLink] = await page.$x("//a[contains(., 'View Routes')]")
  await routeViewerLink.click()
  await page.waitForSelector('.route-viewer')
  await page.waitForTimeout(5000)

  await percySnapshotWithWait(page, 'Route Viewer')

  // Open Specific Route
  // Triggers mock.har graphql query #10 (route details), #11 and #12 (vehicle positions, twice).
  // FIXME: Investigate why twice.
  try {
    await page.$x("//span[contains(., 'Marietta Blvd')]")
  } catch {
    await page.reload({ waitUntil: 'networkidle0' })
  }
  const [busRouteButton] = await page.$x("//span[contains(., 'Marietta Blvd')]")
  await busRouteButton.click()

  await page.waitForTimeout(500)

  // click the little pattern arrow
  // Triggers mock.har graphql query #13 and #14 (vehicle positions, twice again).
  // FIXME: Investigate why twice.
  await page.click('#open-route-button-1-')

  // View the other pattern on the selected route.
  await page.click('#headsign-selector-label')
  await page.waitForTimeout(500)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')

  await page.waitForTimeout(500)

  // Go back to the first one.
  await page.click('#headsign-selector-label')
  await page.waitForTimeout(500)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')

  await page.waitForTimeout(1000)

  await percySnapshotWithWait(page, 'Pattern Viewer Showing Route 1')

  // Nearby viewer from pattern viewer
  // Triggers mock.har graphql query #15 (stop info), #16 (nearest amenities), #17 (stops by radius).
  await page.click('ol > li:nth-of-type(1) > button')
  await page.waitForSelector('.nearby-view')
  await page.waitForTimeout(1000)

  // Activate all layers
  // TODO: mocks for the layers.
  /*
  await page.$$eval('.maplibregl-map .layers-list input', (checks) =>
    checks.forEach((c) => c.click())
  )
  await page.waitForTimeout(1000)
  */

  // Go back to trip planner
  if (isMobile) {
    await page.click('.app-menu-icon')
    // Wait for animation
    await page.waitForTimeout(200)
  }
  const [planTripTabLink] = await page.$x("//a[contains(., 'Plan Trip')]")
  await planTripTabLink.click()
  await page.waitForSelector('.option')
  await page.waitForTimeout(3000)
  const [viewAllOptionsButton] = await page.$x(
    "//button[contains(., 'View all options')]"
  )
  await viewAllOptionsButton.click()
  await page.waitForTimeout(1000)

  // Select first itineary for printing
  // FIXME: Navigation out of print view is funky.
  await page.goto(`${page.url()}&ui_activeItinerary=0`)
  await page.waitForTimeout(2000)

  await page.click('.button-container:nth-of-type(2)')
  await page.waitForTimeout(500)
  if (isMobile) {
    // Printable itinerary screenshot on mobile only better page ration (and to save allowance).
    await percySnapshotWithWait(page, 'Printable Itinerary')
  }
}

test('OTP-RR Desktop', async () => {
  const page = await loadPath('/')
  await page.setViewport({
    height: 1080,
    width: 1920
  })
  page.on('console', async (msg) => {
    const args = await msg.args()
    args.forEach(async (arg) => {
      const val = await arg.jsonValue()
      // value is serializable
      if (JSON.stringify(val) !== JSON.stringify({})) console.log(val)
      // value is unserializable (or an empty oject)
      else {
        const { description, subtype, type } = arg._remoteObject
        console.log(
          `type: ${type}, subtype: ${subtype}, description:\n ${description}`
        )
      }
    })
  })
  // log all errors that were logged to the browser console
  page.on('warn', (warn) => {
    console.log(warn)
  })
  page.on('error', (error) => {
    console.error(error)
    console.error(error.stack)
  })
  // log all uncaught exceptions
  page.on('pageerror', (error) => {
    console.error(`Page Error: ${error}`)
  })
  // log all failed requests
  page.on('requestfailed', (req) => {
    console.error(`Request failed: ${req.method()} ${req.url()}`)
  })

  await executeTest(page, false, OTP_RR_UI_MODE === 'calltaker')
})

if (OTP_RR_UI_MODE !== 'calltaker') {
  // Non-calltaker test runs both mobile and desktop test.
  test('OTP-RR Mobile', async () => {
    const page = await loadPath('/')
    page.isMobile = true
    await page.setUserAgent('android')
    await page.setViewport({
      height: 1134,
      width: 750
    })
    // Need to reload to load mobile view properly
    await page.reload()

    // Execute the rest of the test
    await executeTest(page, true, false)
  })
}

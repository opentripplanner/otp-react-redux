/* eslint-disable jest/expect-expect */
/* We use a method to generate our assertions */

import execa from 'execa'
import puppeteer from 'puppeteer'

import '../__tests__/test-utils/mock-window-url'

import routes from '../lib/util/webapp-routes'

import { mockServer } from './mock-server'

const OTP_RR_TEST_CONFIG_PATH = '../a11y/test-config.yml'

const MOCK_SERVER_PORT = 9999

const DISABLED_ROUTES = ['/nearby', '/nearby/:latLon', '/schedule']

let browser, server
// These rules aren't relevant to this project
const disabledRules = [
  'region', // Leaflet does not comply
  'meta-viewport', // Leaflet does not comply
  'page-has-heading-one' // Heading is provided by logo
]

/**
 * Runs a11y tests on a given OTP-RR path using the test build. Relies on
 * the puppeteer browser running
 */
async function runAxeTestOnPath(otpPath) {
  const page = await browser.newPage()
  const filePath = `http://localhost:${MOCK_SERVER_PORT}/#${otpPath}`
  await Promise.all([
    page.setViewport({
      deviceScaleFactor: 1,
      height: 1080,
      width: 1920
    }),
    page.goto(filePath),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ])

  await expect(page).toPassAxeTests({ disabledRules })
  return page
}

beforeAll(async () => {
  // Build OTP-RR main.js using new config file
  execa.sync('env', [`YAML_CONFIG=${OTP_RR_TEST_CONFIG_PATH}`, 'yarn', 'build'])
  console.log('Built OTP-RR')

  // Launch mock OTP server
  server = mockServer.listen(MOCK_SERVER_PORT, () => {
    console.log(
      `Mock response server running on http://localhost:${MOCK_SERVER_PORT}`
    )
  })
  // Web security is disabled to allow requests to the mock OTP server
  browser = await puppeteer.launch({
    args: ['--disable-web-security']
  })
})

afterAll(async () => {
  await server.close()
  await browser.close()
  console.log('Closed mock server and headless browser')
})

// Puppeteer can take a long time to load, espeically in some ci environments
jest.setTimeout(600000)
routes.forEach((route) => {
  const { a11yIgnore, path: pathsToTest } = route
  if (a11yIgnore) {
    return
  }

  if (Array.isArray(pathsToTest)) {
    // Run test on each path in list.
    pathsToTest.forEach(async (p) => {
      if (!DISABLED_ROUTES.includes(p)) {
        test(`${p} should pass Axe Tests`, async () => runAxeTestOnPath(p))
      }
    })
  } else {
    // Otherwise run test on individual path
    if (!DISABLED_ROUTES.includes(pathsToTest)) {
      test(`${pathsToTest} should pass Axe Tests`, async () =>
        runAxeTestOnPath(pathsToTest))
    }
  }
})

test('Mocked Main Trip planner page should pass Axe Tests', async () => {
  await runAxeTestOnPath(
    '/?ui_activeSearch=0qoydlnut&ui_activeItinerary=0&fromPlace=1900%20Main%20Street%2C%20Houston%2C%20TX%2C%20USA%3A%3A29.750144%2C-95.370998&toPlace=800%20Congress%2C%20Houston%2C%20TX%2C%20USA%3A%3A29.76263%2C-95.362178&date=2021-08-04&time=08%3A14&arriveBy=false&mode=WALK%2CBUS%2CTRAM&showIntermediateStops=true&maxWalkDistance=1207&optimize=QUICK&walkSpeed=1.34&ignoreRealtimeUpdates=true&numItineraries=3&otherThanPreferredRoutesPenalty=900'
  )
})

test('Mocked Schedule Viewer and Dropdown should pass Axe tests', async () => {
  // Puppeteer can take a long time to load, espeically in some ci environments
  jest.setTimeout(600000)
  // Test Schedule viewer
  await runAxeTestOnPath('/schedule/Agency')
})

/* eslint-disable jest/expect-expect */
/* We use a method to generate our assertions */
import fs from 'fs'
import path from 'path'

import puppeteer from 'puppeteer'
import execa from 'execa'

import { routes } from '../lib/components/app/responsive-webapp'

import { mockServer } from './mock-server'

const OTP_RR_CONFIG_FILE_PATH = './config.yml'
const OTP_RR_CONFIG_BACKUP_PATH = './config.non-test.yml'
const OTP_RR_TEST_CONFIG_PATH = './a11y/test-config.yml'

const MOCK_SERVER_PORT = 9999

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
    page.goto(filePath),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ])

  await expect(page).toPassAxeTests({ disabledRules })
  return page
}

beforeAll(async () => {
  // backup current config file
  if (fs.existsSync(OTP_RR_CONFIG_FILE_PATH)) {
    fs.renameSync(OTP_RR_CONFIG_FILE_PATH, OTP_RR_CONFIG_BACKUP_PATH)
    console.log('Backed up current OTP-RR config file')
  }
  // copy over test config file
  fs.copyFileSync(OTP_RR_TEST_CONFIG_PATH, OTP_RR_CONFIG_FILE_PATH)
  console.log('Copied a11y test config file')

  // Build OTP-RR main.js using new config file
  execa.sync('yarn', ['build'])
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
  fs.unlinkSync(OTP_RR_CONFIG_FILE_PATH)
  if (fs.existsSync(OTP_RR_CONFIG_BACKUP_PATH)) {
    fs.renameSync(
      path.resolve(OTP_RR_CONFIG_BACKUP_PATH),
      path.resolve(OTP_RR_CONFIG_FILE_PATH)
    )
  }
  console.log('Restored original OTP-RR config file')
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
      test(`${p} should pass Axe Tests`, async () => runAxeTestOnPath(p))
    })
  } else {
    // Otherwise run test on individual path
    test(`${pathsToTest} should pass Axe Tests`, async () =>
      runAxeTestOnPath(pathsToTest))
  }
})

test('Mocked Main Trip planner page should pass Axe Tests', async () => {
  await runAxeTestOnPath(
    '/?ui_activeSearch=0qoydlnut&ui_activeItinerary=0&fromPlace=1900%20Main%20Street%2C%20Houston%2C%20TX%2C%20USA%3A%3A29.750144%2C-95.370998&toPlace=800%20Congress%2C%20Houston%2C%20TX%2C%20USA%3A%3A29.76263%2C-95.362178&date=2021-08-04&time=08%3A14&arriveBy=false&mode=WALK%2CBUS%2CTRAM&showIntermediateStops=true&maxWalkDistance=1207&optimize=QUICK&walkSpeed=1.34&ignoreRealtimeUpdates=true&numItineraries=3&otherThanPreferredRoutesPenalty=900'
  )
})

test('Mocked Stop Viewer and Dropdown should pass Axe tests', async () => {
  // Puppeteer can take a long time to load, espeically in some ci environments
  jest.setTimeout(600000)
  // Test stop viewer
  const stopViewerPage = await runAxeTestOnPath('/stop/Agency')
  await stopViewerPage.waitForTimeout(2000)
  await stopViewerPage.click('.expansion-button')
  await stopViewerPage.waitForTimeout(2000)
  await expect(stopViewerPage).toPassAxeTests({ disabledRules })
})

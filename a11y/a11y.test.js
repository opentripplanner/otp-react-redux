import fs from 'fs'
import path from 'path'

import puppeteer from 'puppeteer'
import execa from 'execa'

import { routes } from '../lib/components/app/responsive-webapp'

import { mockServer } from './mock-server'

const OTP_RR_CONFIG_FILE_PATH = './config.yml'
const OTP_RR_CONFIG_BACKUP_PATH = './config.non-test.yml'
const OTP_RR_TEST_CONFIG_PATH = './a11y/test-config.yml'

let browser, server
// These rules aren't relevant to this project
const disabledRules = [
  'region', // Leaflet does not comply
  'meta-viewport', // Leaflet does not comply
  'page-has-heading-one' // Heading is provided by logo
]

async function runAxeTestOnPath (otpPath) {
  const page = await browser.newPage()
  // Test trip planner
  const filePath = `file://${path.resolve(__dirname, '../index-for-puppeteer.html')}#/${otpPath}`
  await page.goto(filePath)

  await expect(page).toPassAxeTests({ disabledRules })
  return page
}

beforeEach(async () => {
  // backup current config file
  if (fs.existsSync(OTP_RR_CONFIG_FILE_PATH)) {
    fs.renameSync(
      OTP_RR_CONFIG_FILE_PATH,
      OTP_RR_CONFIG_BACKUP_PATH
    )
    console.log('Backed up current OTP-RR config file')
  }
  // copy over test config file
  fs.copyFileSync(
    OTP_RR_TEST_CONFIG_PATH,
    OTP_RR_CONFIG_FILE_PATH
  )
  console.log('Copied a11y test config file')

  // Build OTP-RR main.js using new config file
  execa.sync('yarn', ['build'])
  console.log('Built OTP-RR')

  // Launch mock OTP server
  const MOCK_SERVER_PORT = 9999
  server = mockServer.listen(MOCK_SERVER_PORT, () => {
    console.log(`Mock response server running on http://localhost:${MOCK_SERVER_PORT}`)
  })
  // Web security is disabled to allow requests to the mock OTP server
  browser = await puppeteer.launch({args: ['--disable-web-security']})
})

afterEach(async () => {
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

test('checks all base routes with Axe', async () => {
  jest.setTimeout(600000)
  routes.forEach(async (route) => {
    const {path: pathsToTest} = route
    if (Array.isArray(pathsToTest)) {
      // Run test on each path in list.
      pathsToTest.forEach(async (p) => {
        await runAxeTestOnPath(p)
      })
    } else {
      // Otherwise run test on individual path
      await runAxeTestOnPath(pathsToTest)
    }
  })
})

test('checks the test page with Axe', async () => {
  jest.setTimeout(600000)
  await runAxeTestOnPath('?ui_activeSearch=0qoydlnut&ui_activeItinerary=0&fromPlace=1900%20Main%20Street%2C%20Houston%2C%20TX%2C%20USA%3A%3A29.750144%2C-95.370998&toPlace=800%20Congress%2C%20Houston%2C%20TX%2C%20USA%3A%3A29.76263%2C-95.362178&date=2021-08-04&time=08%3A14&arriveBy=false&mode=WALK%2CBUS%2CTRAM&showIntermediateStops=true&maxWalkDistance=1207&optimize=QUICK&walkSpeed=1.34&ignoreRealtimeUpdates=true&numItineraries=3&otherThanPreferredRoutesPenalty=900')
  // Test stop viewer
  const stopViewerPage = await runAxeTestOnPath('stop/Agency:12345')
  await stopViewerPage.waitForTimeout(4000)
  await stopViewerPage.click('.expansion-button')
  await expect(stopViewerPage).toPassAxeTests({ disabledRules })
})

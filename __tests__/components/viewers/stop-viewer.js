import React from 'react'
import StopViewer from '../../../lib/components/viewers/stop-viewer'
import { restoreDateNowBehavior, setDefaultTestTime, setTestTime } from '../../test-utils'
import { getMockInitialState, mockWithProvider } from '../../test-utils/mock-data/store'

describe('components > viewers > stop viewer', () => {
  afterEach(restoreDateNowBehavior)
  beforeEach(setDefaultTestTime)

  it('should render with initial stop id and no stop times', () => {
    const mockState = getMockInitialState()
    mockState.otp.ui.viewedStop = {
      stopId: 'TriMet:13170'
    }

    expect(
      mockWithProvider(
        StopViewer,
        {},
        mockState
      ).snapshot()
    ).toMatchSnapshot()
  })

  it('should render with OTP transit index data', () => {
    const mockState = getMockInitialState()
    const stopId = 'TriMet:715'
    mockState.otp.ui.viewedStop = { stopId }
    mockState.otp.transitIndex.stops[stopId] = require('./mock-otp-transit-index-data.json')

    expect(
      mockWithProvider(
        StopViewer,
        {},
        mockState
      ).snapshot()
    ).toMatchSnapshot()
  })

  it('should render times after midnight with the correct day of week', () => {
    const mockState = getMockInitialState()
    const stopId = 'TriMet:9860'
    mockState.otp.ui.viewedStop = { stopId }
    mockState.otp.transitIndex.stops[stopId] = require('./mock-otp-transit-index-data-stop-9860.json')

    expect(
      mockWithProvider(
        StopViewer,
        {},
        mockState
      ).snapshot()
    ).toMatchSnapshot()
  })

  it('should render countdown times after midnight with no date if it is the previous day', () => {
    // Test time: Wednesday, August 7 at 11:58pm PT
    // First departure: Thursday, August 8 12:51am PT
    setTestTime(Date.UTC(2019, 7, 8, 6, 58, 56, 78))
    const mockState = getMockInitialState()
    const stopId = 'TriMet:9860'
    mockState.otp.ui.viewedStop = { stopId }
    mockState.otp.transitIndex.stops[stopId] = require('./mock-otp-transit-index-data-stop-9860.json')

    expect(
      mockWithProvider(
        StopViewer,
        {},
        mockState
      ).snapshot()
    ).toMatchSnapshot()
  })

  it('should render countdown times for stop times departing 48+ hours from start of service', () => {
    // Test time: Thursday, August 8 at 11:58pm PT
    // First departure: Friday, August 9 12:51am PT
    // Note: service day for stop time is Wednesday and departure is
    // 175860 (seconds since midnight).
    setTestTime(Date.UTC(2019, 7, 9, 6, 58, 56, 78))
    const mockState = getMockInitialState()
    const stopId = 'TriMet:9860'
    mockState.otp.ui.viewedStop = { stopId }
    mockState.otp.transitIndex.stops[stopId] = require('./mock-otp-transit-index-data-stop-9860-48-hr.json')

    expect(
      mockWithProvider(
        StopViewer,
        {},
        mockState
      ).snapshot()
    ).toMatchSnapshot()
  })

  it('should render with TriMet transit index data', () => {
    const mockState = getMockInitialState()
    mockState.otp.ui.viewedStop = {
      stopId: 'TriMet:715'
    }
    mockState.otp.transitIndex.stops['TriMet:715'] = require('./mock-trimet-transit-index-data.json')

    expect(
      mockWithProvider(
        StopViewer,
        {},
        mockState
      ).snapshot()
    ).toMatchSnapshot()
  })
})

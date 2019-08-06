import StopViewer from '../../../lib/components/viewers/stop-viewer'
import {restoreDateNowBehavior, setDefaultTestTime} from '../../test-utils'
import {getMockInitialState, mockWithProvider} from '../../test-utils/mock-data/store'

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
    mockState.otp.ui.viewedStop = {
      stopId: 'TriMet:715'
    }
    mockState.otp.transitIndex.stops['TriMet:715'] = require('./mock-otp-transit-index-data.json')

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

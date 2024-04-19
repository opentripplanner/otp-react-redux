import '../../test-utils/mock-window-url'
import {
  getMockInitialState,
  mockWithProvider
} from '../../test-utils/mock-data/store'
import NearbyView from '../../../lib/components/viewers/nearby/nearby-view'

import nearbyScootersInvalidDates from './nearby-mocks/nearby-scooters-invalid-dates.json'

describe('components > viewers > nearby view', () => {
  it('renders nothing on a blank page', () => {
    const mockState = getMockInitialState()
    mockState.otp.transitIndex.nearby = {
      data: []
    }
    mockState.router.location = { query: {} }
    expect(
      mockWithProvider(NearbyView, {}, mockState).snapshot()
    ).toMatchSnapshot()
  })

  it('renders proper scooter dates', () => {
    const mockState = getMockInitialState()
    mockState.otp.transitIndex.nearby = {
      data: nearbyScootersInvalidDates
    }
    mockState.router.location = { query: {} }
    expect(
      mockWithProvider(NearbyView, {}, mockState).snapshot()
    ).toMatchSnapshot()
  })
})

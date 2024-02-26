import '../../test-utils/mock-window-url'
import {
  getMockInitialState,
  mockWithProvider
} from '../../test-utils/mock-data/store'
import { restoreDateNowBehavior, setDefaultTestTime } from '../../test-utils'
import StopScheduleViewer from '../../../lib/components/viewers/stop-schedule-viewer'

describe('components > viewers > stop viewer', () => {
  afterEach(restoreDateNowBehavior)
  beforeEach(setDefaultTestTime)

  it('should render with initial stop id and no stop times', () => {
    const mockState = getMockInitialState()
    mockState.otp.ui.viewedStop = {
      stopId: 'TriMet:13170'
    }

    expect(
      mockWithProvider(StopScheduleViewer, {}, mockState).snapshot()
    ).toMatchSnapshot()
  })
})

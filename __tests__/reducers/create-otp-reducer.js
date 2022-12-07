import '../test-utils/mock-window-url'
import { getInitialState } from '../../lib/reducers/create-otp-reducer'
import { restoreDateNowBehavior, setDefaultTestTime } from '../test-utils'

describe('lib > reducers > create-otp-reducer', () => {
  afterEach(restoreDateNowBehavior)

  it('should be able to create the initial state', () => {
    setDefaultTestTime()
    expect(getInitialState({})).toMatchSnapshot()
  })
})

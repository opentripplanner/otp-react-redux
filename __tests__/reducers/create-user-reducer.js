import { getUserInitialState } from '../../lib/reducers/create-user-reducer'
import { restoreDateNowBehavior, setDefaultTestTime } from '../test-utils'

describe('lib > reducers > create-user-reducer', () => {
  afterEach(restoreDateNowBehavior)

  it('should be able to create the initial state', () => {
    setDefaultTestTime()
    expect(getUserInitialState({})).toMatchSnapshot()
  })
})

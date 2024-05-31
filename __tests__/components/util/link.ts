import '../../test-utils/mock-window-url'

import { isSubpath } from '../../../lib/components/util/link'

describe('components > util > Link > isSubpath', () => {
  it('should be true on a path that starts with the tracked path', () => {
    expect(isSubpath('/', '/')).toBeTruthy()
    expect(isSubpath('/trips', '/trips')).toBeTruthy()
    expect(isSubpath('/trips/trip123', '/trips')).toBeTruthy()
  })
  it('should be false on a path that starts differently than the tracked path', () => {
    expect(isSubpath('/trips/trip123', '/route')).toBeFalsy()
    expect(isSubpath('/', '/route')).toBeFalsy()
  })
  it('should be false if tracking home (/) and on a path that is not home.', () => {
    expect(isSubpath('/trips/trip123', '/')).toBeFalsy()
  })
})

import {isTransit} from '../../lib/util/itinerary'

describe('util > itinerary', () => {
  it('isTransit should work', () => {
    expect(isTransit('CAR')).toBeFalsy()
  })
})

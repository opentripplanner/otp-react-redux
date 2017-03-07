/* globals describe, expect, it */

import {getDefaultQuery} from '../../lib/util/state'

describe('util > state', () => {
  it('getDefaultQuery should parse window hash if available', () => {
    window.location.hash = '#plan?arriveBy=false&date=2017-02-03&fromPlace=12,34&toPlace=34,12&time=12:34'
    expect(getDefaultQuery()).toMatchSnapshot()
  })
})

/* globals describe, expect, it */

import {getDefaultQuery, queryIsValid} from '../../lib/util/state'

describe('util > state', () => {
  it('getDefaultQuery should parse window hash if available', () => {
    window.location.hash = '#plan?arriveBy=false&date=2017-02-03&fromPlace=12,34&toPlace=34,12&time=12:34'
    expect(getDefaultQuery()).toMatchSnapshot()
  })

  describe('queryIsValid', () => {
    const fakeFromLocation = {
      lat: 12,
      lon: 34
    }
    const fakeToLocation = {
      lat: 34,
      lon: 12
    }
    const testCases = [{
      expected: false,
      input: {
        currentQuery: {
          from: fakeFromLocation
        }
      },
      title: 'should not be valid with only from location'
    }, {
      expected: true,
      input: {
        currentQuery: {
          from: fakeFromLocation,
          to: fakeToLocation
        }
      },
      title: 'should be valid with from and to locations'
    }]

    testCases.forEach((testCase) => {
      it(testCase.title, () => {
        expect(queryIsValid(testCase.input))[testCase.expected ? 'toBeTruthy' : 'toBeFalsy']()
      })
    })
  })
})

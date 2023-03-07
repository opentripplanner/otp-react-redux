import { getAriaPhoneNumber } from '../../lib/util/a11y'

describe('util > a11y', () => {
  describe('getAriaPhoneNumber', () => {
    const testCases = [
      {
        expected: '8 7 7. 5 5 5. 1 2 3 4.',
        input: '(877) 555-1234'
      }
    ]

    testCases.forEach((testCase) => {
      it('should split US phone numbers for screen readers', () => {
        expect(getAriaPhoneNumber(testCase.input)).toEqual(testCase.expected)
      })
    })
  })
})

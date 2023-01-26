/* globals describe, expect, it */

import { getLanguageOptions } from '../../lib/util/i18n'

describe('util > i18n', () => {
  describe('getLanguageOptions', () => {
    const testCases = [
      {
        expected: {
          'en-US': {
            name: 'English (US)'
          },
          fr: {
            name: 'French'
          }
        },
        input: {
          allLanguages: {
            name: 'All Languages'
          },
          'en-US': {
            name: 'English (US)'
          },
          fr: {
            name: 'French'
          }
        }
      },
      {
        expected: null,
        input: {
          allLanguages: {
            name: 'All Languages'
          },
          'en-US': {
            name: 'English (US)'
          },
          fr: {
            label: 'French'
          }
        }
      },
      {
        expected: null,
        input: {
          allLanguages: {
            name: 'All Languages'
          },
          'en-US': {
            name: 'English (US)'
          }
        }
      }
    ]

    testCases.forEach((testCase) => {
      it('should show at least two language options or null', () => {
        expect(getLanguageOptions(testCase.input)).toEqual(testCase.expected)
      })
    })
  })
})

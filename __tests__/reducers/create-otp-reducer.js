/* globals describe, expect, it */

import createOtpReducer from '../../lib/reducers/create-otp-reducer'

describe('reducers > createOtpReducer >', () => {
  describe('default reducer handlers >', () => {
    it('should return default initial state', () => {
      const defaultReducer = createOtpReducer({}, {})
      expect(
        stripDateAndTimeFromReducerState(
          defaultReducer(undefined, {type: 'init'})
        )
      ).toMatchSnapshot()
    })

    it('should handle PLAN_REQUEST action', () => {
      const defaultReducer = createOtpReducer({}, {})
      const defaultReducerState = defaultReducer(undefined, {type: 'init'})
      expect(
        stripDateAndTimeFromReducerState(
          defaultReducer(defaultReducerState, {type: 'PLAN_REQUEST'})
        )
      ).toMatchSnapshot()
    })

    it('should handle PLAN_ERROR action', () => {
      const defaultReducer = createOtpReducer({}, {})
      const defaultReducerState = defaultReducer(undefined, {type: 'init'})
      const pendingReducerState = defaultReducer(defaultReducerState, {type: 'PLAN_REQUEST'})
      expect(
        stripDateAndTimeFromReducerState(
          defaultReducer(pendingReducerState, {
            type: 'PLAN_ERROR',
            payload: new Error('An error')
          })
        )
      ).toMatchSnapshot()
    })

    it('should handle PLAN_RESPONSE action', () => {
      const defaultReducer = createOtpReducer({}, {})
      const defaultReducerState = defaultReducer(undefined, {type: 'init'})
      const pendingReducerState = defaultReducer(defaultReducerState, {type: 'PLAN_REQUEST'})
      expect(
        stripDateAndTimeFromReducerState(
          defaultReducer(pendingReducerState, {
            type: 'PLAN_RESPONSE',
            payload: { fakeResponse: true }
          })
        )
      ).toMatchSnapshot()
    })
  })

  describe('reducer with postProcessor >', () => {
    it('should post-process results', () => {
      const postProcessor = jest.fn((state, results) => ({ processed: true }))
      const defaultReducer = createOtpReducer({}, {}, postProcessor)
      const defaultReducerState = defaultReducer(undefined, {type: 'init'})
      const pendingReducerState = defaultReducer(defaultReducerState, {type: 'PLAN_REQUEST'})
      expect(
        stripDateAndTimeFromReducerState(
          defaultReducer(pendingReducerState, {
            type: 'PLAN_RESPONSE',
            payload: { fakeResponse: true }
          })
        )
      ).toMatchSnapshot()
      expect(postProcessor.mock.calls).toMatchSnapshot()
    })
  })
})

function stripDateAndTimeFromQuery (query) {
  // assert that date and time exist and then remove them
  expect(query.date).toEqual(expect.stringMatching(/\d{4}-\d{2}-\d{2}/))
  delete query.date
  expect(query.time).toEqual(expect.stringMatching(/\d{2}:\d{2}/))
  delete query.time
}

function stripDateAndTimeFromReducerState (reducerState) {
  stripDateAndTimeFromQuery(reducerState.currentQuery)

  // also remove from searches
  if (reducerState.searches) {
    reducerState.searches.forEach(search => {
      stripDateAndTimeFromQuery(search.query)
    })
  }

  return reducerState
}

import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createHashHistory } from 'history'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { render } from '@testing-library/react'
import clone from 'lodash/cloneDeep'
import configureStore from 'redux-mock-store'
import React from 'react'
import thunk from 'redux-thunk'

import { getInitialState } from '../../../lib/reducers/create-otp-reducer'
import { getUserInitialState } from '../../../lib/reducers/create-user-reducer'

const history = createHashHistory()
const storeMiddleWare = [
  thunk,
  routerMiddleware(history) // for dispatching history actions
]

/**
 * Get the initial stop of the redux reducer for otp-rr
 */
export function getMockInitialState() {
  const mockConfig = {
    dateTime: { timeFormat: 'h:mm a' },
    initialQuery: {}
  }
  return clone({
    otp: getInitialState(mockConfig),
    router: connectRouter(history),
    user: getUserInitialState(mockConfig)
  })
}

/**
 * Mount a react component within a mock redux store. This mock redux store
 * accepts actions, but doesn't send any of those results to the reducers.
 * This function is primarily used for taking snapshots of components and
 * containers in order to verify that they are rendering expected values.
 */
export function mockWithProvider(
  ConnectedComponent,
  connectedComponentProps,
  storeState = getMockInitialState()
) {
  const store = configureStore(storeMiddleWare)(storeState)
  const { asFragment, container } = render(
    <IntlProvider defaultLocale="en-US" locale="en-US">
      <Provider store={store}>
        <ConnectedComponent {...connectedComponentProps} />
      </Provider>
    </IntlProvider>
  )

  return {
    snapshot: () => container,
    store,
    wrapper: container
  }
}

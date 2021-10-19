import React from 'react'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import Enzyme, {mount} from 'enzyme'
import EnzymeReactAdapter from 'enzyme-adapter-react-16'
import {mountToJson} from 'enzyme-to-json'
import { createHashHistory } from 'history'
import clone from 'lodash/cloneDeep'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { IntlProvider } from 'react-intl'

import {getInitialState} from '../../../lib/reducers/create-otp-reducer'

Enzyme.configure({ adapter: new EnzymeReactAdapter() })

const history = createHashHistory()
const storeMiddleWare = [
  thunk,
  routerMiddleware(history) // for dispatching history actions
]

/**
 * Get the initial stop of the redux reducer for otp-rr
 */
export function getMockInitialState () {
  const mockConfig = {
    initialQuery: {}
  }
  return clone({
    otp: getInitialState(mockConfig),
    router: connectRouter(history)
  })
}

/**
 * Mount a react component within a mock redux store. This mock redux store
 * accepts actions, but doesn't send any of those results to the reducers.
 * This function is primarily used for taking snapshots of components and
 * containers in order to verify that they are rendering expected values.
 */
export function mockWithProvider (
  ConnectedComponent,
  connectedComponentProps,
  storeState = getMockInitialState()
) {
  const store = configureStore(storeMiddleWare)(storeState)
  const wrapper = mount(
    <Provider store={store}>
      <IntlProvider>
        <ConnectedComponent {...connectedComponentProps} />
      </IntlProvider>
    </Provider>
  )

  return {
    snapshot: () => mountToJson(wrapper),
    store,
    wrapper
  }
}

// import this polyfill in order to make webapp compatible with IE 11
import 'es6-math'

// import necessary React/Redux libraries
import React from 'react'
import { render } from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import ReactGA from 'react-ga'

// import OTP-RR components
import { createHashHistory } from 'history'
import { connectRouter, routerMiddleware } from 'connected-react-router'

// CSS imports
import '../index.css'

import Webapp from './app'

import {
  createCallTakerReducer,
  createOtpReducer,
  createUserReducer
} from './index'

// Loads CSS path defined in webpack config
import(CSS)

// load the OTP configuration
const otpConfig = require(YAML_CONFIG)
// const { whyDidYouUpdate } = require('why-did-you-update')
// whyDidYouUpdate(React)

const history = createHashHistory()

const middleware = [
  thunk,
  routerMiddleware(history) // for dispatching history actions
]

// check if webpack is being ran in development mode. If so, enable redux-logger
if (process.env.NODE_ENV === 'development') {
  middleware.push(createLogger())
}

// set up the Redux store
const store = createStore(
  combineReducers({
    callTaker: createCallTakerReducer(),
    otp: createOtpReducer(otpConfig),
    router: connectRouter(history),
    user: createUserReducer(otpConfig) // add optional initial query here
  }),
  compose(applyMiddleware(...middleware))
)

// render the app
// The package react-hot-loader package says that it is fine to use the tool in
// production mode: https://www.npmjs.com/package/react-hot-loader#install
//
// "Note: You can safely install react-hot-loader as a regular dependency
// instead of a dev dependency as it automatically ensures it is not executed in
// production and the footprint is minimal."
//
// There have been some issues noticed with changing font-awesome icons while
// react-hot-loader is enabled. A refresh of the page/build script may be
// necessary in rare occasions.
// See https://github.com/ibi-group/trimet-mod-otp/pull/207
render(
  <Provider store={store}>
    <Webapp />
  </Provider>,
  document.getElementById('main')
)

// analytics
if (otpConfig.analytics && otpConfig.analytics.google) {
  ReactGA.initialize(otpConfig.analytics.google.globalSiteTag)
  ReactGA.pageview(window.location.pathname + window.location.search)
}

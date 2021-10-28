// import this polyfill in order to make webapp compatible with IE 11
import 'es6-math'

// import necessary React/Redux libraries
import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
import createLogger from 'redux-logger'
import React from 'react'
import ReactGA from 'react-ga'
import thunk from 'redux-thunk'
// import OTP-RR components
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createHashHistory } from 'history'

// CSS imports
import '../index.css'

import Webapp from './app'

import {
  createCallTakerReducer,
  createOtpReducer,
  createUserReducer
} from './index'

// Loads CSS path defined in webpack config
// The CSS variable is passed to this file by webpack's `DefinePlugin` that replaces the variable
// with its content at compile time (like C's `#define` preprocessor directive).
import(CSS)

// load the OTP configuration
// Defined in webpack config
// eslint-disable-next-line no-undef
const otpConfig = require(YAML_CONFIG)

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
    callTaker: createCallTakerReducer(otpConfig),
    otp: createOtpReducer(otpConfig),
    router: connectRouter(history),
    user: createUserReducer(otpConfig) // add optional initial query here
  }),
  compose(applyMiddleware(...middleware))
)

// render the app
render(
  <Provider store={store}>
    <Webapp />
  </Provider>,
  document.getElementById('main')
)

// analytics
if (
  process.env.NODE_ENV !== 'development' &&
  otpConfig.analytics &&
  otpConfig.analytics.google
) {
  ReactGA.initialize(otpConfig.analytics.google.globalSiteTag)
  ReactGA.pageview(window.location.pathname + window.location.search)
}

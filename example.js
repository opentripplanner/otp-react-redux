// import this polyfill in order to make webapp compatible with IE 11
import 'es6-math'

import {ClassicLegIcon, ClassicModeIcon} from '@opentripplanner/icons'
import { createHashHistory } from 'history'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import React from 'react'
import { render } from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'

// import OTP-RR components
import {
  BatchResultsScreen,
  BatchRoutingPanel,
  BatchSearchScreen,
  CallTakerControls,
  CallTakerPanel,
  CallTakerWindows,
  DefaultItinerary,
  DefaultMainPanel,
  MobileResultsScreen,
  MobileSearchScreen,
  ResponsiveWebapp,
  createCallTakerReducer,
  createOtpReducer,
  createUserReducer,
  otpUtils
} from './lib'
// load the OTP configuration
import otpConfig from './config.yml'

const isBatchRoutingEnabled = otpUtils.itinerary.isBatchRoutingEnabled(
  otpConfig
)
const isCallTakerModuleEnabled = !!otpConfig.datastoreUrl

// Set useCustomIcons to true to override classic icons with the exports from
// custom-icons.js
const useCustomIcons = false

// Define icon sets for modes.
let MyLegIcon = ClassicLegIcon
let MyModeIcon = ClassicModeIcon

if (useCustomIcons) {
  const CustomIcons = require('./custom-icons')
  MyLegIcon = CustomIcons.CustomLegIcon
  MyModeIcon = CustomIcons.CustomModeIcon
}

// Stubs for terms of service/storage for development purposes only.
// They are required if otpConfig.persistence.strategy === 'otp_middleware'
// (otherwise, a "Content not found" box will be shown).
// These components should be placed in their own files with appropriate content.
const TermsOfService = () => (
  <>
    <h1>Terms of Service</h1>
    <p>Content for terms of service.</p>
  </>
)
const TermsOfStorage = () => (
  <>
    <h1>Terms of Storage</h1>
    <p>Content for terms of storage.</p>
  </>
)

// define some application-wide components that should be used in
// various places. The following components can be provided here:
// - defaultMobileTitle (required)
// - ItineraryBody (required)
// - ItineraryFooter (optional)
// - LegIcon (required)
// - MainControls (optional)
// - MainPanel (required)
// - MapWindows (optional)
// - MobileResultsScreen (required)
// - MobileSearchScreen (required)
// - ModeIcon (required)
// - TermsOfService (required if otpConfig.persistence.strategy === 'otp_middleware')
// - TermsOfStorage (required if otpConfig.persistence.strategy === 'otp_middleware')
const components = {
  defaultMobileTitle: () => <div className='navbar-title'>OpenTripPlanner</div>,
  ItineraryBody: DefaultItinerary,
  LegIcon: MyLegIcon,
  MainControls: isCallTakerModuleEnabled ? CallTakerControls : null,
  MainPanel: isCallTakerModuleEnabled
    ? CallTakerPanel
    : isBatchRoutingEnabled
      ? BatchRoutingPanel
      : DefaultMainPanel,
  MapWindows: isCallTakerModuleEnabled ? CallTakerWindows : null,
  MobileResultsScreen: isBatchRoutingEnabled
    ? BatchResultsScreen
    : MobileResultsScreen,
  MobileSearchScreen: isBatchRoutingEnabled
    ? BatchSearchScreen
    : MobileSearchScreen,
  ModeIcon: MyModeIcon,
  TermsOfService,
  TermsOfStorage
}

const history = createHashHistory()
const middleware = [
  thunk,
  routerMiddleware(history) // for dispatching history actions
]

// check if app is being run in development mode. If so, enable redux-logger
if (process.env.NODE_ENV === 'development') {
  middleware.push(createLogger())
}

// set up the Redux store
const store = createStore(
  combineReducers({
    callTaker: createCallTakerReducer(),
    otp: createOtpReducer(otpConfig),
    user: createUserReducer(),
    router: connectRouter(history)
  }),
  compose(applyMiddleware(...middleware))
)

// render the app
render(
  (
    <Provider store={store}>
      {/**
       * Note: the ResponsiveWebapp creates a React context provider
       * (./util/contexts#ComponentContext to be specific) to supply custom
       * components to various other subcomponents throughout otp-react-redux. If
       * the ResponsiveWebapp is not used and instead some subcomponents that use
       * the components in the `components` variable are imported and rendered
       * outside of the ResponsiveWebapp component, then the ComponentContext will
       * need to wrap that component in order for the subcomponents to be able to
       * access the component context. For example:
       *
       * ```js
       * import RouteViewer from 'otp-react-redux/build/components/viewers/route-viewer'
       * import { ComponentContext } from 'otp-react-redux/build/util/contexts'
       *
       * const components = { ModeIcon: MyCustomModeIconComponent }
       * const ContextAwareRouteViewer = () => (
       *   <ComponentContext.Provider value={components}>
       *     <RouteViewer />
       *   <ComponentContext.Provider/>
       * )
       * ```
       */}
      <ResponsiveWebapp components={components} />
    </Provider>
  ),
  document.getElementById('root')
)

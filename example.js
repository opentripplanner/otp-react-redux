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
  CallHistoryWindow,
  CallTakerControls,
  CallTakerPanel,
  DefaultItinerary,
  DefaultMainPanel,
  FieldTripWindows,
  // GtfsRtVehicleOverlay,
  MailablesWindow,
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

// Define custom map overlays.
// customMapOverlays can be a single overlay element or an array of such elements.
// Each overlay must include a name prop (and a key prop if wrapping in an array).
// (Wrapping the overlays inside a React Fragment <> or other component will not work.)
const customMapOverlays = [
  // Uncomment the code below and change props to add GTFS-rt overlays.
  // <GtfsRtVehicleOverlay
  //   key='custom1'
  //   liveFeedUrl='https://gtfs-rt.example.com/feed1.pb'
  //   name='GTFS-rt Example Vehicles 1'
  // />,
  // <GtfsRtVehicleOverlay
  //   key='custom2'
  //   liveFeedUrl='https://gtfs-rt.example.com/feed2.pb'
  //   name='GTFS-rt Example Vehicles 2'
  //   routeDefinitionUrl='https://gtfs-rt.example.com/routes.json'
  //   visible
  // />
]

// define some application-wide components that should be used in
// various places. The following components can be provided here:
// - defaultMobileTitle (required)
// - getTransitiveRouteLabel (optional, with signature itineraryLeg => string)
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
  getCustomMapOverlays: () => customMapOverlays,
  /**
   * Example of a custom route label provider to pass to @opentripplanner/core-utils/map#itineraryToTransitive.
   * @param {*} itineraryLeg The OTP itinerary leg for which to obtain a custom route label.
   * @returns A string with the custom label to display for the given leg, or null to render no label.
   */
  getTransitiveRouteLabel: itineraryLeg => {
    if (itineraryLeg.mode === 'RAIL') return 'Train'
    if (itineraryLeg.mode === 'BUS') return itineraryLeg.routeShortName
    return null // null or undefined or empty string will tell transitive-js to not render a route label.
  },
  ItineraryBody: DefaultItinerary,
  LegIcon: MyLegIcon,
  MainControls: isCallTakerModuleEnabled ? CallTakerControls : null,
  MainPanel: isCallTakerModuleEnabled
    ? CallTakerPanel
    : isBatchRoutingEnabled
      ? BatchRoutingPanel
      : DefaultMainPanel,
  MapWindows: isCallTakerModuleEnabled
    ? () => <>
      <CallHistoryWindow />
      <FieldTripWindows />
      <MailablesWindow />
    </>
    : null,
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
    callTaker: createCallTakerReducer(otpConfig),
    otp: createOtpReducer(otpConfig),
    router: connectRouter(history),
    user: createUserReducer()
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

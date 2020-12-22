// import this polyfill in order to make webapp compatible with IE 11
import 'es6-math'

import {ClassicLegIcon, ClassicModeIcon} from '@opentripplanner/icons'
import { createHashHistory } from 'history'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import React, { Component } from 'react'
import { render } from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'

// import Bootstrap Grid components for layout
import { Grid, Row, Col } from 'react-bootstrap'

// import OTP-RR components
import {
  CallTakerControls,
  CallTakerPanel,
  CallTakerWindows,
  DefaultItinerary,
  FieldTripWindows,
  DefaultMainPanel,
  DesktopNav,
  BatchRoutingPanel,
  Map,
  MobileMain,
  ResponsiveWebapp,
  createCallTakerReducer,
  createOtpReducer,
  createUserReducer
} from './lib'
// load the OTP configuration
import otpConfig from './config.yml'

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

// define some application-wide components that should be used in
// various places. The following components can be provided here:
// - ItineraryBody (required)
// - ItineraryFooter (optional)
// - LegIcon (required)
// - ModeIcon (required)
const components = {
  ItineraryBody: DefaultItinerary,
  LegIcon: MyLegIcon,
  ModeIcon: MyModeIcon
}

// Get the initial query from config (for demo/testing purposes).
const {initialQuery} = otpConfig
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
    otp: createOtpReducer(otpConfig, initialQuery),
    user: createUserReducer(),
    router: connectRouter(history)
  }),
  compose(applyMiddleware(...middleware))
)

// define a simple responsive UI using Bootstrap and OTP-RR
class OtpRRExample extends Component {
  render () {
    /** desktop view **/
    const desktopView = (
      <div className='otp'>
        <DesktopNav />
        <Grid>
          <Row className='main-row'>
            <Col sm={6} md={4} className='sidebar'>
              {/*
                Note: the main tag provides a way for users of screen readers
                to skip to the primary page content.
                TODO: Find a better place.
              */}
              <main>
                {/* TODO: extract the BATCH elements out of CallTakerPanel. */}
                {otpConfig.datastoreUrl
                  ? <CallTakerPanel />
                  : otpConfig.routingTypes.find(t => t.key === 'BATCH')
                    ? <BatchRoutingPanel />
                    : <DefaultMainPanel />
                }
              </main>
            </Col>
            {otpConfig.datastoreUrl ? <CallTakerControls /> : null}
            <Col sm={6} md={8} className='map-container'>
              {otpConfig.datastoreUrl
                ? <>
                  <CallTakerWindows />
                  <FieldTripWindows />
                </>
                : null
              }
              <Map />
            </Col>
          </Row>
        </Grid>
      </div>
    )

    /** mobile view **/
    const mobileView = (
      // <main> Needed for accessibility checks. TODO: Find a better place.
      <main>
        <MobileMain
          map={<Map />}
          title={<div className='navbar-title'>OpenTripPlanner</div>}
        />
      </main>
    )

    /**
     * The main webapp.
     *
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
     * const components = {
     *   ModeIcon: MyCustomModeIconComponent
     * }
     * const ContextAwareRouteViewer = () => (
     *   <ComponentContext.Provider value={components}>
     *     <RouteViewer />
     *   <ComponentContext.Provider/>
     * )
     * ```
     */
    return (
      <ResponsiveWebapp
        components={components}
        desktopView={desktopView}
        mobileView={mobileView}
      />
    )
  }
}

// render the app
render(
  (
    <Provider store={store}>
      { /**
     * If not using router history, simply include OtpRRExample here:
     * e.g.
     * <OtpRRExample />
     */
      }
      <OtpRRExample />
    </Provider>
  )
  ,

  document.getElementById('root')
)
